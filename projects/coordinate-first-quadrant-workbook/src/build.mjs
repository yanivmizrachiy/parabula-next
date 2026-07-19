import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const sourcePath = 'projects/coordinate-first-quadrant-workbook/src/build.mjs';
const previousBootstrap = '97bf6e6d46c93e47e554409d9a5bcbc85dcbd78b';
const diagnosticPath = '/tmp/rectangle-bootstrap-diagnostic.mjs';

let source = execFileSync('git', ['show', `${previousBootstrap}:${sourcePath}`], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});

source = source.replaceAll(
  "run('git', ['clean', '-fdx']);",
  "run('git', ['clean', '-fdx', '-e', 'projects/coordinate-first-quadrant-workbook/audit/build.log']);"
);

fs.writeFileSync(diagnosticPath, source, 'utf8');

try {
  await import(`${pathToFileURL(diagnosticPath).href}?run=${Date.now()}`);
} catch (error) {
  const details = error?.stack || String(error);
  console.error('\nRECTANGLE_BOOTSTRAP_FAILED\n' + details);
  const logPath = path.join(repo, 'projects/coordinate-first-quadrant-workbook/audit/bootstrap-error.txt');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, details + '\n', 'utf8');
  throw error;
}
