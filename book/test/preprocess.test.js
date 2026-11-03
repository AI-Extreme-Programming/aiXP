import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseCli, run } from '../scripts/preprocess.js';
import { makeBook } from './helpers.js';

const SCRIPT = fileURLToPath(new URL('../scripts/preprocess.js', import.meta.url));
const REPO_ROOT = path.resolve(path.dirname(SCRIPT), '..', '..');

test('parseCli defaults and validation', () => {
  const opts = parseCli(['--root', '/r']);
  assert.deepEqual(opts.targets, ['epub', 'print']);
  assert.equal(opts.outDir, path.resolve('/r', 'dist'));
  assert.equal(opts.check, false);
  assert.deepEqual(parseCli(['--target', 'print']).targets, ['print']);
  assert.throws(() => parseCli(['--target', 'pdf']), /unknown target/);
  assert.throws(() => parseCli(['--bogus']), /Unknown option/);
});

function fixtureBook(t) {
  return makeBook(t, {
    sidebar: ['/b/01-a'],
    docs: { 'b/01-a.md': '# A\n\nSECRET-PROSE\n\n```mermaid\ngraph TD\n```\n' },
  });
}

test('build mode writes one unified file per target and renders diagrams', (t) => {
  const root = fixtureBook(t);
  const logs = [];
  const rendered = [];
  const render = (diagrams, { outDir, format }) => {
    fs.mkdirSync(outDir, { recursive: true });
    for (const d of diagrams) fs.writeFileSync(path.join(outDir, `mermaid-${d.id}.${format}`), 'x');
    rendered.push(format);
  };
  run({ ...parseCli(['--root', root, '--version', 'v9.9.9', '--date', '2026-03-04', '--git-sha', 'deadbeef']) }, { log: (m) => logs.push(m), render });
  assert.deepEqual(rendered, ['svg', 'pdf']);
  for (const target of ['epub', 'print']) {
    const text = fs.readFileSync(path.join(root, 'dist', target, 'unified-manuscript.md'), 'utf8');
    assert.match(text, /Version v9\.9\.9, 2026-03-04/);
    const image = /!\[\]\(([^)]+)\)/.exec(text)[1];
    assert.ok(fs.existsSync(path.join(root, image)), `${image} exists relative to the repo root`);
  }
  assert.equal(logs.length, 2);
  for (const line of logs) assert.doesNotMatch(line, /SECRET/);
});

test('check mode writes nothing and renders nothing', (t) => {
  const root = fixtureBook(t);
  const logs = [];
  run(parseCli(['--root', root, '--check']), { log: (m) => logs.push(m), render: () => assert.fail('rendered in check mode') });
  assert.equal(fs.existsSync(path.join(root, 'dist')), false);
  assert.deepEqual(logs.map((l) => l.split(':')[0]), ['check epub', 'check print']);
});

test('CLI exits non-zero on a broken link and never prints body text', (t) => {
  const root = makeBook(t, { sidebar: ['/b/01-a'], docs: { 'b/01-a.md': '# A\n\nSECRET-PROSE [x](nowhere.md)\n' } });
  const result = spawnSync(process.execPath, [SCRIPT, '--check', '--root', root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /docs\/b\/01-a\.md:3: link "nowhere\.md"/);
  assert.doesNotMatch(result.stdout + result.stderr, /SECRET/);
});

test('integration: check mode passes against the real manuscript', () => {
  const result = spawnSync(process.execPath, [SCRIPT, '--check', '--root', REPO_ROOT], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^check epub: ok/m);
  assert.match(result.stdout, /^check print: ok/m);
});
