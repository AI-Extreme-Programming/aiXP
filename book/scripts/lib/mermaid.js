import crypto from 'node:crypto';
import { scanLines } from './markdown.js';

export function diagramId(source) {
  return crypto.createHash('sha256').update(source.replace(/\r\n?/g, '\n')).digest('hex').slice(0, 16);
}

// Replaces each ```mermaid fence with the line returned by imageLine(diagram).
export function extractMermaid(lines, imageLine) {
  const diagrams = [];
  const out = [];
  let current = null;
  for (const info of scanLines(lines)) {
    const line = lines[info.index];
    if (info.role === 'open' && info.fence.lang === 'mermaid') {
      current = { file: line.file, line: line.line, indent: /^\s*/.exec(line.text)[0], body: [] };
      continue;
    }
    if (current) {
      if (info.role === 'close') {
        const source = current.body.join('\n');
        const diagram = { id: diagramId(source), source, file: current.file, line: current.line };
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
