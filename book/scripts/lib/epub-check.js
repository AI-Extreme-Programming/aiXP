import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const EPUBCHECK_VERSION = '5.4.0';

const FAILING = new Set(['FATAL', 'ERROR', 'WARNING']);

// EPUBCHECK_JAR selects a jar run with JAVA_HOME's java (or java on PATH); otherwise the
// epubcheck launcher on PATH, which install-epub-tools.sh provides on Ubuntu.
export function epubcheckCommand(env = process.env) {
  if (env.EPUBCHECK_JAR) {
    const java = env.JAVA_HOME ? path.join(env.JAVA_HOME, 'bin', 'java') : 'java';
    return { command: java, prefix: ['-jar', env.EPUBCHECK_JAR] };
  }
  return { command: 'epubcheck', prefix: [] };
}

export function spawnTool(command, args, { cwd, env } = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', cwd, env: { ...process.env, ...env }, maxBuffer: 64 * 1024 * 1024 });
  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? result.error.message : ''}`,
  };
}

export function parseEpubcheckVersion(output) {
  return /EPUBCheck v(\d+\.\d+\.\d+)/.exec(output)?.[1] ?? null;
}

export function summarizeReport(report) {
  const messages = (report.messages ?? []).map((m) => ({
    id: m.ID,
    severity: m.severity,
    message: m.message,
    locations: (m.locations ?? []).map((l) => `${l.path}${l.line > 0 ? `:${l.line}` : ''}${l.column > 0 ? `:${l.column}` : ''}`),
  }));
  const count = (severity) => messages.filter((m) => m.severity === severity).length;
  return {
    fatal: count('FATAL'),
    errors: count('ERROR'),
    warnings: count('WARNING'),
    failing: messages.filter((m) => FAILING.has(m.severity)),
  };
}

export function formatFinding(finding) {
  const where = finding.locations.length ? ` [${finding.locations.join(', ')}]` : '';
  return `${finding.severity} ${finding.id}: ${finding.message}${where}`;
}

// Runs the pinned epubcheck and passes only when it reports no fatal errors, errors or warnings.
export function checkEpub(file, { env = process.env, run = spawnTool, expectedVersion = EPUBCHECK_VERSION } = {}) {
  const { command, prefix } = epubcheckCommand(env);
  const versionResult = run(command, [...prefix, '--version']);
  const version = parseEpubcheckVersion(versionResult.output);
  if (!version) throw new Error(`could not run epubcheck (${command}); run book/scripts/ci/install-epub-tools.sh or set EPUBCHECK_JAR`);
  if (version !== expectedVersion) throw new Error(`epubcheck ${version} found, but the build is pinned to ${expectedVersion}`);

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aixp-epubcheck-'));
  try {
    const reportFile = path.join(workDir, 'report.json');
    const result = run(command, [...prefix, file, '--json', reportFile, '--failonwarnings', '--quiet']);
    if (!fs.existsSync(reportFile)) throw new Error(`epubcheck produced no report (exit ${result.status})`);
    const summary = summarizeReport(JSON.parse(fs.readFileSync(reportFile, 'utf8')));
    const ok = result.status === 0 && summary.failing.length === 0;
    return { ...summary, version, ok, status: result.status };
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
