import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = {
  timestamp: new Date().toISOString(),
  html_pages_checked: 0,
  css_files_checked: 0,
  issues: []
};

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function addIssue(kind, file, details) {
  report.issues.push({ kind, file, details });
}

for (const name of fs.readdirSync(root)) {
  if (!/^עמוד-\d+\.html$/.test(name)) continue;
  report.html_pages_checked += 1;
  const html = read(name);
  const num = name.match(/^עמוד-(\d+)\.html$/)[1];
  const cssRel = `styles/pages/עמוד-${num}.css`;
  if (!exists(cssRel)) addIssue('missing_css', name, cssRel);
  if (html.includes('<style')) addIssue('inline_style_in_html', name, 'Inline style block found');
  if (html.includes('style=')) addIssue('inline_style_attr', name, 'Inline style attribute found');
}

const cssDir = path.join(root, 'styles', 'pages');
if (fs.existsSync(cssDir)) {
  for (const name of fs.readdirSync(cssDir)) {
    if (!/^עמוד-\d+\.css$/.test(name)) continue;
    report.css_files_checked += 1;
    const txt = fs.readFileSync(path.join(cssDir, name), 'utf8');
    if (txt.includes('<style')) addIssue('style_tag_in_css', `styles/pages/${name}`, 'Unexpected style tag in css file');
  }
}

const outDir = path.join(root, 'meta', 'audit');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'worksheet-intake-guard.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
