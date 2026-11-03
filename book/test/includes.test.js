import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { expandFile, parseIncludeSpec } from '../scripts/lib/includes.js';
import { tempDir, writeTree } from './helpers.js';

function setup(t, files) {
  const root = writeTree(tempDir(t), files);
  const display = (f) => path.relative(root, f).split(path.sep).join('/');
  const expand = (name) => expandFile(path.join(root, ...name.split('/')), { srcDir: root, display });
  return { root, expand };
}

const texts = (lines) => lines.map((l) => l.text);

test('parseIncludeSpec separates path, region and line range', () => {
  assert.deepEqual(parseIncludeSpec('./a.md'), { target: './a.md', region: null, range: null });
  assert.deepEqual(parseIncludeSpec('./a.md#part{2,}'), { target: './a.md', region: 'part', range: { start: 2, end: null } });
  assert.deepEqual(parseIncludeSpec('./a.md{,3}'), { target: './a.md', region: null, range: { start: null, end: 3 } });
});

test('nested includes are resolved recursively with source attribution', (t) => {
  const { root, expand } = setup(t, {
    'host.md': '# Host\n\n<!--@include: ./sub/a.md-->\n\nend\n',
    'sub/a.md': '---\ntitle: x\n---\n## A\n<!-- @include: ./b.md -->\n',
    'sub/b.md': '### B\n',
  });
  const lines = expand('host.md');
  assert.deepEqual(texts(lines), ['# Host', '', '## A', '### B', '', 'end']);
  assert.equal(lines[2].file, path.join(root, 'sub', 'a.md'));
  assert.equal(lines[2].line, 3);
  assert.equal(lines[3].file, path.join(root, 'sub', 'b.md'));
  assert.equal(lines[3].line, 0);
});

test('inline includes, @/ paths, regions and line ranges', (t) => {
  const { expand } = setup(t, {
    'dir/host.md': 'before <!--@include: @/part.md{2,3}--> after\n<!--@include: ../regions.md#keep-->\n',
    'part.md': 'one\ntwo\nthree\nfour\n',
    'regions.md': 'skip\n<!-- #region keep -->\nkept\n<!-- #endregion keep -->\nskip\n',
  });
  assert.deepEqual(texts(expand('dir/host.md')), ['before two', 'three after', 'kept']);
});

test('include cycles fail with the chain of files', (t) => {
  const { expand } = setup(t, {
    'a.md': '<!--@include: ./b.md-->\n',
    'b.md': '<!--@include: ./c.md-->\n',
    'c.md': '<!--@include: ./a.md-->\n',
  });
  assert.throws(() => expand('a.md'), { message: 'include cycle: a.md -> b.md -> c.md -> a.md' });
});

test('self-include is a cycle', (t) => {
  const { expand } = setup(t, { 'a.md': 'x\n<!--@include: ./a.md-->\n' });
  assert.throws(() => expand('a.md'), /include cycle: a.md -> a.md/);
});

test('missing include fails naming the file and path', (t) => {
  const { expand } = setup(t, { 'a.md': '<!--@include: ./nope.md-->\n' });
  assert.throws(() => expand('a.md'), { message: 'include not found: "./nope.md" in a.md' });
});

test('missing region fails clearly', (t) => {
  const { expand } = setup(t, { 'a.md': '<!--@include: ./b.md#gone-->\n', 'b.md': 'text\n' });
  assert.throws(() => expand('a.md'), /include region "#gone" not found/);
});

test('the same file may be included twice without being a cycle', (t) => {
  const { expand } = setup(t, { 'a.md': '<!--@include: ./b.md-->\n<!--@include: ./b.md-->\n', 'b.md': 'b\n' });
  assert.deepEqual(texts(expand('a.md')), ['b', 'b']);
});
