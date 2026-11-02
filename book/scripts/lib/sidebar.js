import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function skipString(src, i, quote) {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') j++;
    else if (src[j] === quote) return j + 1;
  }
  throw new Error('unterminated string literal');
}

function skipTemplate(src, i) {
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === '\\') j += 2;
    else if (src[j] === '`') return j + 1;
    else if (src[j] === '$' && src[j + 1] === '{') j = skipBalanced(src, j + 1);
    else j++;
  }
  throw new Error('unterminated template literal');
}

// Returns the index after any comment or string starting at i, or i if none starts there.
function skipNonCode(src, i) {
  if (src.startsWith('//', i)) {
    const end = src.indexOf('\n', i);
    return end === -1 ? src.length : end + 1;
  }
  if (src.startsWith('/*', i)) {
    const end = src.indexOf('*/', i + 2);
    if (end === -1) throw new Error('unterminated block comment');
    return end + 2;
  }
  if (src[i] === '"' || src[i] === "'") return skipString(src, i, src[i]);
  if (src[i] === '`') return skipTemplate(src, i);
  return i;
}

const PAIRS = { '[': ']', '{': '}', '(': ')' };

function skipBalanced(src, start) {
  const stack = [PAIRS[src[start]]];
  let i = start + 1;
  while (i < src.length) {
    const next = skipNonCode(src, i);
    if (next !== i) {
      i = next;
      continue;
    }
    const ch = src[i];
    if (PAIRS[ch]) stack.push(PAIRS[ch]);
    else if (ch === ']' || ch === '}' || ch === ')') {
      if (stack.pop() !== ch) throw new Error(`unbalanced "${ch}" at offset ${i}`);
      if (stack.length === 0) return i + 1;
    }
    i++;
  }
  throw new Error('unbalanced brackets');
}

export function findPropertyLiteral(src, key) {
  const keyPattern = new RegExp(`^(?:${key}|'${key}'|"${key}")\\s*:\\s*`);
  let i = 0;
  while (i < src.length) {
    const next = skipNonCode(src, i);
    if (next !== i) {
      i = next;
      continue;
    }
    const before = src[i - 1];
    if (!before || !/[\w$.]/.test(before)) {
      const m = keyPattern.exec(src.slice(i, i + key.length + 64));
      if (m) {
        const start = i + m[0].length;
        const ch = src[start];
        if (PAIRS[ch]) return src.slice(start, skipBalanced(src, start));
        if (ch === '"' || ch === "'") return src.slice(start, skipString(src, start, ch));
        if (ch === '`') return src.slice(start, skipTemplate(src, start));
        throw new Error(`"${key}" in config is not a literal value`);
      }
    }
    i++;
  }
  return null;
}

export function evaluateLiteral(literal, key) {
  try {
    return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
  } catch (error) {
    throw new Error(`"${key}" in config could not be read as a plain literal: ${error.message}`);
  }
}

export function readConfigValue(src, key) {
  const literal = findPropertyLiteral(src, key);
  return literal === null ? undefined : evaluateLiteral(literal, key);
}

export function parseSidebar(src) {
  const sidebar = readConfigValue(src, 'sidebar');
  if (sidebar === undefined) throw new Error('no "sidebar" found in config');
  if (!Array.isArray(sidebar)) {
    throw new Error('"sidebar" in config is not an array; multi-sidebar configs are not supported');
  }
  const links = [];
  const walk = (items, base) => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const itemBase = item.base ?? base;
      if (typeof item.link === 'string') links.push(EXTERNAL.test(item.link) ? item.link : itemBase + item.link);
      if (Array.isArray(item.items)) walk(item.items, itemBase);
    }
  };
  walk(sidebar, '');
  return links;
}

export function sidebarLinkToFile(link, srcDir) {
  if (EXTERNAL.test(link)) return null;
  let target = decodeURI(link.replace(/[?#].*$/, ''));
  target = target.replace(/^\/+/, '');
  if (target === '' || target.endsWith('/')) target += 'index.md';
  else if (target.endsWith('.html')) target = target.slice(0, -5) + '.md';
  else if (!target.endsWith('.md')) target += '.md';
  return path.resolve(srcDir, target);
}

// Returns the ordered absolute paths of the manuscript files named by the VitePress sidebar.
export function loadSidebarFiles(configPath) {
  const src = fs.readFileSync(configPath, 'utf8');
  const docsRoot = path.dirname(path.dirname(configPath));
  const srcDirSetting = readConfigValue(src, 'srcDir');
  const srcDir = path.resolve(docsRoot, typeof srcDirSetting === 'string' ? srcDirSetting : '.');
  const files = [];
  const seen = new Set();
  for (const link of parseSidebar(src)) {
    const file = sidebarLinkToFile(link, srcDir);
    if (!file) continue;
    if (!fs.existsSync(file)) throw new Error(`sidebar link "${link}" has no matching file`);
    if (seen.has(file)) throw new Error(`sidebar link "${link}" appears more than once`);
    seen.add(file);
    files.push(file);
  }
  if (files.length === 0) throw new Error('sidebar names no manuscript files');
  return { files, srcDir, base: readConfigValue(src, 'base') ?? '/' };
}
