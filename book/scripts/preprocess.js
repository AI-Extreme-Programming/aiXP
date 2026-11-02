#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { assembleBook, bookPaths, BuildErrors } from './lib/assemble.js';
import { renderDiagrams, DIAGRAM_FORMAT } from './lib/render-mermaid.js';
import { resolveBuildInfo } from './lib/template.js';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TARGETS = Object.keys(DIAGRAM_FORMAT);

const USAGE = `Usage: node book/scripts/preprocess.js [options]

  --target <epub|print|all>  build target (default: all)
  --check                    validate includes and links only; write nothing, render nothing
  --version <vX.Y.Z>         book version (default: notes/VERSION.md)
  --date <YYYY-MM-DD>        publication date (default: SOURCE_DATE_EPOCH, else HEAD commit date)
  --git-sha <sha>            commit recorded in metadata (default: GITHUB_SHA, else git rev-parse HEAD)
  --out-dir <dir>            output directory (default: <root>/dist)
  --root <dir>               repository root (default: two levels above this script)
  --help                     show this message

Outputs per target: <out-dir>/<target>/unified-manuscript.md and
<out-dir>/<target>/mermaid/mermaid-<id>.<svg|pdf>. Image paths inside the
Markdown are relative to <root>, so run Pandoc from the repository root.`;

export function parseCli(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      target: { type: 'string', default: 'all' },
      check: { type: 'boolean', default: false },
      version: { type: 'string' },
      date: { type: 'string' },
      'git-sha': { type: 'string' },
      'out-dir': { type: 'string' },
      root: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });
  const targets = values.target === 'all' ? TARGETS : [values.target];
  for (const t of targets) if (!TARGETS.includes(t)) throw new Error(`unknown target "${t}"`);
  const root = path.resolve(values.root ?? DEFAULT_ROOT);
  return {
    help: values.help,
    check: values.check,
    targets,
    root,
    outDir: path.resolve(values['out-dir'] ?? path.join(root, 'dist')),
    version: values.version,
    date: values.date,
    gitSha: values['git-sha'],
  };
}

export function run(options, { log = console.log, render = renderDiagrams } = {}) {
  const build = resolveBuildInfo({
    root: options.root,
    version: options.version,
    date: options.date,
    gitSha: options.gitSha ?? (options.check ? 'check-mode' : undefined),
    versionFile: bookPaths(options.root).versionFile,
  });
  const rel = (p) => path.relative(options.root, p).split(path.sep).join('/');
  for (const target of options.targets) {
    const book = assembleBook({ root: options.root, target, build, outDir: options.outDir });
    const { chapters, includedFiles, links, headings, diagrams } = book.stats;
    const summary = `chapters=${chapters} included=${includedFiles} links=${links} headings=${headings} diagrams=${diagrams}`;
    if (options.check) {
      log(`check ${target}: ok (${summary})`);
      continue;
    }
    const targetDir = path.join(options.outDir, target);
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.mkdirSync(targetDir, { recursive: true });
    render(book.diagrams, { outDir: book.diagramDir, format: DIAGRAM_FORMAT[target] });
    const output = path.join(targetDir, 'unified-manuscript.md');
    fs.writeFileSync(output, book.text);
    log(`preprocess ${target}: ${build.version} ${build.date} (${summary}) -> ${rel(output)}`);
  }
}

function main() {
  let options;
  try {
    options = parseCli(process.argv.slice(2));
  } catch (error) {
    console.error(`preprocess: ${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  try {
    run(options);
    return 0;
  } catch (error) {
    if (error instanceof BuildErrors) {
      console.error(`preprocess: ${error.messages.length} problem(s):`);
      for (const message of error.messages) console.error(`  ${message}`);
    } else {
      console.error(`preprocess: ${error.message}`);
    }
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
