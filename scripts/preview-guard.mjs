import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['preview/index.html', 'preview/app.html', 'preview/phone.html', 'preview/install.html', 'preview/print.html'];
const timestamp = new Date().toISOString();
const report = {
  timestamp,
  pages: [],
  summary: { missing_file: 0, missing_ux_css: 0, inline_style_found: 0 }
};

for (const rel of targets) {
  const abs = path.join(root, rel);
  const row = { file: rel, exists: fs.existsSync(abs), has_ux_css: false, has_inline_style: false };
  if (!row.exists) {
    report.summary.missing_file += 1;
  } else {
    const txt = fs.readFileSync(abs, 'utf8');
    row.has_ux_css = txt.includes('./ux-polish.css');
    row.has_inline_style = /<style[\s>]/i.test(txt) || /\sstyle\s*=\s*["']/.test(txt);
    if (!row.has_ux_css && rel !== 'preview/index.html') report.summary.missing_ux_css += 1;
    if (row.has_inline_style) report.summary.inline_style_found += 1;
  }
  report.pages.push(row);
}

const outDir = path.join(root, 'meta', 'audit');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'preview-guard.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));

if (report.summary.missing_file > 0 || report.summary.inline_style_found > 0) {
  process.exit(1);
}
