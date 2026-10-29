import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { diagramId, extractMermaid, uniqueDiagrams } from '../scripts/lib/mermaid.js';
import { mmdcArgs, renderDiagrams } from '../scripts/lib/render-mermaid.js';
import { assembleBook } from '../scripts/lib/assemble.js';
import { BUILD, makeBook, tempDir } from './helpers.js';

const lines = (text) => text.split('\n').map((t, i) => ({ text: t, file: 'f.md', line: i }));

test('extractMermaid replaces mermaid fences only', () => {
  const src = 'a\n```mermaid\nflowchart TD\n  A --> B\n```\n```js\nx\n```\n  ~~~ mermaid\n  graph LR\n  ~~~\nz';
  const { lines: out, diagrams } = extractMermaid(lines(src), (d) => `IMG ${d.id}`);
  assert.equal(diagrams.length, 2);
  assert.equal(diagrams[0].source, 'flowchart TD\n  A --> B');
  assert.equal(diagrams[0].id, diagramId('flowchart TD\n  A --> B'));
  assert.equal(diagrams[0].line, 1);
  assert.deepEqual(out.map((l) => l.text), ['a', `IMG ${diagrams[0].id}`, '```js', 'x', '```', `  IMG ${diagrams[1].id}`, 'z']);
});

test('extractMermaid ignores mermaid text nested in another fence', () => {
  const src = '````md\n```mermaid\ngraph\n```\n````';
  const { lines: out, diagrams } = extractMermaid(lines(src), () => 'IMG');
  assert.equal(diagrams.length, 0);
  assert.equal(out.length, 5);
});

test('diagramId is stable across line endings and uniqueDiagrams dedupes', () => {
  assert.equal(diagramId('a\r\nb'), diagramId('a\nb'));
  const d = { id: 'x', source: 's' };
  assert.deepEqual(uniqueDiagrams([d, { ...d }, { id: 'y', source: 't' }]).map((x) => x.id), ['x', 'y']);
});

test('assembled book references per-target image paths', (t) => {
  const root = makeBook(t, { sidebar: ['/b/01-a'], docs: { 'b/01-a.md': '# A\n```mermaid\ngraph TD\n```\n' } });
  const outDir = path.join(root, 'dist');
  const epub = assembleBook({ root, target: 'epub', build: BUILD, outDir });
  const print = assembleBook({ root, target: 'print', build: BUILD, outDir });
  const id = diagramId('graph TD');
  assert.match(epub.text, new RegExp(`^!\\[\\]\\(dist/epub/mermaid/mermaid-${id}\\.svg\\)$`, 'm'));
  assert.match(print.text, new RegExp(`^!\\[\\]\\(dist/print/mermaid/mermaid-${id}\\.pdf\\)$`, 'm'));
  assert.doesNotMatch(epub.text, /```mermaid/);
  assert.deepEqual(epub.diagrams.map((d) => d.id), [id]);
});

test('mmdcArgs selects the output format', () => {
  const args = mmdcArgs({ input: 'i.mmd', output: 'o.pdf', format: 'pdf', configFile: 'c.json', puppeteerConfigFile: 'p.json' });
  assert.deepEqual(args.slice(0, 6), ['-i', 'i.mmd', '-o', 'o.pdf', '-e', 'pdf']);
  assert.ok(args.includes('-q'));
});

test('renderDiagrams runs mmdc per diagram without Chromium', (t) => {
  const outDir = path.join(tempDir(t), 'mermaid');
  const calls = [];
  const run = (args) => {
    const input = args[args.indexOf('-i') + 1];
    calls.push(fs.readFileSync(input, 'utf8'));
    fs.writeFileSync(args[args.indexOf('-o') + 1], '<svg/>');
    return { status: 0, output: '' };
  };
  const outputs = renderDiagrams([{ id: 'aaa', source: 'graph A' }, { id: 'bbb', source: 'graph B' }], { outDir, format: 'svg', run });
  assert.deepEqual(outputs.map((o) => path.basename(o)), ['mermaid-aaa.svg', 'mermaid-bbb.svg']);
  assert.deepEqual(calls, ['graph A\n', 'graph B\n']);
});

test('renderDiagrams keeps mmdc output out of the error message', (t) => {
  const outDir = path.join(tempDir(t), 'mermaid');
  const run = () => ({ status: 1, output: 'Parse error near SECRET-DIAGRAM-TEXT' });
  assert.throws(
    () => renderDiagrams([{ id: 'ccc', source: 'SECRET-DIAGRAM-TEXT' }], { outDir, format: 'pdf', run }),
    (error) => {
      assert.match(error.message, /mermaid render failed for diagram ccc \(exit 1\)/);
      assert.doesNotMatch(error.message, /SECRET/);
      assert.match(fs.readFileSync(path.join(outDir, 'mermaid-ccc.log'), 'utf8'), /SECRET/);
      return true;
    },
  );
});
