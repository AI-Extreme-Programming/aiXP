import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { inspectEpub, readZip, structureProblems } from '../scripts/lib/epub-inspect.js';

// Minimal zip writer: stored or deflated entries, enough to exercise the reader.
function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content, method = 8] of entries) {
    const raw = Buffer.from(content);
    const data = method === 8 ? zlib.deflateRawSync(raw) : raw;
    const nameBuf = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(zlib.crc32(raw), 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(zlib.crc32(raw), 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, data);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}

const xhtml = (body) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body>${body}</body></html>`;

function sampleEpub({ alt = 'Flowchart: Two', link = 'ch003.xhtml#ch-02--two', tocOrder = ['ch-01', 'ch-02'], cover = true, epubTypes = true } = {}) {
  const tocItems = tocOrder.map((p, i) => `<li><a href="text/ch00${i + 2}.xhtml#${p}--x">x</a><ol><li><a href="text/ch00${i + 2}.xhtml#${p}--sub">s</a></li></ol></li>`).join('');
  return zip([
    ['mimetype', 'application/epub+zip', 0],
    ['META-INF/container.xml', '<container><rootfiles><rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['EPUB/content.opf', `<package unique-identifier="epub-id-1"><metadata>
      <dc:identifier id="epub-id-1">urn:uuid:1234</dc:identifier><dc:title id="t1">Main</dc:title><dc:title id="t2">Sub &amp; title</dc:title>
      </metadata><manifest>
      <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
      ${cover ? '<item properties="cover-image" id="c" href="media/cover.png" media-type="image/png" />' : ''}
      <item id="d" href="media/d.svg" media-type="image/svg+xml" />
      <item id="ch001_xhtml" href="text/ch001.xhtml" media-type="application/xhtml+xml" />
      <item id="ch002_xhtml" href="text/ch002.xhtml" media-type="application/xhtml+xml" />
      <item id="ch003_xhtml" href="text/ch003.xhtml" media-type="application/xhtml+xml" />
      <item id="ch004_xhtml" href="text/ch004.xhtml" media-type="application/xhtml+xml" />
      </manifest><spine><itemref idref="nav" /><itemref idref="ch001_xhtml" /><itemref idref="ch002_xhtml" /></spine></package>`],
    ['EPUB/nav.xhtml', xhtml(`<nav epub:type="toc" id="toc"><ol>${tocItems}</ol></nav><nav epub:type="landmarks"><ol><li><a href="text/ch001.xhtml">l</a></li></ol></nav>`)],
    ['EPUB/text/ch001.xhtml', xhtml(`<section id="title-page--t" class="level1 title-page"${epubTypes ? ' epub:type="titlepage"' : ''}><h1>T</h1></section>`)],
    ['EPUB/text/ch002.xhtml', xhtml(`<section id="ch-01--x"><h1 id="ch-01--sub">One</h1><a href="${link}">l</a><a href="https://example.com/">e</a></section>`)],
    ['EPUB/text/ch003.xhtml', xhtml(`<section id="ch-02--x"><h2 id="ch-02--two">Two</h2><h2 id="ch-02--sub">S</h2><p><img src="../media/d.svg" alt="${alt}" /></p></section>`)],
    ['EPUB/text/ch004.xhtml', xhtml(`<section id="colophon--c" class="colophon"${epubTypes ? ' epub:type="colophon"' : ''}><h1>C</h1></section>`)],
  ]);
}

const PREFIXES = ['ch-01', 'ch-02'];

test('readZip reads stored and deflated entries in order', () => {
  const { order, files } = readZip(zip([['a', 'stored', 0], ['b/c.txt', 'deflated text']]));
  assert.deepEqual(order, [{ name: 'a', method: 0 }, { name: 'b/c.txt', method: 8 }]);
  assert.equal(files.get('b/c.txt').toString(), 'deflated text');
  assert.throws(() => readZip(Buffer.from('not a zip at all, definitely not')), /not a zip/);
});

test('inspectEpub summarises a well-formed EPUB with no structure problems', () => {
  const summary = inspectEpub(sampleEpub());
  assert.equal(summary.mimetypeFirst, true);
  assert.equal(summary.uniqueIdentifier, 'urn:uuid:1234');
  assert.deepEqual(summary.metadata.title, ['Main', 'Sub & title']);
  assert.deepEqual(summary.coverImage, { href: 'EPUB/media/cover.png', mediaType: 'image/png' });
  assert.deepEqual(summary.tocFragments, ['ch-01--x', 'ch-02--x']);
  assert.equal(summary.crossDocumentLinks, 1);
  assert.deepEqual(summary.images, [{ document: 'EPUB/text/ch003.xhtml', src: 'EPUB/media/d.svg', mediaType: 'image/svg+xml', alt: 'Flowchart: Two' }]);
  assert.deepEqual(structureProblems(summary, { chapterPrefixes: PREFIXES }), []);
});

test('structureProblems reports broken links, empty alt text, TOC order and a missing cover', () => {
  const problems = structureProblems(inspectEpub(sampleEpub({ alt: '', link: 'ch003.xhtml#nope', tocOrder: ['ch-02', 'ch-01'], cover: false })), { chapterPrefixes: PREFIXES });
  assert.ok(problems.some((p) => p === 'broken link EPUB/text/ch002.xhtml -> ch003.xhtml#nope'), problems.join('\n'));
  assert.ok(problems.some((p) => /has empty alt text/.test(p)));
  assert.ok(problems.some((p) => /do not match sidebar order/.test(p)));
  assert.ok(problems.includes('no cover-image in the manifest'));
});

test('structureProblems reports a title page and colophon without EPUB structural semantics', () => {
  const problems = structureProblems(inspectEpub(sampleEpub({ epubTypes: false })), { chapterPrefixes: PREFIXES });
  assert.ok(problems.includes('no section with epub:type="titlepage"'), problems.join('\n'));
  assert.ok(problems.includes('no section with epub:type="colophon"'), problems.join('\n'));
});
