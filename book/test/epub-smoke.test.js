import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEpub } from '../scripts/build-epub.js';
import { inspectEpub } from '../scripts/lib/epub-inspect.js';
import { sidebarConfig, tempDir, writeTree } from './helpers.js';

const BOOK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const copy = (...parts) => fs.readFileSync(path.join(BOOK_DIR, ...parts));

// Needs pandoc, epubcheck and Chromium, so it runs only when AIXP_EPUB_SMOKE=1 (set in CI).
test('builds a fixture book into an EPUB that passes epubcheck and the structure gate', { skip: process.env.AIXP_EPUB_SMOKE !== '1' && 'set AIXP_EPUB_SMOKE=1 to run' }, (t) => {
  const root = writeTree(tempDir(t), {
    'docs/.vitepress/config.mts': sidebarConfig(['/b/01-first', '/b/02-second']),
    'docs/b/01-first.md': [
      '# First Chapter', '', 'See [the second chapter](./02-second.md#a-section).', '',
      '```js', 'const longLine = "' + 'x'.repeat(200) + '";', '```', '',
      '| Col A | Col B |', '|---|---|', '| 1 | 2 |', '',
    ].join('\n'),
    'docs/b/02-second.md': [
      '# Second Chapter', '', '## A Section', '',
      '```mermaid', 'flowchart TD', '  accTitle: Smoke diagram', '  accDescr: Two boxes joined by an arrow', '  A --> B', '```', '',
      '```mermaid', 'flowchart LR', '  C --> D', '```', '',
      'Back to [the start](/b/01-first).', '',
    ].join('\n'),
    'book/metadata.yaml': [
      'title: Smoke Book', 'subtitle: A Fixture', 'author: Fixture Author', 'publisher: Fixture Press', 'lang: en-US',
      'rights: Fixture rights', 'edition: First', 'identifier:', '  - scheme: ISBN-13', '    text: "[PLACEHOLDER]"', '',
    ].join('\n'),
    'notes/VERSION.md': 'version=0.9.0\n',
  });
  for (const [dir, file] of [['frontmatter', 'title-page.md'], ['frontmatter', 'colophon.template.md'], ['styles', 'epub.css'], ['assets', 'cover-front.png']]) {
    fs.mkdirSync(path.join(root, 'book', dir), { recursive: true });
    fs.writeFileSync(path.join(root, 'book', dir, file), copy(dir, file));
  }

  const result = buildEpub(
    { root, outDir: path.join(root, 'dist'), version: 'v0.9.1', date: '2026-02-03', gitSha: '0123abcd' },
    { log: () => {} },
  );
  assert.equal(path.basename(result.output), 'aixp-v0.9.1.epub');
  assert.equal(result.report.ok, true);
  assert.deepEqual([result.report.fatal, result.report.errors, result.report.warnings], [0, 0, 0]);

  const epub = inspectEpub(fs.readFileSync(result.output));
  assert.deepEqual(epub.metadata.title, ['Smoke Book', 'A Fixture']);
  assert.deepEqual(epub.metadata.creator, ['Fixture Author']);
  assert.deepEqual(epub.metadata.publisher, ['Fixture Press']);
  assert.deepEqual(epub.metadata.language, ['en-US']);
  assert.deepEqual(epub.metadata.date, ['2026-02-03']);
  assert.deepEqual(epub.metadata.rights, ['Fixture rights']);
  assert.match(epub.uniqueIdentifier, /^urn:uuid:/);
  assert.equal(epub.coverImage.mediaType, 'image/png');
  assert.deepEqual(epub.tocFragments.map((f) => f.split('--')[0]), ['ch-01-first', 'ch-02-second']);
  assert.equal(epub.crossDocumentLinks >= 2, true);
  assert.deepEqual(epub.brokenLinks, []);
  assert.deepEqual(epub.images.map((i) => [i.mediaType, i.alt]), [
    ['image/svg+xml', 'Smoke diagram. Two boxes joined by an arrow'],
    ['image/svg+xml', 'Flowchart: A Section'],
  ]);
  assert.ok(epub.sectionClasses.has('title-page'));
  assert.ok(epub.sectionClasses.has('colophon'));
});
