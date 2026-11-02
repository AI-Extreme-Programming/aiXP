import { scanLines } from './markdown.js';

// Replaces inline code spans with same-length filler so link scanning ignores them.
export function maskCodeSpans(text) {
  return text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (m) => ' '.repeat(m.length));
}

function readDestination(text, start) {
  let i = start;
  while (text[i] === ' ' || text[i] === '\t') i++;
  if (text[i] === '<') {
    const end = text.indexOf('>', i + 1);
    if (end === -1) return null;
    return { start: i + 1, end, after: end + 1 };
  }
  const destStart = i;
  let depth = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\') i += 2;
    else if (ch === '(') {
      depth++;
      i++;
    } else if (ch === ')') {
      if (depth === 0) break;
      depth--;
      i++;
    } else if (/\s/.test(ch)) break;
    else i++;
  }
  if (i === destStart) return null;
  return { start: destStart, end: i, after: i };
}

function isImage(masked, closeBracket) {
  let depth = 0;
  for (let i = closeBracket; i >= 0; i--) {
    if (masked[i] === ']' && masked[i - 1] !== '\\') depth++;
    else if (masked[i] === '[' && masked[i - 1] !== '\\') {
      depth--;
      if (depth === 0) return masked[i - 1] === '!';
    }
  }
  return false;
}

// Finds link and image destinations in one line: inline, reference definitions, and raw HTML href/src.
export function findDestinations(text) {
  const masked = maskCodeSpans(text);
  const found = [];
  const definition = /^ {0,3}\[[^\]]+\]:[ \t]*/.exec(masked);
  if (definition) {
    const dest = readDestination(masked, definition[0].length);
    if (dest) found.push({ start: dest.start, end: dest.end, kind: 'definition' });
  }
  for (let i = masked.indexOf(']('); i !== -1; i = masked.indexOf('](', i + 2)) {
    if (masked[i - 1] === '\\') continue;
    const dest = readDestination(masked, i + 2);
    if (dest) found.push({ start: dest.start, end: dest.end, kind: isImage(masked, i) ? 'image' : 'link' });
  }
  const html = /<(?:a|img)\b[^>]*?\s(href|src)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  for (let m = html.exec(masked); m; m = html.exec(masked)) {
    const value = m[3] ?? m[4];
    const start = m.index + m[0].length - value.length - 1;
    found.push({ start, end: start + value.length, kind: m[1].toLowerCase() === 'src' ? 'image' : 'link' });
  }
  return found
    .filter((d) => d.end > d.start)
    .sort((a, b) => a.start - b.start)
    .map((d) => ({ ...d, destination: text.slice(d.start, d.end) }));
}

export const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

// Rewrites every local destination in attributed lines via resolve({ destination, kind, file }).
// resolve returns the replacement string or throws an Error whose message explains the failure.
export function rewriteLinks(lines, resolve) {
  const errors = [];
  let count = 0;
  const out = lines.map((line) => ({ ...line }));
  for (const info of scanLines(out)) {
    if (info.inFence) continue;
    const line = out[info.index];
    const destinations = findDestinations(line.text).filter((d) => !EXTERNAL.test(d.destination));
    if (destinations.length === 0) continue;
    let text = line.text;
    for (const d of destinations.reverse()) {
      try {
        const replacement = resolve({ destination: d.destination, kind: d.kind, file: line.file });
        text = text.slice(0, d.start) + replacement + text.slice(d.end);
        count++;
      } catch (error) {
        errors.push({ file: line.file, line: line.line, destination: d.destination, message: error.message });
      }
    }
    line.text = text;
  }
  return { lines: out, errors, count };
}
