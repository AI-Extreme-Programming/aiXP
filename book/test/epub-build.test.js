import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  epubFileName,
  epubIdentifier,
  epubMetadataOverrides,
  isValidIsbn13,
  manuscriptBuildInfo,
  pandocArgs,
  sourceDateEpoch,
  uuidV5,
} from '../scripts/lib/epub-build.js';
import { buildEpub, parseCli } from '../scripts/build-epub.js';
import { BUILD, makeBook } from './helpers.js';

test('isValidIsbn13 checks prefix, length and check digit', () => {
  assert.equal(isValidIsbn13('978-0-306-40615-7'), true);
  assert.equal(isValidIsbn13('urn:isbn:9780306406157'), true);
  assert.equal(isValidIsbn13('978-0-306-40615-8'), false);
  assert.equal(isValidIsbn13('0306406152'), false);
  assert.equal(isValidIsbn13('[PLACEHOLDER: ISBN not yet assigned]'), false);
  assert.equal(isValidIsbn13(undefined), false);
});

test('uuidV5 matches the RFC 9562 name-based example', () => {
  assert.equal(uuidV5('www.example.com', '6ba7b810-9dad-11d1-80b4-00c04fd430c8'), '2ed6657d-e927-568b-95e1-2665a8aea6a2');
});

test('epubIdentifier prefers a valid ISBN-13', () => {
  const id = epubIdentifier({ title: 'T', author: 'A', identifier: [{ scheme: 'ISBN-13', text: '978-0-306-40615-7' }] });
  assert.deepEqual(id, { scheme: 'ISBN-13', text: 'urn:isbn:9780306406157', source: 'isbn' });
});

test('epubIdentifier falls back to a stable UUID when the ISBN is a placeholder', () => {
  const metadata = { title: 'aiXP', author: 'Scott Kirvan', identifier: [{ scheme: 'ISBN-13', text: '[PLACEHOLDER: ISBN not yet assigned]' }] };
  const id = epubIdentifier(metadata);
  assert.equal(id.source, 'uuid');
  assert.match(id.text, /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(epubIdentifier({ ...metadata, identifier: undefined }).text, id.text);
  assert.notEqual(epubIdentifier({ ...metadata, title: 'Other' }).text, id.text);
});

test('epubMetadataOverrides sets the identifier and a typed title with subtitle', () => {
  const overrides = YAML.parse(epubMetadataOverrides({ title: 'T', subtitle: 'S', author: 'A', identifier: [] }));
  assert.equal(overrides.identifier.length, 1);
  assert.equal(overrides.identifier[0].scheme, 'UUID');
  assert.deepEqual(overrides.title, [{ type: 'main', text: 'T' }, { type: 'subtitle', text: 'S' }]);
  assert.equal(YAML.parse(epubMetadataOverrides({ title: 'T', author: 'A' })).title, undefined);
});

test('manuscriptBuildInfo reads the preprocessor metadata block', () => {
  const text = '---\ndate: "2026-01-02"\nbook-version: "v1.2.3"\ngit-commit: "abc"\nbuild-timestamp: "2026-01-02T03:04:05.000Z"\nbuild-target: "epub"\n---\n\n# Body\n';
  assert.deepEqual(manuscriptBuildInfo(text), { version: 'v1.2.3', date: '2026-01-02', gitSha: 'abc', buildTimestamp: '2026-01-02T03:04:05.000Z' });
  assert.throws(() => manuscriptBuildInfo('# no metadata\n'), /no leading YAML/);
  assert.throws(() => manuscriptBuildInfo('---\ndate: "2026-01-02"\n---\n'), /missing "book-version"/);
});

test('epubFileName and sourceDateEpoch', () => {
  assert.equal(epubFileName('v1.2.3'), 'aixp-v1.2.3.epub');
  assert.equal(epubFileName('v1.2.3-rc.1'), 'aixp-v1.2.3-rc.1.epub');
  assert.throws(() => epubFileName('../x'), /not of the form/);
  assert.equal(sourceDateEpoch('2026-01-02T03:04:05.000Z'), '1767323045');
  assert.throws(() => sourceDateEpoch('nope'), /not a valid date/);
});

test('pandocArgs uses root-relative paths and the design flags', () => {
  const root = path.resolve('/repo');
  const args = pandocArgs({
    root,
    manuscript: path.join(root, 'dist', 'epub', 'unified-manuscript.md'),
    metadataFile: path.join(root, 'book', 'metadata.yaml'),
    overridesFile: path.join(root, 'dist', 'epub', 'epub-metadata.yaml'),
    css: path.join(root, 'book', 'styles', 'epub.css'),
    cover: path.join(root, 'book', 'assets', 'cover-front.png'),
    output: path.join(root, 'dist', 'aixp-v1.0.0.epub'),
  });
  assert.equal(args[0], 'dist/epub/unified-manuscript.md');
  for (const flag of [
    '--to=epub3',
    '--epub-cover-image=book/assets/cover-front.png',
    '--css=book/styles/epub.css',
    '--toc',
    '--toc-depth=2',
    '--epub-title-page=false',
  ]) assert.ok(args.includes(flag), flag);
  const metadataFiles = args.filter((a) => a.startsWith('--metadata-file='));
  assert.deepEqual(metadataFiles, ['--metadata-file=book/metadata.yaml', '--metadata-file=dist/epub/epub-metadata.yaml']);
  assert.deepEqual(args.slice(-2), ['-o', 'dist/aixp-v1.0.0.epub']);
});

test('parseCli passes version, date and git SHA through', () => {
  const options = parseCli(['--version', 'v2.0.0', '--date', '2026-03-04', '--git-sha', 'deadbeef', '--root', '/r']);
  assert.equal(options.version, 'v2.0.0');
  assert.equal(options.date, '2026-03-04');
  assert.equal(options.gitSha, 'deadbeef');
  assert.equal(options.outDir, path.join(path.resolve('/r'), 'dist'));
  assert.throws(() => parseCli(['--bogus']));
});

function fakeTools(t, { report }) {
  const root = makeBook(t, { sidebar: ['/b/01-a'], docs: { 'b/01-a.md': '# A\n\nText.\n' } });
  const calls = [];
  const preprocessed = [];
  const runPreprocess = (options) => {
    preprocessed.push(options);
    const dir = path.join(options.outDir, 'epub');
    fs.mkdirSync(dir, { recursive: true });
    const meta = `---\ndate: "${options.date}"\nbook-version: "${options.version}"\ngit-commit: "${options.gitSha}"\nbuild-timestamp: "${BUILD.buildTimestamp}"\n---\n`;
    fs.writeFileSync(path.join(dir, 'unified-manuscript.md'), meta);
  };
  const runTool = (command, args, spawnOptions) => {
    calls.push({ command, args, spawnOptions });
    if (args[0] === '--version') return { status: 0, output: 'pandoc 3.8.2.1\n' };
    fs.writeFileSync(path.join(root, args[args.indexOf('-o') + 1]), 'not really an epub');
    return { status: 0, output: '' };
  };
  const check = () => report;
  return { root, calls, preprocessed, deps: { runPreprocess, runTool, check, log: () => {} } };
}

test('buildEpub passes build info through and fails when epubcheck reports warnings', (t) => {
  const report = { ok: false, status: 1, version: '5.4.0', fatal: 0, errors: 0, warnings: 1, failing: [{ severity: 'WARNING', id: 'X-1', message: 'm', locations: [] }] };
  const { root, calls, preprocessed, deps } = fakeTools(t, { report });
  const logged = [];
  assert.throws(
    () => buildEpub({ root, outDir: path.join(root, 'dist'), version: 'v3.1.4', date: '2026-05-06', gitSha: 'cafe' }, { ...deps, log: (m) => logged.push(m) }),
    /epubcheck 5\.4\.0 rejected dist\/aixp-v3\.1\.4\.epub \(0 fatal, 0 errors, 1 warnings/,
  );
  assert.deepEqual(preprocessed[0].targets, ['epub']);
  assert.equal(preprocessed[0].version, 'v3.1.4');
  assert.equal(preprocessed[0].date, '2026-05-06');
  assert.equal(preprocessed[0].gitSha, 'cafe');
  const pandoc = calls.find((c) => c.args.includes('--to=epub3'));
  assert.equal(pandoc.spawnOptions.cwd, root);
  assert.equal(pandoc.spawnOptions.env.SOURCE_DATE_EPOCH, sourceDateEpoch(BUILD.buildTimestamp));
  assert.ok(pandoc.args.includes('--fail-if-warnings'));
  assert.ok(logged.some((m) => m.includes('WARNING X-1')));
  const overrides = YAML.parse(fs.readFileSync(path.join(root, 'dist', 'epub', 'epub-metadata.yaml'), 'utf8'));
  assert.equal(overrides.identifier[0].scheme, 'UUID');
});

test('buildEpub fails when pandoc fails', (t) => {
  const { root, deps } = fakeTools(t, { report: null });
  const runTool = (command, args) => (args[0] === '--version' ? { status: 0, output: 'pandoc' } : { status: 64, output: 'boom' });
  assert.throws(() => buildEpub({ root, outDir: path.join(root, 'dist'), version: 'v1.0.0', date: '2026-01-01', gitSha: 'x' }, { ...deps, runTool }), /pandoc failed \(exit 64\)/);
});
