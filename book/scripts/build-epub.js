#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { run as preprocess } from './preprocess.js';
import { BuildErrors, bookPaths, chapterPrefix } from './lib/assemble.js';
import { loadSidebarFiles } from './lib/sidebar.js';
import { inspectEpub, structureProblems } from './lib/epub-inspect.js';
import {
  epubFileName,
  epubIdentifier,
  epubMetadataOverrides,
  manuscriptBuildInfo,
  pandocArgs,
  sourceDateEpoch,
} from './lib/epub-build.js';
import { checkEpub, formatFinding, spawnTool } from './lib/epub-check.js';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const USAGE = `Usage: node book/scripts/build-epub.js [options]

Preprocesses the manuscript for the epub target, builds the EPUB3 with Pandoc,
and fails unless the pinned epubcheck reports zero errors and zero warnings.

  --version <vX.Y.Z>    book version (default: notes/VERSION.md)
  --date <YYYY-MM-DD>   publication date (default: SOURCE_DATE_EPOCH, else HEAD commit date)
  --git-sha <sha>       commit recorded in metadata (default: GITHUB_SHA, else git rev-parse HEAD)
  --out-dir <dir>       output directory (default: <root>/dist)
  --root <dir>          repository root (default: two levels above this script)
  --help                show this message

Output: <out-dir>/aixp-<version>.epub
Tools: pandoc on PATH; epubcheck on PATH, or EPUBCHECK_JAR (+ JAVA_HOME or java on PATH).`;

export function parseCli(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      version: { type: 'string' },
      date: { type: 'string' },
      'git-sha': { type: 'string' },
      'out-dir': { type: 'string' },
      root: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });
  const root = path.resolve(values.root ?? DEFAULT_ROOT);
  return {
    help: values.help,
    root,
    outDir: path.resolve(values['out-dir'] ?? path.join(root, 'dist')),
    version: values.version,
    date: values.date,
    gitSha: values['git-sha'],
  };
}

export function buildEpub(options, { log = console.log, runTool = spawnTool, check = checkEpub, runPreprocess = preprocess } = {}) {
  const { root, outDir } = options;
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');
  runPreprocess(
    { targets: ['epub'], root, outDir, version: options.version, date: options.date, gitSha: options.gitSha, check: false },
    { log },
  );

  const manuscript = path.join(outDir, 'epub', 'unified-manuscript.md');
  const build = manuscriptBuildInfo(fs.readFileSync(manuscript, 'utf8'));
  const metadataFile = path.join(root, 'book', 'metadata.yaml');
  const metadata = YAML.parse(fs.readFileSync(metadataFile, 'utf8')) ?? {};
  const identifier = epubIdentifier(metadata);
  if (identifier.source !== 'isbn') log(`epub: no valid ISBN-13 in ${rel(metadataFile)}; identifier is ${identifier.text}`);

  const overridesFile = path.join(outDir, 'epub', 'epub-metadata.yaml');
  fs.writeFileSync(overridesFile, epubMetadataOverrides(metadata));
  const output = path.join(outDir, epubFileName(build.version));
  fs.rmSync(output, { force: true });

  const pandoc = runTool('pandoc', ['--version']);
  if (pandoc.status !== 0) throw new Error('pandoc is not available on PATH; run book/scripts/ci/install-epub-tools.sh');
  log(`epub: ${pandoc.output.split(/\r?\n/)[0]}`);
  const args = pandocArgs({
    root,
    manuscript,
    metadataFile,
    overridesFile,
    css: path.join(root, 'book', 'styles', 'epub.css'),
    cover: path.join(root, 'book', 'assets', 'cover-front.png'),
    output,
  });
  const result = runTool('pandoc', [...args, '--fail-if-warnings'], { cwd: root, env: { SOURCE_DATE_EPOCH: sourceDateEpoch(build.buildTimestamp) } });
  if (result.output.trim()) log(result.output.trim());
  if (result.status !== 0 || !fs.existsSync(output)) throw new Error(`pandoc failed (exit ${result.status})`);

  const report = check(output);
  for (const finding of report.failing) log(`epubcheck: ${formatFinding(finding)}`);
  const counts = `${report.fatal} fatal, ${report.errors} errors, ${report.warnings} warnings`;
  if (!report.ok) throw new Error(`epubcheck ${report.version} rejected ${rel(output)} (${counts}, exit ${report.status})`);

  const { files: chapterFiles } = loadSidebarFiles(bookPaths(root).config);
  const structure = inspectEpub(fs.readFileSync(output));
  const problems = structureProblems(structure, { chapterPrefixes: chapterFiles.map(chapterPrefix) });
  if (problems.length) throw new BuildErrors(problems.map((p) => `${rel(output)}: ${p}`));
  log(`epub: structure ok (${structure.tocFragments.length} chapters in TOC, ${structure.internalLinks} internal links, ${structure.images.length} images with alt text)`);
  log(`epub: ${build.version} ${build.date} ${build.gitSha} -> ${rel(output)} (epubcheck ${report.version}: ${counts})`);
  return { output, build, identifier, report };
}

function main() {
  let options;
  try {
    options = parseCli(process.argv.slice(2));
  } catch (error) {
    console.error(`build-epub: ${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  try {
    buildEpub(options);
    return 0;
  } catch (error) {
    if (error instanceof BuildErrors) {
      console.error(`build-epub: ${error.messages.length} problem(s):`);
      for (const message of error.messages) console.error(`  ${message}`);
    } else {
      console.error(`build-epub: ${error.message}`);
    }
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
