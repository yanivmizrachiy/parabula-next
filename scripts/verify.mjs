import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const GIT_STAGE_FIELD_COUNT = 4;

function fail(message) {
  console.error(`VERIFY FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function listTrackedGitlinks() {
  try {
    const output = execFileSync('git', ['ls-files', '--stage'], {
      cwd: root,
      encoding: 'utf8'
    });

    return output
      .split('\n')
      .filter(Boolean)
      .map(line => line.split(/\s+/, GIT_STAGE_FIELD_COUNT))
      .filter(([mode]) => mode === '160000')
      .map(([, , , file]) => file);
  } catch (error) {
    fail(`Unable to inspect repository gitlinks for stray submodule regressions: ${error.message}`);
    return [];
  }
}

const pageFiles = fs.readdirSync(root).filter(name => /^עמוד-\d+\.html$/.test(name));
if (pageFiles.length === 0) fail('No canonical root pages found');

if (fs.existsSync(path.join(root, '.gitmodules'))) {
  fail('Unexpected .gitmodules file found at repository root');
}

const gitlinks = listTrackedGitlinks();
if (gitlinks.length > 0) {
  fail(`Unexpected gitlinks found: ${gitlinks.join(', ')}`);
}

if (!fs.existsSync(path.join(root, 'styles', 'a4-base.css'))) {
  fail('Missing styles/a4-base.css');
}

if (!fs.existsSync(path.join(root, 'preview', 'index.html'))) {
  fail('Missing preview/index.html');
}

for (const file of pageFiles) {
  const full = path.join(root, file);
  const html = fs.readFileSync(full, 'utf8');
  const n = file.match(/^עמוד-(\d+)\.html$/)?.[1];

  if (!html.includes(`page-${n}`)) fail(`${file}: missing page-${n} class`);
  if (!html.includes('styles/a4-base.css')) fail(`${file}: missing styles/a4-base.css`);
  if (!html.includes(`styles/pages/עמוד-${n}.css`)) fail(`${file}: missing styles/pages/עמוד-${n}.css`);
  if (/\sstyle\s*=\s*["']/.test(html)) fail(`${file}: inline CSS is forbidden`);
}

ok('Canonical contracts passed');
