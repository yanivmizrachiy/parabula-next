import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function fail(message) {
  console.error(`VERIFY FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

const requiredFiles = [
  'PROJECT_RULES.md',
  'rules.md',
  'preview/index.html',
  'preview/server.mjs',
  'styles/a4-base.css',
  'עמוד-1.html',
  'styles/pages/עמוד-1.css'
];

for (const rel of requiredFiles) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) fail(`Missing required file: ${rel}`);
}

const html = fs.readFileSync(path.join(root, 'עמוד-1.html'), 'utf8');
if (!html.includes('class="a4-page page-1"')) fail('עמוד-1.html must contain exact main.a4-page.page-1');
if (/\sstyle\s*=\s*["']/.test(html)) fail('Inline CSS is forbidden');
if (!html.includes('styles/a4-base.css')) fail('עמוד-1.html must link styles/a4-base.css');
if (!html.includes('styles/pages/עמוד-1.css')) fail('עמוד-1.html must link styles/pages/עמוד-1.css');

ok('Base contracts passed');