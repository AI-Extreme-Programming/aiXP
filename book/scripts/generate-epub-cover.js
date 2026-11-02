#!/usr/bin/env node
// Regenerate the placeholder cover with: node book/scripts/generate-epub-cover.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const BOOK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const COVER = { width: 1600, height: 2560 };
export const COVER_PATH = path.join(BOOK_DIR, 'assets', 'cover-front.png');

const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Open Sans (SIL OFL 1.1) ships with mermaid-cli, so the cover renders the same on every OS.
function fontFace(weight) {
  const file = path.join(BOOK_DIR, 'node_modules', '@fontsource', 'open-sans', 'files', `open-sans-latin-${weight}-normal.woff2`);
  if (!fs.existsSync(file)) throw new Error(`${file} not found; run "npm ci" in book/`);
  const data = fs.readFileSync(file).toString('base64');
  return `@font-face { font-family: "Cover Sans"; font-weight: ${weight}; src: url(data:font/woff2;base64,${data}) format("woff2"); }`;
}

export function coverHtml(metadata, fonts = '') {
  const author = Array.isArray(metadata.author) ? metadata.author.join(', ') : metadata.author;
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
${fonts}
html, body { margin: 0; width: ${COVER.width}px; height: ${COVER.height}px; }
body { background: #1f2a36; color: #f4f1ea; font-family: "Cover Sans", sans-serif;
  display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; padding: 220px 150px 180px; }
.title { font-size: 300px; font-weight: 700; line-height: 1; letter-spacing: -4px; }
.subtitle { margin-top: 70px; font-size: 76px; line-height: 1.25; font-weight: 400; }
.rule { margin-top: 90px; height: 12px; width: 420px; background: #c8a74a; }
.placeholder { align-self: stretch; border: 10px dashed #c8a74a; color: #c8a74a; text-align: center;
  padding: 50px 0 60px; font-size: 128px; font-weight: 700; letter-spacing: 12px; }
.placeholder small { display: block; margin-top: 18px; font-size: 48px; letter-spacing: 2px; font-weight: 400; color: #f4f1ea; }
.author { font-size: 96px; font-weight: 700; }
</style></head><body>
<div><div class="title">${escapeHtml(metadata.title)}</div>
<div class="subtitle">${escapeHtml(metadata.subtitle)}</div>
<div class="rule"></div></div>
<div class="placeholder">PLACEHOLDER<small>Cover artwork not final</small></div>
<div class="author">${escapeHtml(author)}</div>
</body></html>`;
}

export function pngInfo(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature || buffer.subarray(12, 16).toString('latin1') !== 'IHDR') {
    throw new Error('not a PNG file');
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25],
  };
}

export async function generateCover({ metadataFile = path.join(BOOK_DIR, 'metadata.yaml'), output = COVER_PATH } = {}) {
  const { default: puppeteer } = await import('puppeteer');
  const metadata = YAML.parse(fs.readFileSync(metadataFile, 'utf8')) ?? {};
  const { args } = JSON.parse(fs.readFileSync(path.join(BOOK_DIR, 'config', 'puppeteer.json'), 'utf8'));
  const browser = await puppeteer.launch({ headless: 'shell', args });
  try {
    const page = await browser.newPage();
    await page.setViewport({ ...COVER, deviceScaleFactor: 1 });
    await page.setContent(coverHtml(metadata, fontFace(400) + fontFace(700)), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = Buffer.from(await page.screenshot({ type: 'png', omitBackground: false }));
    const info = pngInfo(png);
    if (info.width !== COVER.width || info.height !== COVER.height || info.colorType !== 2 || info.bitDepth !== 8) {
      throw new Error(`unexpected cover image ${JSON.stringify(info)}; expected 8-bit RGB ${COVER.width}x${COVER.height}`);
    }
    fs.writeFileSync(output, png);
    return info;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateCover().then(
    (info) => console.log(`cover: ${path.relative(process.cwd(), COVER_PATH)} ${info.width}x${info.height} RGB`),
    (error) => {
      console.error(`generate-epub-cover: ${error.message}`);
      process.exitCode = 1;
    },
  );
}
