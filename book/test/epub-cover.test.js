import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COVER, COVER_PATH, coverHtml, pngInfo } from '../scripts/generate-epub-cover.js';

test('the committed placeholder cover is an 8-bit RGB PNG at 1600x2560', () => {
  assert.deepEqual(pngInfo(fs.readFileSync(COVER_PATH)), { width: COVER.width, height: COVER.height, bitDepth: 8, colorType: 2 });
});

test('coverHtml marks the cover as a placeholder and escapes metadata', () => {
  const html = coverHtml({ title: 'A <b>&', subtitle: 'Sub', author: ['X', 'Y'] });
  assert.match(html, />PLACEHOLDER</);
  assert.match(html, /A &#60;b&#62;&#38;/);
  assert.match(html, />X, Y</);
});

test('pngInfo rejects non-PNG data', () => {
  assert.throws(() => pngInfo(Buffer.alloc(32)), /not a PNG/);
});
