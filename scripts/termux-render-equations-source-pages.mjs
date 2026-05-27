import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const pdfRel = path.join('sources', 'legacy', 'parabula-old', 'sources', 'משוואות.pdf');
const pdfPath = path.join(root, pdfRel);
const pageFrom = Number(process.env.EQUATIONS_RENDER_FROM || 1);
const pageTo = Number(process.env.EQUATIONS_RENDER_TO || 8);
const dpi = Number(process.env.EQUATIONS_RENDER_DPI || 130);
const outDir = path.join(root, '.tmp', 'equations-source', 'rendered');
const downloadsDir = '/sdcard/Download/parabula-equations-proof';

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return result;
}

function listPngs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.png'))
    .sort()
    .map((name) => path.join(dir, name));
}

function relForHtml(file) {
  return path.basename(file);
}

console.log('TERMUX_EQUATIONS_SOURCE_RENDER_START');
console.log(`pdf=${pdfRel}`);
console.log(`pages=${pageFrom}-${pageTo}`);
console.log(`dpi=${dpi}`);
console.log('mode=render_only');
console.log('worksheet_files_modified=NO');

if (!fs.existsSync(pdfPath)) {
  console.error('TERMUX_EQUATIONS_SOURCE_RENDER_FAILED');
  console.error('reason=missing_source_pdf');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const file of listPngs(outDir)) {
  fs.rmSync(file, { force: true });
}

const pdftoppm = run('pdftoppm', [
  '-png',
  '-r', String(dpi),
  '-f', String(pageFrom),
  '-l', String(pageTo),
  pdfPath,
  path.join(outDir, 'pdf-page')
]);

if (pdftoppm.status !== 0) {
  console.error('TERMUX_EQUATIONS_SOURCE_RENDER_FAILED');
  console.error('reason=pdftoppm_failed_or_missing');
  if (pdftoppm.stderr) console.error(pdftoppm.stderr.trim());
  console.error('hint=install poppler in Termux: pkg install poppler -y');
  process.exit(1);
}

const pngs = listPngs(outDir);
const htmlPath = path.join(outDir, 'index.html');
const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Equations PDF Source Render</title>
  <style>
    body { margin: 0; padding: 16px; font-family: sans-serif; background: #f6f7fb; color: #111827; }
    h1 { margin: 0 0 12px; font-size: 22px; }
    .note { margin: 0 0 16px; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .card { background: white; border: 1px solid #d8dee9; border-radius: 14px; padding: 10px; box-shadow: 0 8px 20px rgba(15,23,42,0.08); }
    .card h2 { margin: 0 0 8px; font-size: 16px; }
    img { width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <h1>רינדור מקור PDF — משוואות</h1>
  <p class="note">מטרה: למצוא חזותית את העמוד שבו מופיעות 12 המשוואות של דף 1. אין כאן שינוי בקבצי העבודה.</p>
  <div class="grid">
    ${pngs.map((file, index) => `<section class="card"><h2>PDF page ${pageFrom + index}</h2><img src="${relForHtml(file)}" /></section>`).join('\n    ')}
  </div>
</body>
</html>
`;
fs.writeFileSync(htmlPath, html, 'utf8');

let copiedToDownloads = false;
try {
  if (fs.existsSync('/sdcard/Download')) {
    fs.mkdirSync(downloadsDir, { recursive: true });
    for (const file of pngs) {
      fs.copyFileSync(file, path.join(downloadsDir, path.basename(file)));
    }
    fs.copyFileSync(htmlPath, path.join(downloadsDir, 'index.html'));
    copiedToDownloads = true;
  }
} catch (error) {
  console.log(`downloads_copy_warning=${error.message}`);
}

console.log(`rendered_images=${pngs.length}`);
console.log(`output_dir=${outDir}`);
console.log(`index_html=${htmlPath}`);
console.log(`copied_to_downloads=${copiedToDownloads ? 'YES' : 'NO'}`);
if (copiedToDownloads) {
  console.log(`downloads_dir=${downloadsDir}`);
  console.log('open=Android Downloads / parabula-equations-proof / index.html');
}
console.log('TERMUX_EQUATIONS_SOURCE_RENDER_OK');
