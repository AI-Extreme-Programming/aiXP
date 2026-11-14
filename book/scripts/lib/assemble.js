import fs from 'node:fs';
import path from 'node:path';
import { loadSidebarFiles } from './sidebar.js';
import { expandFile } from './includes.js';
import {
  assignPageSlugs,
  findHeadings,
  parseAtxHeading,
  splitHeadingContent,
  splitLines,
  unclosedFence,
  vitepressSlugify,
} from './markdown.js';
import { rewriteLinks } from './links.js';
import { extractMermaid, pandocAttributeValue, uniqueDiagrams } from './mermaid.js';
import { fillTemplate, metadataBlock, readBookMetadata, templateValues } from './template.js';
import { DIAGRAM_FORMAT } from './render-mermaid.js';

export function bookPaths(root) {
  return {
    root,
    config: path.join(root, 'docs', '.vitepress', 'config.mts'),
    metadata: path.join(root, 'book', 'metadata.yaml'),
    titlePage: path.join(root, 'book', 'frontmatter', 'title-page.md'),
    colophon: path.join(root, 'book', 'frontmatter', 'colophon.template.md'),
    versionFile: path.join(root, 'notes', 'VERSION.md'),
  };
}

export class BuildErrors extends Error {
  constructor(messages) {
    super(messages.join('\n'));
    this.messages = messages;
  }
}

const toPosix = (p) => p.split(path.sep).join('/');

// VitePress page links may omit the extension, and slugs like 01.00-intro contain dots,
// so anything that is not an existing non-page file is treated as a page link.
function isPageLink(raw, abs) {
  if (raw.endsWith('/') || abs.endsWith('.md') || abs.endsWith('.html')) return true;
  return !(fs.existsSync(abs) && fs.statSync(abs).isFile());
}

function pageFile(abs, raw) {
  if (raw.endsWith('/')) return path.join(abs, 'index.md');
  if (abs.endsWith('.html')) return abs.slice(0, -5) + '.md';
  if (!abs.endsWith('.md')) return abs + '.md';
  return abs;
}

export function chapterPrefix(file) {
  return vitepressSlugify(`ch ${path.basename(file, path.extname(file))}`);
}

function templatePart(file, values, prefix, display) {
  const text = fillTemplate(fs.readFileSync(file, 'utf8'), values, display(file));
  return { prefix, file, template: true, lines: splitLines(text).map((t, i) => ({ text: t, file, line: i })) };
}

const identity = (line) => `${line.file}:${line.line}`;

function rewriteHeadingLine(text, heading, id) {
  const parsed = heading.kind === 'atx' ? parseAtxHeading(text) : { level: heading.level, ...splitHeadingContent(text.trim()) };
  const attrs = [`#${id}`, ...parsed.attributes].join(' ');
  return `${'#'.repeat(parsed.level)} ${parsed.content} {${attrs}}`.replace(/^(#+)  /, '$1 ');
}

// Builds the unified Pandoc Markdown for one target. Pure apart from reading source files.
export function assembleBook({ root, target, build, outDir }) {
  if (!DIAGRAM_FORMAT[target]) throw new Error(`unknown target "${target}"`);
  const paths = bookPaths(root);
  const display = (f) => toPosix(path.relative(root, f));
  const errors = [];

  const { files: chapterFiles, srcDir, base } = loadSidebarFiles(paths.config);
  const values = templateValues(readBookMetadata(paths.metadata), build);
  const expandOptions = { srcDir, display };

  const parts = [
    templatePart(paths.titlePage, values, 'title-page', display),
    templatePart(paths.colophon, values, 'colophon', display),
  ];
  for (const file of chapterFiles) {
    try {
      parts.push({ prefix: chapterPrefix(file), file, lines: expandFile(file, expandOptions) });
    } catch (error) {
      errors.push(error.message);
    }
  }

  const bookPages = new Set();
  for (const part of parts) {
    if (part.template) continue;
    for (const line of part.lines) bookPages.add(line.file);
  }

  const bookIds = new Map();
  const allIds = new Set();
  for (const part of parts) {
    const fence = unclosedFence(part.lines);
    if (fence) {
      const opener = part.lines[fence.start];
      errors.push(`${display(opener.file)}:${opener.line + 1}: unclosed code fence`);
      part.headings = [];
      continue;
    }
    const headings = findHeadings(part.lines);
    let slugs;
    try {
      slugs = assignPageSlugs(headings);
    } catch (error) {
      errors.push(`${display(part.file)}: ${error.message}`);
      part.headings = [];
      continue;
    }
    part.headings = headings.map((heading, i) => ({ heading, id: `${part.prefix}--${slugs[i]}` }));
    for (const { heading, id } of part.headings) {
      if (allIds.has(id)) errors.push(`${display(part.file)}: duplicate book heading id "${id}"`);
      allIds.add(id);
      const key = identity(part.lines[heading.index]);
      if (!bookIds.has(key)) bookIds.set(key, id);
    }
  }

  const pageAnchors = new Map();
  const anchorsFor = (file) => {
    if (!pageAnchors.has(file)) {
      const lines = expandFile(file, expandOptions);
      const headings = findHeadings(lines);
      const slugs = assignPageSlugs(headings);
      const bySlug = new Map(headings.map((h, i) => [slugs[i], identity(lines[h.index])]));
      pageAnchors.set(file, { bySlug, first: headings[0] ? identity(lines[headings[0].index]) : null });
    }
    return pageAnchors.get(file);
  };

  const resolve = ({ destination, kind, file }) => {
    const hash = destination.indexOf('#');
    const rawPath = (hash === -1 ? destination : destination.slice(0, hash)).replace(/\?.*$/, '');
    const anchor = hash === -1 ? null : decodeURIComponent(destination.slice(hash + 1));
    let targetFile = file;
    if (rawPath !== '') {
      let p = decodeURI(rawPath);
      let abs;
      if (p.startsWith('/')) {
        if (base !== '/' && p.startsWith(base)) p = '/' + p.slice(base.length);
        abs = path.join(srcDir, ...p.split('/'));
      } else {
        abs = path.resolve(path.dirname(file), p);
      }
      if (kind === 'image' || !isPageLink(p, abs)) {
        if (kind !== 'image' && kind !== 'definition') throw new Error('links to files outside the book cannot be resolved');
        if (!fs.existsSync(abs)) throw new Error('file not found');
        return toPosix(path.relative(root, abs));
      }
      targetFile = pageFile(abs, p);
    }
    if (!bookPages.has(targetFile)) throw new Error(`${display(targetFile)} is not part of the book`);
    const page = anchorsFor(targetFile);
    const key = anchor === null ? page.first : page.bySlug.get(anchor);
    if (!key) {
      throw new Error(anchor === null ? `${display(targetFile)} has no heading to link to` : `anchor "#${anchor}" not found in ${display(targetFile)}`);
    }
    const id = bookIds.get(key);
    if (!id) throw new Error(`target heading in ${display(targetFile)} is not in the book`);
    return `#${id}`;
  };

  let linkCount = 0;
  const format = DIAGRAM_FORMAT[target];
  const diagramDir = path.join(outDir, target, 'mermaid');
  const imageLine = (d) => `![](${toPosix(path.relative(root, path.join(diagramDir, `mermaid-${d.id}.${format}`)))}){alt="${pandocAttributeValue(d.alt)}"}`;
  const diagrams = [];

  for (const part of parts) {
    if (!part.headings) continue;
    const rewritten = rewriteLinks(part.lines, resolve);
    linkCount += rewritten.count;
    for (const e of rewritten.errors) {
      errors.push(`${display(e.file)}:${e.line + 1}: link "${e.destination}": ${e.message}`);
    }
    const lines = rewritten.lines;
    const drop = new Set();
    for (const { heading, id } of part.headings) {
      lines[heading.index] = { ...lines[heading.index], text: rewriteHeadingLine(lines[heading.index].text, heading, id) };
      if (heading.kind === 'setext') drop.add(heading.underline);
    }
    const kept = lines.filter((_, i) => !drop.has(i));
    try {
      const extracted = extractMermaid(kept, imageLine);
      part.output = extracted.lines;
      diagrams.push(...extracted.diagrams);
    } catch (error) {
      errors.push(`${display(part.file)}: ${error.message}`);
    }
  }

  if (errors.length) throw new BuildErrors(errors);

  const body = parts.map((part) => part.output.map((l) => l.text).join('\n')).join('\n\n');
  return {
    text: `${metadataBlock(build, target)}\n\n${body}\n`,
    diagrams: uniqueDiagrams(diagrams),
    diagramDir,
    stats: {
      chapters: chapterFiles.length,
      includedFiles: bookPages.size - chapterFiles.length,
      links: linkCount,
      headings: allIds.size,
      diagrams: diagrams.length,
    },
  };
}
