import fs from 'node:fs';
import path from 'node:path';
import { splitLines, stripFrontmatter } from './markdown.js';

const INCLUDE = /<!--\s*@include:\s*(.*?)\s*-->/g;
const REGION = /(#[\w-]+)/;
const RANGE = /\{(\d*),(\d*)\}$/;
const MARKDOWN_REGION = /^<!-- #?((?:end)?region) ([\w*-]+) -->$/;

export class IncludeError extends Error {}

export function parseIncludeSpec(spec) {
  let target = spec;
  const range = RANGE.exec(target);
  if (range) target = target.slice(0, range.index);
  const region = REGION.exec(target);
  if (region) target = target.slice(0, region.index);
  return {
    target,
    region: region ? region[1].slice(1) : null,
    range: range ? { start: range[1] ? Number(range[1]) : null, end: range[2] ? Number(range[2]) : null } : null,
  };
}

function regionBounds(lines, name) {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = MARKDOWN_REGION.exec(lines[i].text.trim());
    if (!m || m[2] !== name) continue;
    if (start === -1 && m[1] === 'region') start = i + 1;
    else if (start !== -1 && m[1] === 'endregion') return { start, end: i };
  }
  return null;
}

function readSourceLines(file, stripMatter) {
  const raw = fs.readFileSync(file, 'utf8');
  const body = stripMatter ? stripFrontmatter(raw) : raw;
  const offset = raw.slice(0, raw.length - body.length).split('\n').length - 1;
  return splitLines(body).map((text, i) => ({ text, file, line: i + offset }));
}

// Expands VitePress include directives into attributed lines ({ text, file, line }).
export function expandFile(file, options, stack = []) {
  const { display = (f) => f } = options;
  if (stack.includes(file)) {
    const chain = [...stack.slice(stack.indexOf(file)), file].map(display).join(' -> ');
    throw new IncludeError(`include cycle: ${chain}`);
  }
  const lines = readSourceLines(file, true);
  return expandLines(lines, file, options, [...stack, file]);
}

function loadInclude(spec, fromFile, options, stack) {
  const { srcDir, display = (f) => f } = options;
  const { target, region, range } = parseIncludeSpec(spec);
  const resolved = target.startsWith('@')
    ? path.resolve(srcDir, target.slice(target[1] === '/' ? 2 : 1))
    : path.resolve(path.dirname(fromFile), target);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    throw new IncludeError(`include not found: "${spec}" in ${display(fromFile)}`);
  }
  if (stack.includes(resolved)) {
    const chain = [...stack.slice(stack.indexOf(resolved)), resolved].map(display).join(' -> ');
    throw new IncludeError(`include cycle: ${chain}`);
  }
  let lines = readSourceLines(resolved, !region && !range && resolved.endsWith('.md'));
  if (region) {
    const bounds = regionBounds(lines, region);
    if (!bounds) throw new IncludeError(`include region "#${region}" not found: "${spec}" in ${display(fromFile)}`);
    lines = lines.slice(bounds.start, bounds.end);
  }
  if (range) {
    lines = lines.slice(range.start ? range.start - 1 : undefined, range.end ?? undefined);
  }
  return expandLines(lines, resolved, options, [...stack, resolved]);
}

function expandLines(lines, file, options, stack) {
  const out = [];
  for (const line of lines) {
    if (!line.text.match(INCLUDE)) {
      out.push(line);
      continue;
    }
    out.push(...expandLine(line, file, options, stack));
  }
  return out;
}

function expandLine(line, file, options, stack) {
  const result = [];
  let pending = { ...line, text: '' };
  let cursor = 0;
  for (const m of line.text.matchAll(INCLUDE)) {
    pending.text += line.text.slice(cursor, m.index);
    cursor = m.index + m[0].length;
    if (!m[1]) {
      pending.text += m[0];
      continue;
    }
    const included = loadInclude(m[1], file, options, stack);
    if (included.length === 0) continue;
    const [first, ...rest] = included;
    pending = pending.text.trim() ? { ...pending, text: pending.text + first.text } : { ...first, text: pending.text + first.text };
    if (rest.length === 0) continue;
    result.push(pending);
    result.push(...rest.slice(0, -1));
    pending = { ...rest[rest.length - 1] };
  }
  pending.text += line.text.slice(cursor);
  result.push(pending);
  return result;
}
