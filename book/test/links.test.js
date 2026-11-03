import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { findDestinations, maskCodeSpans, rewriteLinks } from '../scripts/lib/links.js';
import { assembleBook, BuildErrors } from '../scripts/lib/assemble.js';
import { BUILD, makeBook, writeTree } from './helpers.js';

const dests = (text) => findDestinations(text).map((d) => [d.kind, d.destination]);

test('findDestinations finds inline links, images, definitions and raw HTML', () => {
  assert.deepEqual(dests('see [a](x.md#y "t") and ![img](p.png) and [b](<sp ace.md>)'), [
    ['link', 'x.md#y'],
    ['image', 'p.png'],
    ['link', 'sp ace.md'],
  ]);
  assert.deepEqual(dests('[![badge](b.svg)](target.md)'), [['image', 'b.svg'], ['link', 'target.md']]);
  assert.deepEqual(dests('[ref]: other.md#z'), [['definition', 'other.md#z']]);
  assert.deepEqual(dests('<a href="c.md">c</a>'), [['link', 'c.md']]);
  assert.deepEqual(dests('[f](fn(1).md)'), [['link', 'fn(1).md']]);
});

test('findDestinations ignores inline code', () => {
  assert.equal(maskCodeSpans('a `[x](y.md)` b').length, 'a `[x](y.md)` b'.length);
  assert.deepEqual(dests('a `[x](y.md)` b ``[z](q.md)``'), []);
});

test('rewriteLinks skips fenced code and external links and reports failures', () => {
  const lines = ['[a](a.md)', '```', '[b](b.md)', '```', '[c](https://x.invalid/c.md) [d](bad.md)']
    .map((text, i) => ({ text, file: 'f.md', line: i }));
  const result = rewriteLinks(lines, ({ destination }) => {
    if (destination === 'bad.md') throw new Error('nope');
    return `#${destination}`;
  });
  assert.deepEqual(result.lines.map((l) => l.text), ['[a](#a.md)', '```', '[b](b.md)', '```', '[c](https://x.invalid/c.md) [d](bad.md)']);
  assert.deepEqual(result.errors, [{ file: 'f.md', line: 4, destination: 'bad.md', message: 'nope' }]);
  assert.equal(result.count, 1);
});

function linkBook(t, sourceLinks) {
  return makeBook(t, {
    sidebar: ['/b/01.00-one', '/b/02.00-two'],
    docs: {
      'b/01.00-one.md': `# Chapter One\n\n## Shared Name\n\n<!--@include: ./01.01-part.md-->\n\n${sourceLinks}\n`,
      'b/01.01-part.md': '## Included Part\n\n### Test-Driven Development (TDD)\n\n## Shared Name\n',
      'b/02.00-two.md': '# Chapter Two\n\n## Shared Name\n\n## `code` & **Bold**\n',
      'b/img/pic.png': 'png',
    },
  });
}

function build(root) {
  return assembleBook({ root, target: 'epub', build: BUILD, outDir: path.join(root, 'dist') }).text;
}

test('all supported link forms resolve to book heading ids', (t) => {
  const root = linkBook(t, [
    '[bare](02.00-two.md)',
    '[dot](./02.00-two.md#shared-name)',
    '[web](/b/02.00-two)',
    '[web anchor](/b/02.00-two#code-bold)',
    '[web html](/b/02.00-two.html#shared-name)',
    '[web base](/site/b/02.00-two#shared-name)',
    '[included](01.01-part.md#test-driven-development-tdd)',
    '[included bare](./01.01-part.md)',
    '[included dup](01.01-part.md#shared-name)',
    '[same page](#shared-name-1)',
    '[encoded](02.00-two.md#%63ode-bold)',
    '![pic](img/pic.png)',
    '[ref]: 02.00-two.md#chapter-two',
  ].join('\n'));
  const text = build(root);
  const rewritten = text.split('\n').filter((l) => /^(\[|!\[)/.test(l));
  assert.deepEqual(rewritten, [
    '[bare](#ch-02-00-two--chapter-two)',
    '[dot](#ch-02-00-two--shared-name)',
    '[web](#ch-02-00-two--chapter-two)',
    '[web anchor](#ch-02-00-two--code-bold)',
    '[web html](#ch-02-00-two--shared-name)',
    '[web base](#ch-02-00-two--shared-name)',
    '[included](#ch-01-00-one--test-driven-development-tdd)',
    '[included bare](#ch-01-00-one--included-part)',
    '[included dup](#ch-01-00-one--shared-name-1)',
    '[same page](#ch-01-00-one--shared-name-1)',
    '[encoded](#ch-02-00-two--code-bold)',
    '![pic](docs/b/img/pic.png)',
    '[ref]: #ch-02-00-two--chapter-two',
  ]);
  for (const id of rewritten.map((l) => /#([^)\s]+)/.exec(l)?.[1]).filter(Boolean)) {
    assert.match(text, new RegExp(`\\{#${id}[ }]`));
  }
});

test('custom heading ids from {#id} are honoured', (t) => {
  const root = makeBook(t, {
    sidebar: ['/b/01-a'],
    docs: { 'b/01-a.md': '# A\n## Long Title {#short}\n[x](#short)\n' },
  });
  const text = build(root);
  assert.match(text, /^## Long Title \{#ch-01-a--short\}$/m);
  assert.match(text, /^\[x\]\(#ch-01-a--short\)$/m);
});

test('unresolvable links fail with file, line and link but no body text', (t) => {
  const root = linkBook(t, [
    'SECRET-PROSE [missing file](03.00-three.md)',
    '[missing anchor](02.00-two.md#nope)',
    '[outside book](/index)',
    '[asset link](notes.txt)',
    '[bad image] ![x](missing.png)',
  ].join('\n'));
  writeTree(root, { 'docs/index.md': '# Home\n', 'docs/b/notes.txt': 'x' });
  assert.throws(() => build(root), (error) => {
    assert.ok(error instanceof BuildErrors);
    assert.deepEqual(error.messages, [
      'docs/b/01.00-one.md:7: link "03.00-three.md": docs/b/03.00-three.md is not part of the book',
      'docs/b/01.00-one.md:8: link "02.00-two.md#nope": anchor "#nope" not found in docs/b/02.00-two.md',
      'docs/b/01.00-one.md:9: link "/index": docs/index.md is not part of the book',
      'docs/b/01.00-one.md:10: link "notes.txt": links to files outside the book cannot be resolved',
      'docs/b/01.00-one.md:11: link "missing.png": file not found',
    ]);
    assert.doesNotMatch(error.message, /SECRET-PROSE/);
    return true;
  });
});
