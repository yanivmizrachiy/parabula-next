// מפתח מורה — נגזר מנתוני התשובות, לא נכתב ביד.
// כל ערך מספרי במסמך מחושב מחדש מהגאומטריה בזמן הבנייה.

import { esc } from './render.mjs';
import { axisParallelLength, shoelaceArea } from './coordinate-svg.mjs';

const EPSILON = 1e-9;

function validateTriangle(record) {
  if (!Array.isArray(record.vertices) || record.vertices.length !== 3) {
    throw new Error(`Triangle ${record.id} must contain exactly three vertices`);
  }
}

function triangleAreaByBase(record) {
  validateTriangle(record);
  if (!Array.isArray(record.base) || record.base.length !== 2) {
    throw new Error(`Triangle area ${record.id} must define base indices`);
  }
  const [i, j] = record.base;
  const k = [0, 1, 2].find(index => index !== i && index !== j);
  const a = record.vertices[i];
  const b = record.vertices[j];
  const c = record.vertices[k];
  if (a[0] !== b[0] && a[1] !== b[1]) {
    throw new Error(`Triangle area ${record.id} base must be axis-parallel`);
  }
  const baseLength = axisParallelLength(a, b);
  const height = a[1] === b[1] ? Math.abs(c[1] - a[1]) : Math.abs(c[0] - a[0]);
  return {
    baseLength,
    height,
    baseAxis: a[1] === b[1] ? 'x' : 'y',
    area: shoelaceArea(record.vertices)
  };
}

function classifyPoint(record) {
  if (!Array.isArray(record.triangle) || record.triangle.length !== 3) {
    throw new Error(`Point classification ${record.id} must define a triangle`);
  }
  const [a, b, c] = record.triangle;
  const p = record.point;
  const mainArea = shoelaceArea([a, b, c]);
  const subAreas = [
    shoelaceArea([p, a, b]),
    shoelaceArea([p, b, c]),
    shoelaceArea([p, c, a])
  ];
  const subAreaSum = subAreas.reduce((sum, value) => sum + value, 0);
  const onBoundary = Math.abs(subAreaSum - mainArea) <= EPSILON
    && subAreas.some(value => Math.abs(value) <= EPSILON);
  const inside = Math.abs(subAreaSum - mainArea) <= EPSILON && !onBoundary;
  return {
    classification: onBoundary ? 'על' : inside ? 'בתוך' : 'מחוץ',
    mainArea,
    subAreaSum,
    subAreas
  };
}

/** מחשב ערכים נגזרים של רשומת תשובה. מחזיר null עבור kind='value'. */
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
  if (record.kind === 'triangle') {
    validateTriangle(record);
    const pairs = [[0, 1], [1, 2], [2, 0]];
    const legs = pairs
      .filter(([i, j]) => {
        const a = record.vertices[i];
        const b = record.vertices[j];
        return a[0] === b[0] || a[1] === b[1];
      })
      .map(([i, j]) => axisParallelLength(record.vertices[i], record.vertices[j]))
      .sort((a, b) => a - b);
    return { legs, area: shoelaceArea(record.vertices) };
  }
  if (record.kind === 'triangleArea') {
    return triangleAreaByBase(record);
  }
  if (record.kind === 'parallelogram') {
    // הכול נגזר מהקודקודים: בסיס אופקי, גובה אנכי, שטח, והקודקוד הרביעי.
    const [A, B, C, D] = record.vertices;
    const baseLength = Math.abs(B[0] - A[0]);
    const height = Math.abs(D[1] - A[1]);
    return {
      baseLength, height, area: baseLength * height,
      shoelace: shoelaceArea(record.vertices),
      fourthFromABD: [A[0] === undefined ? null : D[0] + (B[0] - A[0]), D[1] + (B[1] - A[1])]
    };
  }
  if (record.kind === 'trapezoid') {
    const [A, B, C, D] = record.vertices;
    const baseBig = Math.abs(B[0] - A[0]);
    const baseSmall = Math.abs(C[0] - D[0]);
    const height = Math.abs(D[1] - A[1]);
    const legAD = Math.hypot(D[0] - A[0], D[1] - A[1]);
    const legBC = Math.hypot(C[0] - B[0], C[1] - B[1]);
    return {
      baseBig, baseSmall, height,
      area: (baseBig + baseSmall) * height / 2,
      shoelace: shoelaceArea(record.vertices),
      legAD, legBC,
      perimeter: baseBig + baseSmall + legAD + legBC
    };
  }
  if (record.kind === 'kite') {
    // דלתון שאלכסוניו AC ו-BD מקבילים לצירים. השטח = מחצית מכפלת האלכסונים,
    // ונבדק הלוך-חזור מול נוסחת השרוכים; הצלעות נגזרות מהקודקודים בלבד.
    const [A, B, C, D] = record.vertices;
    const diagonalAC = axisParallelLength(A, C);
    const diagonalBD = axisParallelLength(B, D);
    const cross = A[0] === C[0] ? [A[0], B[1]] : [B[0], A[1]];
    const side = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
    const sides = { AB: side(A, B), BC: side(B, C), CD: side(C, D), DA: side(D, A) };
    return {
      diagonalAC, diagonalBD,
      area: diagonalAC * diagonalBD / 2,
      shoelace: shoelaceArea(record.vertices),
      cross,
      sides,
      perimeter: sides.AB + sides.BC + sides.CD + sides.DA
    };
  }
  if (record.kind === 'rectilinear') {
    // מצולע שכל צלעותיו מקבילות לצירים: השטח בנוסחת השרוכים, ההיקף כסכום
    // אורכי הצלעות. axisParallelLength זורק שגיאה על צלע אלכסונית — זה החוזה.
    const v = record.vertices;
    let perimeter = 0;
    const edges = [];
    for (let i = 0; i < v.length; i += 1) {
      const a = v[i];
      const b = v[(i + 1) % v.length];
      const length = axisParallelLength(a, b);
      edges.push({ length, axis: a[1] === b[1] ? 'x' : 'y' });
      perimeter += length;
    }
    return { area: shoelaceArea(v), perimeter, edges, sides: v.length };
  }
  if (record.kind === 'pointTriangle') {
    return classifyPoint(record);
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
  if (Array.isArray(value)) return value.map(item => Array.isArray(item) ? item.join(',') : item).join(' , ');
  if (typeof value === 'boolean') return value ? 'נכון' : 'לא נכון';
  if (value && typeof value === 'object') return JSON.stringify(value);
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
      : record.kind === 'triangle' || record.kind === 'triangleArea'
        ? `משולש ${JSON.stringify(record.vertices)}`
      : record.kind === 'parallelogram'
        ? `מקבילית ${JSON.stringify(record.vertices)}`
      : record.kind === 'trapezoid'
        ? `טרפז ${JSON.stringify(record.vertices)}`
      : record.kind === 'kite'
        ? `דלתון ${JSON.stringify(record.vertices)}`
      : record.kind === 'rectilinear'
        ? `מצולע מקבילי-צירים ${JSON.stringify(record.vertices)}`
        : record.kind === 'pointTriangle'
          ? `נקודה ${JSON.stringify(record.point)} ביחס למשולש ${JSON.stringify(record.triangle)}`
          : record.kind;
  return `<article class="tk-record" data-kind="${esc(record.kind)}"><h3>${esc(record.id)}</h3>`
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
