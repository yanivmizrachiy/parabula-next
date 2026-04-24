import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = [];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function line(s = '') {
  report.push(s);
}

function checkPair(title, canonical, legacy) {
  line(`## ${title}`);
  line(`canonical: ${canonical} => ${exists(canonical) ? 'YES' : 'NO'}`);
  line(`legacy_or_duplicate: ${legacy} => ${exists(legacy) ? 'YES' : 'NO'}`);
  line('');
}

line('# PREVIEW OVERLAP AUDIT');
line('');
line('This report distinguishes canonical runtime files from legacy/duplicate-adjacent layers.');
line('It is informational by default and does not fail the process unless a canonical file is missing.');
line('');

const requiredCanonical = [
  'preview/app.html',
  'preview/topics.html',
  'preview/all-pages.html',
  'preview/booklet.html',
  'preview/print.html',
  'preview/print.js',
  'preview/flow-shell.css',
  'preview/flow-shell.js',
  'meta/all-pages-index.json'
];

let fatal = false;
line('## Canonical runtime presence');
for (const file of requiredCanonical) {
  const ok = exists(file);
  line(`${file}: ${ok ? 'YES' : 'NO'}`);
  if (!ok) fatal = true;
}
line('');

checkPair('Print layer', 'preview/print.js', 'preview/print-center.js');
checkPair('Mobile layer', 'mobile-app.html', 'preview/phone.html');
checkPair('Mobile JS', 'mobile-app.js', 'preview/phone.js');
checkPair('Mobile styles', 'mobile-app.css', 'preview/mobile.css');
checkPair('Mobile manifest', 'mobile-app.webmanifest', 'preview/manifest.webmanifest');

line('## Hub route coverage');
if (exists('preview/app.html')) {
  const s = read('preview/app.html');
  for (const link of ['./topics.html', './all-pages.html', './booklet.html', './print.html', './index.html', './mobile-app.html']) {
    line(`${link}: ${s.includes(link) ? 'YES' : 'NO'}`);
  }
}
line('');

line('## Interpretation');
line('- YES on a legacy/duplicate file does not mean an error by itself.');
line('- It means the repository still contains a secondary path that must be treated carefully.');
line('- Only missing canonical files should be treated as a blocking issue.');
line('');

const outFile = path.join(root, 'STATE', 'PREVIEW_OVERLAP_AUDIT.md');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, report.join('\n') + '\n', 'utf8');

console.log(outFile);
console.log(fatal ? 'PREVIEW OVERLAP AUDIT: CANONICAL FILES MISSING' : 'PREVIEW OVERLAP AUDIT: OK');
if (fatal) process.exit(1);
