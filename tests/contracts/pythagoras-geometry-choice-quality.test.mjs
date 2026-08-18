import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

function section(html, className) {
  const start = html.indexOf(className);
  assert.ok(start >= 0, `חסר מקטע ${className}`);
  const from = html.lastIndexOf('<div', start);
  const stops = [html.indexOf('<div class="q-main', start), html.indexOf('quick-practice-grid', start), html.indexOf('classification-card', start)].filter((i) => i >= 0);
  const nextInstruction = stops.length ? Math.min(...stops) : -1;
  return html.slice(from, nextInstruction >= 0 ? nextInstruction : html.length);
}

function pathToPoints(d) {
  const tokens = d.match(/[MLHVZ]|-?\d+(?:\.\d+)?/gu) || [];
  const points = [];
  let i = 0;
  let x = 0;
  let y = 0;
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'L') {
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
      points.push([x, y]);
    } else if (cmd === 'H') {
      x = Number(tokens[i++]);
      points.push([x, y]);
    } else if (cmd === 'V') {
      y = Number(tokens[i++]);
      points.push([x, y]);
    } else if (cmd === 'Z') {
      break;
    }
  }
  return points.slice(0, 3);
}

function trianglePaths(html) {
  return [...html.matchAll(/<path class="edge" d="([^"]+Z)"/gu)].map((m) => pathToPoints(m[1]));
}

function angleAt(a, b, c) {
  const u = [a[0] - b[0], a[1] - b[1]];
  const v = [c[0] - b[0], c[1] - b[1]];
  const dot = u[0] * v[0] + u[1] * v[1];
  const nu = Math.hypot(...u);
  const nv = Math.hypot(...v);
  const cos = Math.max(-1, Math.min(1, dot / (nu * nv)));
  return Math.acos(cos) * 180 / Math.PI;
}

function triangleAngles(points) {
  assert.equal(points.length, 3, 'נתיב משולש חייב להכיל שלושה קודקודים');
  return [
    angleAt(points[1], points[0], points[2]),
    angleAt(points[0], points[1], points[2]),
    angleAt(points[0], points[2], points[1]),
  ];
}

function distanceFromRight(points) {
  return Math.min(...triangleAngles(points).map((a) => Math.abs(a - 90)));
}

test('עמודי הזיהוי אינם מגלים את התשובה באמצעות ריבוע או aria-label', () => {
  const p1 = section(read('עמוד-634.html'), 'angle-choice-grid');
  const p2 = section(read('עמוד-635.html'), 'triangle-choice-grid');

  for (const [name, block] of [['עמוד 1', p1], ['עמוד 2', p2]]) {
    assert.doesNotMatch(block, /class="mark"/u, `${name}: אסור לסמן מראש זווית ישרה במשימת זיהוי`);
    assert.doesNotMatch(block, /aria-label="[^"]*(?:ישרה|חדה|קהה)[^"]*"/u, `${name}: aria-label לא יחשוף את הסיווג`);
  }
});

test('משולשי הבחירה בעמוד 2 מדויקים ואינם כוללים מסיח כמעט-ישר', () => {
  const block = section(read('עמוד-635.html'), 'triangle-choice-grid');
  const triangles = trianglePaths(block);
  assert.equal(triangles.length, 6, 'עמוד 2: נדרשים שישה משולשים לבחירה');

  const rightIndices = new Set([0, 2, 4]);
  triangles.forEach((points, index) => {
    const delta = distanceFromRight(points);
    if (rightIndices.has(index)) {
      assert.ok(delta <= 0.05, `משולש ${index + 1}: הזווית הישרה אינה 90° מדויקת (סטייה ${delta.toFixed(3)}°)`);
    } else {
      assert.ok(delta >= 8, `משולש ${index + 1}: המסיח קרוב מדי ל-90° (מרחק ${delta.toFixed(2)}°)`);
    }
  });
});

test('עמוד 2: סימון הזווית הישרה חל על משולשי סעיף 1, ללא סט משולשים חדש (הוראת יניב)', () => {
  const html = read('עמוד-635.html');
  assert.match(html, /סמנו רק את המשולשים ישרי־הזווית, ובכל משולש/u, 'ההוראה מאחדת זיהוי + סימון ריבוע');
  assert.doesNotMatch(html, /mark-angle-grid/u, 'אין סט משולשים חדש לסימון — הסימון על אותם משולשים שזוהו');
  assert.doesNotMatch(html, /שמצאתם, הוסיפו ריבוע/u, 'אין סעיף נפרד שמצייר משולשים חדשים');
});

test('שתי משימות ההשלמה בעמוד 2 שונות זו מזו', () => {
  const html = read('עמוד-635.html');
  assert.match(html, /M55 92 H190 M55 92 V30/u, 'משימה א: שני ניצבים שנפגשים בזווית הישרה');
  assert.match(html, /M48 92 L190 26 M190 26 V92/u, 'משימה ב: יתר וניצב נתונים, הניצב השני חסר');
  assert.match(html, /נפגשות בזווית הישרה/u);
  assert.match(html, /היא נמצאת מול ה/u);
  // הכיתובים הם משפטי השלמה עם מילת מפתח חסרה (הוראת יניב, 2026-08-18)
  assert.equal((html.match(/guide-caption">[^<]*<span class="foundation-fill/gu)||[]).length,2,'שני כיתובי השלמה עם תיבת מענה');
});

test('קווי הגאומטריה בפיתגורס דקים ומתאימים להדפסה', () => {
  const shared = read('styles/topics/pythagoras-foundations.css');
  assert.match(shared, /\.foundation-svg \.edge \{[^}]*stroke-width: 1\.6;/u);
  assert.match(shared, /\.foundation-svg \.mark \{[^}]*stroke-width: 1\.15;/u);
  assert.match(shared, /\.foundation-svg \.pt, \.pyt-foundation \.foundation-svg \.lbl \{[^}]*Georgia/u, 'תוויות מידה בכתב מתמטי סריפי');
  for (const file of ['styles/pages/עמוד-634.css', 'styles/pages/עמוד-635.css']) {
    const css = read(file);
    const widths = [...css.matchAll(/stroke-width:\s*([\d.]+)/gu)].map((m) => Number(m[1]));
    assert.ok(widths.every((w) => w <= 1.7), `${file}: נמצא קו עבה מדי (${Math.max(0, ...widths)}px)`);
  }
});
