import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

const PLACEHOLDER = /\{\{\s*([\w-]+)\s*\}\}/g;

export function fillTemplate(text, values, name) {
  const missing = new Set();
  const filled = text.replace(PLACEHOLDER, (m, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === '') {
      missing.add(key);
      return m;
    }
    return String(value);
  });
  if (missing.size) throw new Error(`${name}: no value for placeholder(s) ${[...missing].join(', ')}`);
  return filled;
}

function isbnFrom(identifier) {
  const list = Array.isArray(identifier) ? identifier : identifier ? [identifier] : [];
  const entry = list.find((item) => item && typeof item === 'object' && /^ISBN/i.test(item.scheme ?? ''));
  return entry?.text;
}

export function readBookMetadata(file) {
  const data = YAML.parse(fs.readFileSync(file, 'utf8')) ?? {};
  return {
    title: data.title,
    subtitle: data.subtitle,
    author: Array.isArray(data.author) ? data.author.join(', ') : data.author,
    publisher: data.publisher,
    rights: data.rights,
    edition: data.edition,
    isbn: isbnFrom(data.identifier),
  };
}

const VERSION = /^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

export function normalizeVersion(raw) {
  const m = VERSION.exec(String(raw).trim());
  if (!m) throw new Error(`version "${raw}" is not of the form vX.Y.Z`);
  return `v${m[1]}`;
}

export function versionFromFile(text) {
  const m = /^\s*version\s*=\s*(\S+)\s*$/m.exec(text);
  if (!m) throw new Error('no "version=" line found in version file');
  return normalizeVersion(m[1]);
}

export function normalizeDate(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw).trim());
  const parsed = m ? new Date(`${m[0]}T00:00:00Z`) : null;
  if (!m || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== m[0]) throw new Error(`date "${raw}" is not of the form YYYY-MM-DD`);
  return m[0];
}

function git(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

export function resolveBuildInfo({ root, version, date, gitSha, versionFile, env = process.env, now = new Date() }) {
  const epoch = env.SOURCE_DATE_EPOCH ? new Date(Number(env.SOURCE_DATE_EPOCH) * 1000) : null;
  const resolvedVersion = version
    ? normalizeVersion(version)
    : versionFromFile(fs.readFileSync(versionFile, 'utf8'));
  const commitDate = git(root, ['log', '-1', '--format=%cI']).slice(0, 10);
  const resolvedDate = normalizeDate(date ?? (epoch ? epoch.toISOString().slice(0, 10) : commitDate || now.toISOString().slice(0, 10)));
  const sha = gitSha ?? env.GITHUB_SHA ?? git(root, ['rev-parse', 'HEAD']);
  if (!sha) throw new Error('git commit SHA unavailable; pass --git-sha');
  return {
    version: resolvedVersion,
    date: resolvedDate,
    gitSha: sha,
    buildTimestamp: (epoch ?? now).toISOString(),
  };
}

export function templateValues(metadata, build) {
  return {
    ...metadata,
    version: build.version,
    'publication-date': build.date,
    'publication-year': build.date.slice(0, 4),
  };
}

export function metadataBlock(build, target) {
  const fields = {
    date: build.date,
    'book-version': build.version,
    'git-commit': build.gitSha,
    'build-timestamp': build.buildTimestamp,
    'build-target': target,
  };
  const body = Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
  return `---\n${body}\n---`;
}
