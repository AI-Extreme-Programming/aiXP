import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  fillTemplate,
  metadataBlock,
  normalizeDate,
  normalizeVersion,
  readBookMetadata,
  resolveBuildInfo,
  templateValues,
  versionFromFile,
} from '../scripts/lib/template.js';
import { assembleBook } from '../scripts/lib/assemble.js';
import { BUILD, makeBook, tempDir, writeTree } from './helpers.js';

test('fillTemplate fills placeholders and reports missing values', () => {
  assert.equal(fillTemplate('v{{ version }} on {{publication-date}}', { version: 'v1', 'publication-date': 'd' }, 't'), 'vv1 on d');
  assert.throws(() => fillTemplate('{{isbn}} {{nope}}', { isbn: '' }, 'colophon.md'), { message: 'colophon.md: no value for placeholder(s) isbn, nope' });
});

test('version and date normalisation', () => {
  assert.equal(normalizeVersion('1.2.3'), 'v1.2.3');
  assert.equal(normalizeVersion('v1.2.3-rc.1'), 'v1.2.3-rc.1');
  assert.throws(() => normalizeVersion('v1.2'), /vX\.Y\.Z/);
  assert.equal(versionFromFile('<!-- x -->\nversion=0.0.1\n<!-- y -->'), 'v0.0.1');
  assert.equal(normalizeDate('2026-02-28'), '2026-02-28');
  assert.throws(() => normalizeDate('2026-02-31'), /YYYY-MM-DD/);
  assert.throws(() => normalizeDate('28/02/2026'), /YYYY-MM-DD/);
});

test('resolveBuildInfo prefers explicit values, then SOURCE_DATE_EPOCH and the version file', (t) => {
  const root = writeTree(tempDir(t), { 'VERSION.md': 'version=2.0.0\n' });
  const versionFile = path.join(root, 'VERSION.md');
  const explicit = resolveBuildInfo({ root, version: '3.1.4', date: '2026-05-06', gitSha: 'abc', versionFile, env: {} });
  assert.equal(explicit.version, 'v3.1.4');
  assert.equal(explicit.date, '2026-05-06');
  assert.equal(explicit.gitSha, 'abc');
  const fallback = resolveBuildInfo({ root, gitSha: 'abc', versionFile, env: { SOURCE_DATE_EPOCH: '1767225600' } });
  assert.equal(fallback.version, 'v2.0.0');
  assert.equal(fallback.date, '2026-01-01');
  assert.equal(fallback.buildTimestamp, '2026-01-01T00:00:00.000Z');
  assert.equal(resolveBuildInfo({ root, versionFile, env: { GITHUB_SHA: 'fromenv' } }).gitSha, 'fromenv');
});

test('readBookMetadata pulls ISBN from the identifier list', (t) => {
  const root = makeBook(t, { sidebar: ['/b/a'], docs: { 'b/a.md': '# A\n' } });
  const meta = readBookMetadata(path.join(root, 'book', 'metadata.yaml'));
  assert.equal(meta.isbn, '000-TEST');
  assert.equal(meta.publisher, 'Test Press');
  assert.equal(templateValues(meta, BUILD)['publication-year'], '2026');
});

test('colophon receives version and date; SHA and timestamp go only to metadata', (t) => {
  const root = makeBook(t, { sidebar: ['/b/a'], docs: { 'b/a.md': '# A\n' } });
  const { text } = assembleBook({ root, target: 'print', build: BUILD, outDir: path.join(root, 'dist') });
  assert.match(text, /^Version v1\.2\.3, 2026-01-02, ISBN 000-TEST$/m);
  const [, header, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  assert.equal(header, metadataBlock(BUILD, 'print').slice(4, -4));
  assert.match(header, /^git-commit: "abc123"$/m);
  assert.match(header, /^build-timestamp: "2026-01-02T03:04:05.000Z"$/m);
  assert.doesNotMatch(body, /abc123|03:04:05/);
  assert.ok(text.indexOf('# Test Book') < text.indexOf('# Colophon') && text.indexOf('# Colophon') < text.indexOf('# A'));
});
