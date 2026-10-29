import crypto from 'node:crypto';
import { headingPlainText, parseAtxHeading, scanLines } from './markdown.js';

export function diagramId(source) {
  return crypto.createHash('sha256').update(source.replace(/\r\n?/g, '\n')).digest('hex').slice(0, 16);
}

const DIAGRAM_TYPES = [
  [/^(flowchart|graph)\b/, 'Flowchart'],
  [/^sequenceDiagram\b/, 'Sequence diagram'],
  [/^classDiagram\b/, 'Class diagram'],
  [/^stateDiagram/, 'State diagram'],
  [/^erDiagram\b/, 'Entity relationship diagram'],
  [/^journey\b/, 'User journey diagram'],
  [/^gantt\b/, 'Gantt chart'],
  [/^pie\b/, 'Pie chart'],
  [/^gitGraph\b/, 'Git graph'],
  [/^mindmap\b/, 'Mind map'],
  [/^timeline\b/, 'Timeline'],
  [/^quadrantChart\b/, 'Quadrant chart'],
];

const squash = (text) => text.replace(/\s+/g, ' ').trim();

function diagramType(lines) {
  let inFrontmatter = false;
  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();
    if (i === 0 && line === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line === '---') inFrontmatter = false;
      continue;
    }
    if (!line || line.startsWith('%%')) continue;
    return DIAGRAM_TYPES.find(([pattern]) => pattern.test(line))?.[1] ?? 'Diagram';
  }
  return 'Diagram';
}

// Prefers Mermaid's accTitle/accDescr; otherwise names the diagram type and its section.
export function diagramAltText(source, { section } = {}) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  let description = '';
  for (let i = 0; i < lines.length; i++) {
    const titleMatch = /^\s*accTitle\s*:\s*(.*)$/.exec(lines[i]);
    if (titleMatch) title = squash(titleMatch[1]);
    const descrMatch = /^\s*accDescr\s*:\s*(.*)$/.exec(lines[i]);
    if (descrMatch) description = squash(descrMatch[1]);
    const blockMatch = /^\s*accDescr\s*\{(.*)$/.exec(lines[i]);
    if (blockMatch) {
      const body = [blockMatch[1]];
      while (!body[body.length - 1].includes('}') && i + 1 < lines.length) body.push(lines[++i]);
      description = squash(body.join(' ').replace(/\}.*$/, ''));
    }
  }
  if (title && description) return `${title.replace(/[.\s]+$/, '')}. ${description}`;
  if (title || description) return title || description;
  const type = diagramType(lines);
  const heading = section ? squash(headingPlainText(section)) : '';
  return heading ? `${type}: ${heading}` : type;
}

// Pandoc decodes HTML entities in quoted attribute values but drops a backslash escape.
export function pandocAttributeValue(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\\/g, '&#92;');
}

// Replaces each ```mermaid fence with the line returned by imageLine(diagram).
export function extractMermaid(lines, imageLine) {
  const diagrams = [];
  const out = [];
  let current = null;
  let section;
  for (const info of scanLines(lines)) {
    const line = lines[info.index];
    if (info.role === 'text') {
      const heading = parseAtxHeading(line.text);
      if (heading) section = heading.content;
    }
    if (info.role === 'open' && info.fence.lang === 'mermaid') {
      current = { file: line.file, line: line.line, indent: /^\s*/.exec(line.text)[0], body: [] };
      continue;
    }
    if (current) {
      if (info.role === 'close') {
        const source = current.body.join('\n');
        const diagram = {
          id: diagramId(source),
          source,
          file: current.file,
          line: current.line,
          alt: diagramAltText(source, { section }),
        };
        diagrams.push(diagram);
        out.push({ ...line, file: current.file, line: current.line, text: current.indent + imageLine(diagram) });
        current = null;
      } else {
        current.body.push(line.text);
      }
      continue;
    }
    out.push(line);
  }
  if (current) throw new Error(`unclosed mermaid block in ${current.file}`);
  return { lines: out, diagrams };
}

export function uniqueDiagrams(diagrams) {
  const byId = new Map();
  for (const diagram of diagrams) if (!byId.has(diagram.id)) byId.set(diagram.id, diagram);
  return [...byId.values()];
}
