import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BOOK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const DIAGRAM_FORMAT = { epub: 'svg', print: 'pdf' };

export function mmdcArgs({ input, output, format, configFile, puppeteerConfigFile }) {
  return ['-i', input, '-o', output, '-e', format, '-c', configFile, '-p', puppeteerConfigFile, '-b', 'white', '-q'];
}

// Spawns mermaid-cli with node directly so Windows .cmd shims are never involved.
export function spawnMmdc(args) {
  const cli = path.join(BOOK_DIR, 'node_modules', '@mermaid-js', 'mermaid-cli', 'src', 'cli.js');
  if (!fs.existsSync(cli)) throw new Error('mermaid-cli is not installed; run "npm ci" in book/');
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  return { status: result.status ?? 1, output: `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? result.error.message : ''}` };
}

// Renders each diagram to <outDir>/mermaid-<id>.<format>. mmdc output can echo diagram
// source, so it is written to a private log file next to the image instead of the console.
export function renderDiagrams(diagrams, { outDir, format, run = spawnMmdc, configDir = path.join(BOOK_DIR, 'config') }) {
  fs.mkdirSync(outDir, { recursive: true });
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aixp-mermaid-'));
  try {
    return diagrams.map((diagram) => {
      const input = path.join(workDir, `${diagram.id}.mmd`);
      const output = path.join(outDir, `mermaid-${diagram.id}.${format}`);
      fs.writeFileSync(input, diagram.source + '\n');
      const result = run(mmdcArgs({
        input,
        output,
        format,
        configFile: path.join(configDir, 'mermaid.json'),
        puppeteerConfigFile: path.join(configDir, 'puppeteer.json'),
      }));
      if (result.status !== 0 || !fs.existsSync(output)) {
        const log = path.join(outDir, `mermaid-${diagram.id}.log`);
        fs.writeFileSync(log, result.output ?? '');
        throw new Error(`mermaid render failed for diagram ${diagram.id} (exit ${result.status}); details in ${log}`);
      }
      return output;
    });
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
