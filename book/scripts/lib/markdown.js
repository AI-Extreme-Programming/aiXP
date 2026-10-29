// Mirrors @mdit-vue/shared slugify, which VitePress uses for heading anchors.
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[̀-ͯ]/g;

export function vitepressSlugify(text) {
  return text
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/;

export function openingFence(text) {
  const m = FENCE_OPEN.exec(text);
  if (!m) return null;
  const marker = m[2];
  const info = m[3].trim();
  if (marker[0] === '`' && info.includes('`')) return null;
  return { char: marker[0], length: marker.length, info, lang: info.split(/\s+/)[0] || '' };
}

export function closesFence(text, fence) {
  const m = /^\s*(`{3,}|~{3,})\s*$/.exec(text);
  return Boolean(m) && m[1][0] === fence.char && m[1].length >= fence.length;
}

// Yields { index, inFence, fence } for every line; fence lines themselves count as inFence.
export function* scanLines(lines) {
  let fence = null;
  for (let index = 0; index < lines.length; index++) {
    const text = lines[index].text;
    if (fence) {
      const closing = closesFence(text, fence);
      yield { index, inFence: true, fence, role: closing ? 'close' : 'body' };
      if (closing) fence = null;
      continue;
    }
    const opened = openingFence(text);
    if (opened) {
      fence = { ...opened, start: index };
      yield { index, inFence: true, fence, role: 'open' };
      continue;
    }
    yield { index, inFence: false, fence: null, role: 'text' };
  }
}

export function unclosedFence(lines) {
  let last = null;
  for (const info of scanLines(lines)) last = info;
  if (last && last.inFence && last.role !== 'close') return last.fence;
  return null;
}

const ATX = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/;
const ATTRS = /[ \t]*\{([^{}]*)\}[ \t]*$/;

export function parseAttributes(body) {
  const tokens = body.trim().split(/\s+/).filter(Boolean);
  let id = null;
  const rest = [];
  for (const token of tokens) {
    if (token.startsWith('#') && token.length > 1 && id === null) id = token.slice(1);
    else rest.push(token);
  }
  return { id, rest };
}

export function splitHeadingContent(raw) {
  let content = raw.replace(/[ \t]+#+[ \t]*$/, '').replace(/^#+[ \t]*$/, '');
  let id = null;
  let attributes = [];
  const attrMatch = ATTRS.exec(content);
  if (attrMatch) {
    const parsed = parseAttributes(attrMatch[1]);
    id = parsed.id;
    attributes = parsed.rest;
    content = content.slice(0, attrMatch.index);
  }
  return { content: content.trim(), customId: id, attributes };
}

export function parseAtxHeading(text) {
  const m = ATX.exec(text);
  if (!m) return null;
  return { level: m[1].length, ...splitHeadingContent(m[2] ?? '') };
}

const SETEXT_UNDERLINE = /^ {0,3}(=+|-+)[ \t]*$/;
const NOT_PARAGRAPH = /^(?: {4}|\t| {0,3}(?:[>#|]|[-*+][ \t]|\d+[.)][ \t]|<))/;

export function setextLevel(text, previousText) {
  const m = SETEXT_UNDERLINE.exec(text);
  if (!m || previousText === undefined || !previousText.trim()) return 0;
  if (NOT_PARAGRAPH.test(previousText) || openingFence(previousText)) return 0;
  if (SETEXT_UNDERLINE.test(previousText)) return 0;
  return m[1][0] === '=' ? 1 : 2;
}

// Finds headings outside code fences. Each heading records the line(s) it spans.
export function findHeadings(lines) {
  const headings = [];
  let previous = null;
  for (const info of scanLines(lines)) {
    const text = lines[info.index].text;
    if (info.inFence) {
      previous = null;
      continue;
    }
    const atx = parseAtxHeading(text);
    if (atx) {
      headings.push({ ...atx, index: info.index, kind: 'atx' });
      previous = null;
      continue;
    }
    const level = previous !== null ? setextLevel(text, lines[previous].text) : 0;
    if (level) {
      headings.push({ level, ...splitHeadingContent(lines[previous].text.trim()), index: previous, underline: info.index, kind: 'setext' });
      previous = null;
      continue;
    }
    previous = text.trim() ? info.index : null;
  }
  return headings;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// Approximates markdown-it-anchor's getTokensText: text and inline code only.
export function headingPlainText(content) {
  const literals = [];
  const protect = (value) => `${literals.push(value) - 1}`;
  return content
    .replace(/(`+)(.+?)\1/g, (_, __, code) => protect(code.trim()))
    .replace(/\\([!-/:-@[-`{-~])/g, (_, ch) => protect(ch))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/<\/?[A-Za-z][^>]*>/g, '')
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '$2')
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, '$1')
    .replace(/(^|[^\w])_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '$1$2')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, name) => {
      if (name[0] === '#') {
        const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
        return String.fromCodePoint(code);
      }
      return ENTITIES[name.toLowerCase()] ?? m;
    })
    .replace(/(\d+)/g, (_, i) => literals[Number(i)]);
}

// Assigns page-level ids exactly as markdown-it-anchor does for one rendered page.
export function assignPageSlugs(headings) {
  const taken = new Set();
  return headings.map((heading) => {
    if (heading.customId) {
      if (taken.has(heading.customId)) {
        throw new Error(`duplicate custom heading id "${heading.customId}"`);
      }
      taken.add(heading.customId);
      return heading.customId;
    }
    const base = vitepressSlugify(headingPlainText(heading.content));
    let slug = base;
    for (let i = 1; taken.has(slug); i++) slug = `${base}-${i}`;
    taken.add(slug);
    return slug;
  });
}

export function stripFrontmatter(text) {
  const m = /^---[ \t]*\r?\n(?:[\s\S]*?\r?\n)?---[ \t]*(?:\r?\n|$)/.exec(text);
  return m ? text.slice(m[0].length) : text;
}

export function splitLines(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}
