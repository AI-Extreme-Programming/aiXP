import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EPUBCHECK_VERSION,
  checkEpub,
  epubcheckCommand,
  formatFinding,
  parseEpubcheckVersion,
  summarizeReport,
} from '../scripts/lib/epub-check.js';

const BOOK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('epubcheckCommand uses EPUBCHECK_JAR with JAVA_HOME, else the launcher on PATH', () => {
  assert.deepEqual(epubcheckCommand({}), { command: 'epubcheck', prefix: [] });
  assert.deepEqual(epubcheckCommand({ EPUBCHECK_JAR: '/e.jar' }), { command: 'java', prefix: ['-jar', '/e.jar'] });
  assert.deepEqual(epubcheckCommand({ EPUBCHECK_JAR: '/e.jar', JAVA_HOME: '/jdk' }).command, path.join('/jdk', 'bin', 'java'));
});

test('parseEpubcheckVersion', () => {
  assert.equal(parseEpubcheckVersion('EPUBCheck v5.4.0\n'), '5.4.0');
  assert.equal(parseEpubcheckVersion('command not found'), null);
});

test('summarizeReport counts failing severities and ignores usage and info', () => {
  const summary = summarizeReport({
    messages: [
      { ID: 'RSC-005', severity: 'ERROR', message: 'bad', locations: [{ path: 'EPUB/text/ch001.xhtml', line: 3, column: 7 }] },
      { ID: 'CSS-028', severity: 'USAGE', message: 'font', locations: [] },
      { ID: 'OPF-085', severity: 'WARNING', message: 'warn', locations: [{ path: 'EPUB/content.opf', line: -1, column: -1 }] },
      { ID: 'PKG-008', severity: 'FATAL', message: 'fatal', locations: [] },
      { ID: 'INFO-1', severity: 'INFO', message: 'i' },
    ],
  });
  assert.deepEqual([summary.fatal, summary.errors, summary.warnings], [1, 1, 1]);
  assert.equal(summary.failing.length, 3);
  assert.equal(formatFinding(summary.failing[0]), 'ERROR RSC-005: bad [EPUB/text/ch001.xhtml:3:7]');
  assert.equal(formatFinding(summary.failing[1]), 'WARNING OPF-085: warn [EPUB/content.opf]');
});

function fakeEpubcheck({ version = EPUBCHECK_VERSION, messages = [], status = 0, writeReport = true } = {}) {
  const calls = [];
  const run = (command, args) => {
    calls.push(args);
    if (args.includes('--version')) return { status: 0, output: `EPUBCheck v${version}\n` };
    if (writeReport) fs.writeFileSync(args[args.indexOf('--json') + 1], JSON.stringify({ messages }));
    return { status, output: '' };
  };
  return { run, calls };
}

test('checkEpub passes a clean report and runs with --failonwarnings', () => {
  const { run, calls } = fakeEpubcheck();
  const result = checkEpub('book.epub', { env: {}, run });
  assert.equal(result.ok, true);
  assert.equal(result.version, EPUBCHECK_VERSION);
  assert.ok(calls[1].includes('--failonwarnings'));
  assert.equal(calls[1][0], 'book.epub');
});

test('checkEpub fails on a single warning', () => {
  const { run } = fakeEpubcheck({ status: 1, messages: [{ ID: 'W', severity: 'WARNING', message: 'w', locations: [] }] });
  const result = checkEpub('book.epub', { env: {}, run });
  assert.equal(result.ok, false);
  assert.equal(result.warnings, 1);
});

test('checkEpub fails on a non-zero exit even without messages', () => {
  const { run } = fakeEpubcheck({ status: 2 });
  assert.equal(checkEpub('book.epub', { env: {}, run }).ok, false);
});

test('checkEpub rejects an unpinned epubcheck version, a missing tool and a missing report', () => {
  assert.throws(() => checkEpub('b.epub', { env: {}, run: fakeEpubcheck({ version: '5.1.0' }).run }), /epubcheck 5\.1\.0 found, but the build is pinned to/);
  assert.throws(() => checkEpub('b.epub', { env: {}, run: () => ({ status: 127, output: 'not found' }) }), /could not run epubcheck/);
  assert.throws(() => checkEpub('b.epub', { env: {}, run: fakeEpubcheck({ writeReport: false, status: 1 }).run }), /produced no report/);
});

test('the CI install script pins the same epubcheck version as the gate', () => {
  const script = fs.readFileSync(path.join(BOOK_DIR, 'scripts', 'ci', 'install-epub-tools.sh'), 'utf8');
  assert.match(script, new RegExp(`^EPUBCHECK_VERSION="${EPUBCHECK_VERSION.replace(/\./g, '\\.')}"$`, 'm'));
});
