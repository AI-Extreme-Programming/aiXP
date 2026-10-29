import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseSidebar, readConfigValue, sidebarLinkToFile, loadSidebarFiles } from '../scripts/lib/sidebar.js';
import { FIXTURES, tempDir, writeTree } from './helpers.js';

const fixture = fs.readFileSync(path.join(FIXTURES, 'sidebar-config.mts'), 'utf8');

test('parseSidebar returns links in reading order, skipping comments and strings', () => {
  assert.deepEqual(parseSidebar(fixture), [
    '/book/01-one',
    '/book/02-two.md',
    '/book/03-three.html',
    '/book/04-four',
    'https://example.invalid/',
  ]);
});

test('readConfigValue reads plain literals', () => {
  assert.equal(readConfigValue(fixture, 'base'), '/Fixture/');
  assert.equal(readConfigValue(fixture, 'srcDir'), undefined);
});

test('parseSidebar rejects non-literal and multi-sidebar configs', () => {
  assert.throws(() => parseSidebar('export default { sidebar: makeSidebar() }'), /not a literal/);
  assert.throws(() => parseSidebar("x = { sidebar: [ { link: someVar } ] }"), /plain literal/);
  assert.throws(() => parseSidebar("x = { sidebar: { '/a/': [] } }"), /not an array/);
  assert.throws(() => parseSidebar('x = { nav: [] }'), /no "sidebar"/);
});

test('sidebarLinkToFile maps VitePress links to markdown files', () => {
  const src = path.resolve('/docs');
  assert.equal(sidebarLinkToFile('/aixp/01-a', src), path.join(src, 'aixp', '01-a.md'));
  assert.equal(sidebarLinkToFile('/aixp/01-a.md', src), path.join(src, 'aixp', '01-a.md'));
  assert.equal(sidebarLinkToFile('/aixp/01-a.html#x', src), path.join(src, 'aixp', '01-a.md'));
  assert.equal(sidebarLinkToFile('/aixp/', src), path.join(src, 'aixp', 'index.md'));
  assert.equal(sidebarLinkToFile('https://example.invalid', src), null);
});

test('loadSidebarFiles resolves files and fails on missing or duplicate entries', (t) => {
  const root = writeTree(tempDir(t), {
    'docs/.vitepress/config.mts': fixture,
    'docs/book/01-one.md': '# One\n',
    'docs/book/02-two.md': '# Two\n',
    'docs/book/03-three.md': '# Three\n',
    'docs/book/04-four.md': '# Four\n',
  });
  const config = path.join(root, 'docs', '.vitepress', 'config.mts');
  const { files, base } = loadSidebarFiles(config);
  assert.deepEqual(files.map((f) => path.basename(f)), ['01-one.md', '02-two.md', '03-three.md', '04-four.md']);
  assert.equal(base, '/Fixture/');

  fs.writeFileSync(config, fixture.replace("link: '04-four'", "link: '01-one'"));
  assert.throws(() => loadSidebarFiles(config), /appears more than once/);

  fs.writeFileSync(config, fixture.replace("link: '04-four'", "link: '05-missing'"));
  assert.throws(() => loadSidebarFiles(config), /"\/book\/05-missing" has no matching file/);
});

test('real config.mts yields the manuscript order', () => {
  const config = path.resolve(FIXTURES, '..', '..', '..', 'docs', '.vitepress', 'config.mts');
  const { files } = loadSidebarFiles(config);
  assert.ok(files.length > 0);
  for (const file of files) assert.ok(fs.existsSync(file));
  const names = files.map((f) => path.basename(f));
  assert.deepEqual(names, [...names].sort());
});
