import path from 'node:path';
import zlib from 'node:zlib';

// Reads a zip archive's central directory. Supports the stored and deflate methods Pandoc uses.
export function readZip(buffer) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error('not a zip archive');
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = [];
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('corrupt zip central directory');
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    const dataStart = localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28);
    entries.push({ name, method, localOffset, data: buffer.subarray(dataStart, dataStart + compressedSize) });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  const files = new Map();
  for (const entry of entries) {
    if (entry.method !== 0 && entry.method !== 8) throw new Error(`${entry.name}: unsupported zip method ${entry.method}`);
    files.set(entry.name, entry.method === 8 ? zlib.inflateRawSync(entry.data) : Buffer.from(entry.data));
  }
  return { order: entries.map((e) => ({ name: e.name, method: e.method })), files };
}

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

function topLevelTocHrefs(navXhtml) {
  const start = navXhtml.search(/<nav[^>]*epub:type="toc"/);
  if (start === -1) return [];
  const nav = navXhtml.slice(start, navXhtml.indexOf('</nav>', start));
  const hrefs = [];
  let depth = 0;
  for (const m of nav.matchAll(/<ol\b|<\/ol>|<a\s[^>]*>/g)) {
    if (m[0] === '</ol>') depth--;
    else if (m[0].startsWith('<ol')) depth++;
    else if (depth === 1) hrefs.push(attr(m[0], 'href'));
  }
  return hrefs;
}

// Summarises the structure of a Pandoc-built EPUB without returning any body text.
export function inspectEpub(buffer) {
  const { order, files } = readZip(buffer);
  const text = (name) => files.get(name)?.toString('utf8');
  const container = text('META-INF/container.xml') ?? '';
  const opfPath = attr(/<rootfile\s[^>]*>/.exec(container)?.[0] ?? '', 'full-path');
  if (!opfPath || !files.has(opfPath)) throw new Error('EPUB has no package document');
  const opf = text(opfPath);
  const opfDir = path.posix.dirname(opfPath);
  const resolve = (from, href) => path.posix.normalize(path.posix.join(path.posix.dirname(from), href));

  const manifest = new Map();
  for (const m of opf.matchAll(/<item\s[^>]*>/g)) {
    manifest.set(attr(m[0], 'id'), { href: path.posix.join(opfDir, attr(m[0], 'href')), mediaType: attr(m[0], 'media-type'), properties: attr(m[0], 'properties') ?? '' });
  }
  const items = [...manifest.values()];
  const spine = [...opf.matchAll(/<itemref\s[^>]*>/g)].map((m) => manifest.get(attr(m[0], 'idref'))?.href);
  const nav = items.find((i) => i.properties.split(/\s+/).includes('nav'));
  const coverImage = items.find((i) => i.properties.split(/\s+/).includes('cover-image'));

  const ids = new Map();
  const documents = items.filter((i) => i.mediaType === 'application/xhtml+xml');
  for (const doc of documents) ids.set(doc.href, new Set([...text(doc.href).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

  const brokenLinks = [];
  let internalLinks = 0;
  let crossDocumentLinks = 0;
  const images = [];
  const classes = new Set();
  const sectionTypes = new Set();
  for (const doc of documents) {
    const xhtml = text(doc.href);
    for (const m of xhtml.matchAll(/<a\s[^>]*>/g)) {
      const href = attr(m[0], 'href');
      if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
      const [file, fragment] = href.split('#');
      const target = file ? resolve(doc.href, decodeURI(file)) : doc.href;
      if (doc !== nav) {
        internalLinks++;
        if (target !== doc.href) crossDocumentLinks++;
      }
      if (!ids.has(target) || (fragment && !ids.get(target).has(decodeURIComponent(fragment)))) brokenLinks.push(`${doc.href} -> ${href}`);
    }
    for (const m of xhtml.matchAll(/<img\s[^>]*>/g)) {
      const src = resolve(doc.href, attr(m[0], 'src') ?? '');
      images.push({ document: doc.href, src, mediaType: items.find((i) => i.href === src)?.mediaType, alt: decodeEntities(attr(m[0], 'alt') ?? '') });
    }
    for (const m of xhtml.matchAll(/<(?:section|div)\s[^>]*class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) classes.add(c);
    for (const m of xhtml.matchAll(/<section\s[^>]*epub:type="([^"]+)"/g)) for (const t of m[1].split(/\s+/)) sectionTypes.add(t);
  }

  const tocHrefs = nav ? topLevelTocHrefs(text(nav.href)).map((h) => resolve(nav.href, h)) : [];
  for (const href of tocHrefs) {
    const [file, fragment] = href.split('#');
    if (!ids.has(file) || (fragment && !ids.get(file).has(fragment))) brokenLinks.push(`nav -> ${href}`);
  }

  const metadata = {};
  for (const m of opf.matchAll(/<dc:(\w+)(\s[^>]*)?>([^<]*)<\/dc:\1>/g)) (metadata[m[1]] ??= []).push(decodeEntities(m[3]));
  const uniqueId = attr(/<package\s[^>]*>/.exec(opf)?.[0] ?? '', 'unique-identifier');
  const identifier = new RegExp(`<dc:identifier[^>]*id="${uniqueId}"[^>]*>([^<]*)<`).exec(opf)?.[1];

  return {
    mimetypeFirst: order[0]?.name === 'mimetype' && order[0].method === 0 && text('mimetype') === 'application/epub+zip',
    metadata,
    uniqueIdentifier: identifier ? decodeEntities(identifier) : null,
    coverImage: coverImage ? { href: coverImage.href, mediaType: coverImage.mediaType } : null,
    spine,
    tocFragments: tocHrefs.map((h) => h.split('#')[1] ?? ''),
    internalLinks,
    crossDocumentLinks,
    brokenLinks,
    images,
    sectionClasses: classes,
    sectionTypes,
  };
}

// Structural expectations the build enforces in addition to epubcheck.
export function structureProblems(summary, { chapterPrefixes }) {
  const problems = [];
  if (!summary.mimetypeFirst) problems.push('mimetype is not the first, uncompressed entry');
  if (!summary.coverImage) problems.push('no cover-image in the manifest');
  const tocPrefixes = summary.tocFragments.map((f) => f.split('--')[0]);
  if (tocPrefixes.join('\n') !== chapterPrefixes.join('\n')) {
    problems.push(`table of contents chapters [${tocPrefixes.join(', ')}] do not match sidebar order [${chapterPrefixes.join(', ')}]`);
  }
  for (const link of summary.brokenLinks) problems.push(`broken link ${link}`);
  for (const image of summary.images) {
    if (!image.alt.trim()) problems.push(`image ${image.src} in ${image.document} has empty alt text`);
    if (!image.mediaType) problems.push(`image ${image.src} in ${image.document} is not in the manifest`);
  }
  for (const cls of ['title-page', 'colophon']) if (!summary.sectionClasses.has(cls)) problems.push(`no ${cls} section`);
  for (const type of ['titlepage', 'colophon']) if (!summary.sectionTypes.has(type)) problems.push(`no section with epub:type="${type}"`);
  return problems;
}
