import crypto from 'node:crypto';
import path from 'node:path';
import YAML from 'yaml';

export function isValidIsbn13(raw) {
  const digits = String(raw ?? '').replace(/^urn:isbn:/i, '').replace(/[\s-]/g, '');
  if (!/^97[89]\d{10}$/.test(digits)) return false;
  const sum = [...digits].reduce((acc, d, i) => acc + Number(d) * (i % 2 ? 3 : 1), 0);
  return sum % 10 === 0;
}

const URL_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

// RFC 9562 version 5 UUID: stable for the same name, so every build of the book shares one identifier.
export function uuidV5(name, namespace = URL_NAMESPACE) {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const hash = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name, 'utf8')])).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function identifierList(identifier) {
  if (Array.isArray(identifier)) return identifier;
  return identifier ? [identifier] : [];
}

// Uses a valid ISBN-13 when metadata has one. A placeholder ISBN is not a usable
// identifier, so the book falls back to a name-based UUID derived from title and author.
export function epubIdentifier(metadata) {
  for (const entry of identifierList(metadata.identifier)) {
    const text = typeof entry === 'object' && entry !== null ? entry.text : entry;
    const scheme = typeof entry === 'object' && entry !== null ? entry.scheme ?? '' : '';
    if (/^ISBN/i.test(scheme) && isValidIsbn13(text)) {
      const digits = String(text).replace(/^urn:isbn:/i, '').replace(/[\s-]/g, '');
      return { scheme: 'ISBN-13', text: `urn:isbn:${digits}`, source: 'isbn' };
    }
  }
  const author = Array.isArray(metadata.author) ? metadata.author.join(', ') : metadata.author ?? '';
  const name = `https://www.scottkirvan.com/aiXP/book#${metadata.title ?? ''}|${author}`;
  return { scheme: 'UUID', text: `urn:uuid:${uuidV5(name)}`, source: 'uuid' };
}

// Pandoc's EPUB writer emits a dc:title subtitle only from a typed title list.
export function epubMetadataOverrides(metadata) {
  const { scheme, text } = epubIdentifier(metadata);
  const overrides = { identifier: [{ scheme, text }] };
  if (metadata.title && metadata.subtitle) {
    overrides.title = [
      { type: 'main', text: String(metadata.title) },
      { type: 'subtitle', text: String(metadata.subtitle) },
    ];
  }
  return YAML.stringify(overrides);
}

export function manuscriptBuildInfo(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!m) throw new Error('unified manuscript has no leading YAML metadata block');
  const data = YAML.parse(m[1]) ?? {};
  for (const key of ['book-version', 'date', 'git-commit', 'build-timestamp']) {
    if (!data[key]) throw new Error(`unified manuscript metadata is missing "${key}"`);
  }
  return {
    version: data['book-version'],
    date: data.date,
    gitSha: data['git-commit'],
    buildTimestamp: data['build-timestamp'],
  };
}

export function epubFileName(version) {
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`version "${version}" is not of the form vX.Y.Z`);
  return `aixp-${version}.epub`;
}

export function sourceDateEpoch(buildTimestamp) {
  const ms = Date.parse(buildTimestamp);
  if (Number.isNaN(ms)) throw new Error(`build timestamp "${buildTimestamp}" is not a valid date`);
  return String(Math.floor(ms / 1000));
}

const posix = (p) => p.split(path.sep).join('/');

// Paths are relative to the repository root, which is Pandoc's working directory.
export function pandocArgs({ root, manuscript, metadataFile, overridesFile, css, cover, output }) {
  const rel = (p) => posix(path.relative(root, p));
  return [
    rel(manuscript),
    '--from=markdown',
    '--to=epub3',
    `--epub-cover-image=${rel(cover)}`,
    `--css=${rel(css)}`,
    `--metadata-file=${rel(metadataFile)}`,
    `--metadata-file=${rel(overridesFile)}`,
    '--epub-title-page=false',
    '--split-level=1',
    '--toc',
    '--toc-depth=2',
    '--resource-path=.',
    '-o',
    rel(output),
  ];
}
