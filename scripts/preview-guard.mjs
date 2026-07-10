import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['mobile-app.html', 'preview/app.html', 'preview/topics.html', 'preview/print.html'];
const forbidden = ['preview/phone.html', 'preview/mobile.html', 'preview/mobile-app.html', 'preview/install.html'];
const report = {
  timestamp: new Date().toISOString(),
  pages: [],
  forbidden: [],
  summary: { missing_file: 0, inline_style_found: 0, obsolete_file_found: 0 }
};

for (const rel of targets) {
  const abs = path.join(root, rel);
  const row = { file: rel, exists: fs.existsSync(abs), has_inline_style: false };
  if (!row.exists) {
    report.summary.missing_file += 1;
  } else {
    const text = fs.readFileSync(abs, 'utf8');
    row.has_inline_style = /<style[\s>]/i.test(text) || /\sstyle\s*=\s*["']/.test(text);
    if (row.has_inline_style) report.summary.inline_style_found += 1;
  }
  report.pages.push(row);
}

for (const rel of forbidden) {
  const found = fs.existsSync(path.join(root, rel));
  report.forbidden.push({ file: rel, found });
  if (found) report.summary.obsolete_file_found += 1;
}

const outDir = path.join(root, 'meta', 'audit');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'preview-guard.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));

if (report.summary.missing_file || report.summary.inline_style_found || report.summary.obsolete_file_found) {
  process.exit(1);
}
