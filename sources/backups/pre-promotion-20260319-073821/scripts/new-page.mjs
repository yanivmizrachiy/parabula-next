import fs from 'node:fs';
import path from 'node:path';

const n = process.argv[2];
if (!n || !/^\d+$/.test(n)) {
  console.error('Usage: npm run page:new -- 2');
  process.exit(1);
}

const root = process.cwd();
const htmlPath = path.join(root, `עמוד-${n}.html`);
const cssPath = path.join(root, 'styles', 'pages', `עמוד-${n}.css`);

if (fs.existsSync(htmlPath) || fs.existsSync(cssPath)) {
  console.error(`Page ${n} already exists`);
  process.exit(1);
}

const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>עמוד ${n}</title>
  <link rel="stylesheet" href="styles/a4-base.css" />
  <link rel="stylesheet" href="styles/pages/עמוד-${n}.css" />
</head>
<body>
  <main class="a4-page page-${n}">
    <header class="page-header">
      <h1 class="page-title">כותרת עמוד ${n}</h1>
      <div class="page-number">${n}</div>
    </header>

    <section class="page-content">
      <p>תוכן ראשוני לעריכה.</p>
    </section>
  </main>
</body>
</html>
`;

const css = `.page-${n} .page-content {
  display: block;
}
`;

fs.writeFileSync(htmlPath, html, 'utf8');
fs.writeFileSync(cssPath, css, 'utf8');
console.log(`Created עמוד-${n}.html and styles/pages/עמוד-${n}.css`);