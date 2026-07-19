// מפתח מורה — נגזר מנתוני התשובות, לא נכתב ביד.
// כל ערך מספרי מחושב מחדש מהגאומטריה בזמן הבנייה, כך שהמפתח
// ותוצאות הבדיקות האוטומטיות אינם יכולים להיפרד זה מזה.

import { esc } from './render.mjs';
import { axisParallelLength } from './coordinate-svg.mjs';

/** מחשב את הערכים הנגזרים של רשומת תשובה. מחזיר null עבור kind='value'. */
export function derive(record) {
  if (record.kind === 'segment') {
    const [ax, ay] = record.a;
    const [bx, by] = record.b;
    return {
      length: axisParallelLength(record.a, record.b),
      axis: ay === by ? 'x' : 'y',
      equation: ay === by ? `y=${ay}` : `x=${ax}`,
      crossesY: ay === by && Math.sign(ax) * Math.sign(bx) < 0,
      crossesX: ax === bx && Math.sign(ay) * Math.sign(by) < 0
    };
  }
  if (record.kind === 'rectangle') {
    const [[x1, y1], [x2, y2]] = record.corners;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return { width, height, area: width * height, perimeter: 2 * (width + height) };
  }
  if (record.kind === 'line') {
    const [[ax, ay], [bx]] = record.through;
    return ax === bx
      ? { equation: `x=${ax}`, parallelTo: 'y', perpendicularTo: 'x' }
      : { equation: `y=${ay}`, parallelTo: 'x', perpendicularTo: 'y' };
  }
  return null;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(' , ');
  if (typeof value === 'boolean') return value ? 'נכון' : 'לא נכון';
  return String(value);
}

function renderRecord(record) {
  const derived = derive(record);
  const shown = derived ? { ...record.expect, ...derived } : record.expect;
  const rows = Object.entries(shown)
    .map(([key, value]) => `<tr><th>${esc(key)}</th><td dir="ltr">${esc(formatValue(value))}</td></tr>`)
    .join('');
  const source = record.kind === 'segment'
    ? `קטע ${JSON.stringify(record.a)}–${JSON.stringify(record.b)}`
    : record.kind === 'rectangle'
      ? `מלבן ${JSON.stringify(record.corners[0])}–${JSON.stringify(record.corners[1])}`
      : record.kind;
  return `<article class="tk-record"><h3>${esc(record.id)}</h3>`
    + `<p class="tk-source" dir="ltr">${esc(source)}</p>`
    + `<table class="tk-table"><tbody>${rows}</tbody></table></article>`;
}

export function buildTeacherKey({ meta, answers, glossary }) {
  const byPage = new Map();
  for (const record of answers) {
    if (!byPage.has(record.page)) byPage.set(record.page, []);
    byPage.get(record.page).push(record);
  }
  const sections = [...byPage.keys()].sort((a, b) => a - b).map(page =>
    `<section class="tk-page"><h2>עמוד ${page}</h2>${byPage.get(page).map(renderRecord).join('')}</section>`
  ).join('');

  const terms = glossary.map(term => `<li dir="auto">${esc(term)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>מפתח מורה — ${esc(meta.title)}</title>
<link rel="stylesheet" href="workbook.css">
<link rel="stylesheet" href="teacher-key.css">
</head>
<body class="tk-body">
<h1>מפתח מורה — ${esc(meta.title)}</h1>
<p class="tk-note">כל ערך מספרי במסמך זה מחושב מהשיעורים בזמן הבנייה ונבדק אוטומטית מול נתוני התשובות.</p>
<section class="tk-glossary"><h2>מילון המושגים המחייב</h2><ul>${terms}</ul></section>
${sections}
</body>
</html>
`;
}
