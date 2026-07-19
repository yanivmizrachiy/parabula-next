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

source = source.replace(
  "const repo = exec('git', ['rev-parse', '--show-toplevel'], { cwd: here }).trim();",
  "const repo = process.env.RECTANGLE_REPO; if (!repo) throw new Error('RECTANGLE_REPO is not set');"
);
source = source.replaceAll(
  "run('git', ['clean', '-fdx']);",
  "run('git', ['clean', '-fdx', '-e', 'projects/coordinate-first-quadrant-workbook/audit/build.log']);"
);
source = source.replace(
  "run('npm', ['ci']);\nrun('npx', ['playwright', 'install', 'chromium', '--with-deps']);\nconsole.log('Rectangle bootstrap: running maximum validation');\nrun('npm', ['run', 'tech:max']);",
  "run('npm', ['ci']);\nrun('npm', ['install', '--no-save', '--package-lock=false', 'node@22']);\nprocess.env.PATH = `${path.join(repo, 'node_modules', '.bin')}:${process.env.PATH}`;\nrun('node', ['--version']);\nrun('npx', ['playwright', 'install', 'chromium', '--with-deps']);\nconsole.log('Rectangle bootstrap: running maximum validation under Node 22');\nrun('npm', ['run', 'tech:max']);"
);

fs.writeFileSync(diagnosticPath, source, 'utf8');
process.env.RECTANGLE_REPO = repo;

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
