import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  assignPageSlugs,
  findHeadings,
  headingPlainText,
  stripFrontmatter,
  unclosedFence,
  vitepressSlugify,
} from '../scripts/lib/markdown.js';
import { assembleBook, BuildErrors } from '../scripts/lib/assemble.js';
import { BUILD, makeBook } from './helpers.js';

const lines = (text) => text.split('\n').map((t, i) => ({ text: t, file: 'f.md', line: i }));
const headingIds = (text) => [...text.matchAll(/\{#([^ }]+)/g)].map((m) => m[1]);

test('vitepressSlugify matches the VitePress slugger', () => {
  assert.equal(vitepressSlugify('Test-Driven Development (TDD)'), 'test-driven-development-tdd');
  assert.equal(vitepressSlugify('Chapter 1 - The Manifesto: Pillars'), 'chapter-1-the-manifesto-pillars');
  assert.equal(vitepressSlugify('80/20 Rule'), '_80-20-rule');
  assert.equal(vitepressSlugify('Café “quoted” é'), 'cafe-quoted-e');
  assert.equal(vitepressSlugify('snake_case & more!'), 'snake-case-more');
});

test('headingPlainText keeps text and inline code like markdown-it-anchor', () => {
  assert.equal(headingPlainText('Use **bold** and `code_x` with [a link](x.md)'), 'Use bold and code_x with a link');
  assert.equal(headingPlainText('A &amp; B \\*not emphasis\\*'), 'A & B *not emphasis*');
  assert.equal(headingPlainText('snake_case_name'), 'snake_case_name');
});

test('findHeadings ignores fenced code and reads attributes', () => {
  const found = findHeadings(lines('# One {#custom .cls}\n```md\n# not a heading\n```\n~~~\n## nor this\n~~~\nPara\n---\n## Two ##\n    # indented code'));
  assert.deepEqual(found.map((h) => [h.level, h.content, h.customId, h.kind]), [
    [1, 'One', 'custom', 'atx'],
    [2, 'Para', null, 'setext'],
    [2, 'Two', null, 'atx'],
  ]);
  assert.deepEqual(found[0].attributes, ['.cls']);
});

test('setext detection does not treat list items or thematic breaks as headings', () => {
  assert.equal(findHeadings(lines('- item\n---')).length, 0);
  assert.equal(findHeadings(lines('\n---\n')).length, 0);
  assert.equal(findHeadings(lines('Title\n=====')).length, 1);
});

test('assignPageSlugs dedupes like markdown-it-anchor and rejects duplicate custom ids', () => {
  const hs = findHeadings(lines('# A\n## A\n## A\n## B {#a-1}'));
  assert.throws(() => assignPageSlugs(hs), /duplicate custom heading id/);
  assert.deepEqual(assignPageSlugs(findHeadings(lines('# A\n## A\n## A'))), ['a', 'a-1', 'a-2']);
});

test('unclosedFence reports a fence left open', () => {
  assert.equal(unclosedFence(lines('```\ncode\n```')), null);
  assert.equal(unclosedFence(lines('text\n````\ncode\n```')).start, 1);
});

test('stripFrontmatter removes leading YAML only', () => {
  assert.equal(stripFrontmatter('---\na: 1\n---\n# T\n'), '# T\n');
  assert.equal(stripFrontmatter('---\n---\nbody'), 'body');
  assert.equal(stripFrontmatter('# T\n---\nx\n---\n'), '# T\n---\nx\n---\n');
});

test('heading ids are unique across the concatenated book', (t) => {
  const root = makeBook(t, {
    sidebar: ['/b/01-a', '/b/02-b'],
    docs: {
      'b/01-a.md': '# Overview\n## Details\n## Details\n<!--@include: ./inc.md-->\n',
      'b/inc.md': '## Details\n',
      'b/02-b.md': '# Overview\n## Details\nSetext\n------\n',
    },
  });
  const { text } = assembleBook({ root, target: 'epub', build: BUILD, outDir: path.join(root, 'dist') });
  const ids = headingIds(text);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, [
    'title-page--test-book',
    'colophon--colophon',
    'ch-01-a--overview',
    'ch-01-a--details',
    'ch-01-a--details-1',
    'ch-01-a--details-2',
    'ch-02-b--overview',
    'ch-02-b--details',
    'ch-02-b--setext',
  ]);
  assert.match(text, /^## Setext \{#ch-02-b--setext\}$/m);
  assert.doesNotMatch(text, /^------$/m);
  assert.match(text, /^# Test Book \{#title-page--test-book \.unnumbered\}$/m);
});

test('an unclosed fence in a chapter fails the build', (t) => {
  const root = makeBook(t, { sidebar: ['/b/01-a'], docs: { 'b/01-a.md': '# A\n```\ncode\n' } });
  assert.throws(
    () => assembleBook({ root, target: 'epub', build: BUILD, outDir: path.join(root, 'dist') }),
    (error) => error instanceof BuildErrors && /docs\/b\/01-a.md:2: unclosed code fence/.test(error.message),
  );
});
