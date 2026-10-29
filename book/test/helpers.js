import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

export function tempDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aixp-book-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

export function writeTree(root, files) {
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, ...name.split('/'));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  return root;
}

export function sidebarConfig(links) {
  const items = links.map((l) => `      { text: 'x', link: '${l}' },`).join('\n');
  return `import { defineConfig } from 'vitepress'\nexport default defineConfig({\n  base: '/site/',\n  themeConfig: {\n    sidebar: [\n${items}\n    ]\n  }\n})\n`;
}

export const BOOK_FURNITURE = {
  'book/metadata.yaml': [
    'title: Test Book',
    'subtitle: A Subtitle',
    'author: Test Author',
    'publisher: Test Press',
    'rights: Test rights',
    'edition: Test edition',
    'identifier:',
    '  - scheme: ISBN-13',
    '    text: "000-TEST"',
    '',
  ].join('\n'),
  'book/frontmatter/title-page.md': '# {{title}} {.unnumbered}\n\n{{subtitle}}\n',
  'book/frontmatter/colophon.template.md': '# Colophon {.unnumbered}\n\nVersion {{version}}, {{publication-date}}, ISBN {{isbn}}\n',
  'notes/VERSION.md': 'version=1.2.3\n',
};

export function makeBook(t, { sidebar, docs }) {
  const root = tempDir(t);
  const files = { ...BOOK_FURNITURE, 'docs/.vitepress/config.mts': sidebarConfig(sidebar) };
  for (const [name, content] of Object.entries(docs)) files[`docs/${name}`] = content;
  return writeTree(root, files);
}

export const BUILD = { version: 'v1.2.3', date: '2026-01-02', gitSha: 'abc123', buildTimestamp: '2026-01-02T03:04:05.000Z' };
