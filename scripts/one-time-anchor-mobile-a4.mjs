import fs from 'node:fs';

const file = 'mobile-app.js';
let text = fs.readFileSync(file, 'utf8');

const replacements = [
  [
`    body{
      display:flex !important;
      justify-content:center !important;
      align-items:flex-start !important;
    }`,
`    body{
      position:relative !important;
      display:block !important;
    }`
  ],
  [
`      transform:none;
      transform-origin:center top !important;
      page-break-after:auto !important;`,
`      position:absolute !important;
      top:0 !important;
      left:0 !important;
      transform:none;
      transform-origin:left top !important;
      page-break-after:auto !important;`
  ],
  [
`        transform:none !important;
        margin:0 !important;`,
`        position:static !important;
        top:auto !important;
        left:auto !important;
        transform:none !important;
        transform-origin:center top !important;
        margin:0 !important;`
  ],
  [
`  page.style.setProperty('flex-shrink', '0', 'important');
  page.style.setProperty('transform-origin', 'center top', 'important');`,
`  page.style.setProperty('flex-shrink', '0', 'important');
  page.style.setProperty('position', 'absolute', 'important');
  page.style.setProperty('top', '0', 'important');
  page.style.setProperty('left', '0', 'important');
  page.style.setProperty('transform-origin', 'left top', 'important');`
  ],
  [
`    const scaledHeight = Math.max(1, Math.round(rawHeight * scale));
    page.style.setProperty('transform', \`scale(\${scale})\`, 'important');`,
`    const scaledWidth = Math.max(1, Math.round(rawWidth * scale));
    const scaledHeight = Math.max(1, Math.round(rawHeight * scale));
    const left = Math.max(0, Math.round((hostWidth - scaledWidth) / 2));
    page.style.setProperty('left', \`\${left}px\`, 'important');
    page.style.setProperty('top', '0', 'important');
    page.style.setProperty('transform', \`scale(\${scale})\`, 'important');`
  ],
  [
`    doc.body.style.setProperty('background', '#eef3f8', 'important');
    doc.body.style.setProperty('display', 'flex', 'important');
    doc.body.style.setProperty('justify-content', 'center', 'important');
    doc.body.style.setProperty('align-items', 'flex-start', 'important');`,
`    doc.body.style.setProperty('background', '#eef3f8', 'important');
    doc.body.style.setProperty('position', 'relative', 'important');
    doc.body.style.setProperty('display', 'block', 'important');`
  ],
  [
`  enforceCanonicalPageGeometry(page);
  page.style.setProperty('transform', 'none', 'important');`,
`  enforceCanonicalPageGeometry(page);
  page.style.setProperty('position', 'static', 'important');
  page.style.setProperty('top', 'auto', 'important');
  page.style.setProperty('left', 'auto', 'important');
  page.style.setProperty('transform-origin', 'center top', 'important');
  page.style.setProperty('transform', 'none', 'important');`
  ]
];

for (const [from, to] of replacements) {
  const count = text.split(from).length - 1;
  if (count !== 1) {
    console.error(`Expected one match, found ${count}: ${from.slice(0, 80)}`);
    process.exit(1);
  }
  text = text.replace(from, to);
}

if (!text.includes("page.style.setProperty('left', `${left}px`, 'important')")) {
  console.error('Calculated left anchoring missing');
  process.exit(1);
}
if (!text.includes("page.style.setProperty('transform-origin', 'left top', 'important')")) {
  console.error('Left-top transform origin missing');
  process.exit(1);
}

fs.writeFileSync(file, text, 'utf8');
console.log('Anchored mobile A4 scaling deterministically');
