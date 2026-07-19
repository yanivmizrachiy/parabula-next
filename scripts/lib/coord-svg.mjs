// scripts/lib/coord-svg.mjs — בניית מערכת צירים וקטורית מדויקת לנושא "פונקציה קווית".
//
// למה קיים: CLAUDE.md §4.3 דורש שכל גודל גאומטרי יהיה **מחושב ולא מנוחש**, ושכל
// טקסט LTR ב-SVG יקבל direction="ltr" (אחרת ה-bidi בהקשר RTL הופך `-5` ל-`5-`).
// כל הפונקציות כאן ממירות קואורדינטות מתמטיות לפיקסלים בנוסחה אחת (toPx), כך
// שבדיקת הלוך-חזור (toMath(toPx(v)) === v) עוברת בדיוק מוחלט.
//
// הקובץ הוא renderer בלבד: הוא מסרטט נתונים שנמסרו לו. הוא **אינו** מחולל שאלות,
// נתונים או ערכים — אלה מגיעים תמיד ממקור שתומלל (§1).

const COL = {
  axis: '#1f2a44',
  grid: '#dbe3ec',
  gridStrong: '#c3cede',
  line: '#1d4ed8',
  line2: '#b91c1c',
  line3: '#047857',
  point: '#1d4ed8',
  label: '#1f2a44',
  paper: '#ffffff',
};

/**
 * מעגל ההמרה היחיד: קואורדינטה מתמטית -> פיקסל.
 * xUnit/yUnit נפרדים נחוצים כשטווחי הצירים שונים מאוד (למשל זמן 0..15 מול מרחק 0..600).
 * padL גדול יותר מ-pad כדי לפנות מקום לתוויות ציר y ארוכות.
 */
export function makeScale({ xMin, xMax, yMin, yMax, unit = 15, xUnit, yUnit, pad = 16, padL, padR, padT, padB }) {
  const ux = xUnit ?? unit;
  const uy = yUnit ?? unit;
  const L = padL ?? pad, R = padR ?? pad, T = padT ?? pad, B = padB ?? pad;
  const w = (xMax - xMin) * ux + L + R;
  const h = (yMax - yMin) * uy + T + B;
  const px = (x) => L + (x - xMin) * ux;
  const py = (y) => T + (yMax - y) * uy;
  // הלוך-חזור: ההופכי המדויק של px/py
  const mx = (p) => (p - L) / ux + xMin;
  const my = (p) => yMax - (p - T) / uy;
  return { w, h, px, py, mx, my, unit: ux, xUnit: ux, yUnit: uy, pad, padL: L, padR: R, padT: T, padB: B, xMin, xMax, yMin, yMax };
}

const r2 = (n) => Math.round(n * 100) / 100;

/** האם המחרוזת היא תווית שדורשת direction="ltr" (ספרה ואין אות עברית) — §4.3. */
export function needsLtr(s) {
  const t = String(s);
  return /[0-9]/.test(t) && !/[֐-׿]/.test(t);
}

function textEl(x, y, str, { anchor = 'middle', size = 10.5, color = COL.label, weight = 500, halo = true } = {}) {
  const dir = needsLtr(str) ? ' direction="ltr"' : '';
  const stroke = halo ? ` paint-order="stroke" stroke="${COL.paper}" stroke-width="2.6" stroke-linejoin="round"` : '';
  return `<text x="${r2(x)}" y="${r2(y)}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}"${stroke}${dir}>${escText(str)}</text>`;
}

/**
 * הברחת טקסט לתוכן אלמנט. תווית שמכילה `<` או `&` שוברת את פרסור ה-SVG
 * בדיוק כמו מרכאה בתוך תכונה. אמפרסנד שכבר מהווה ישות נשמר כפי שהוא.
 */
export function escText(value) {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * חיתוך הישר y = m·x + b לגבולות התיבה (Liang–Barsky על קטע ארוך).
 * מחזיר שתי נקודות מתמטיות מדויקות על שפת התיבה, או null אם הישר אינו חוצה.
 */
export function clipLine({ m, b, xMin, xMax, yMin, yMax }) {
  const pts = [];
  const push = (x, y) => {
    if (x >= xMin - 1e-9 && x <= xMax + 1e-9 && y >= yMin - 1e-9 && y <= yMax + 1e-9) {
      if (!pts.some((p) => Math.abs(p[0] - x) < 1e-9 && Math.abs(p[1] - y) < 1e-9)) pts.push([x, y]);
    }
  };
  push(xMin, m * xMin + b);
  push(xMax, m * xMax + b);
  if (m !== 0) {
    push((yMin - b) / m, yMin);
    push((yMax - b) / m, yMax);
  }
  if (pts.length < 2) return null;
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  return [pts[0], pts[pts.length - 1]];
}

/** חיתוך ישר אנכי x = k. */
export function clipVertical(k, { xMin, xMax, yMin, yMax }) {
  if (k < xMin || k > xMax) return null;
  return [[k, yMin], [k, yMax]];
}

/**
 * בונה SVG של מערכת צירים.
 * כל הערכים המספריים מחושבים מ-makeScale; שום מיקום אינו "בערך".
 */
export function axesSvg(opts) {
  const {
    xMin = -6, xMax = 6, yMin = -6, yMax = 6,
    unit = 15, xUnit, yUnit, pad = 16, padL, padR, padT, padB,
    gridStep = 1, xGridStep, yGridStep, showGrid = true,
    tickStep = 1, xTickStep, yTickStep, showTicks = true, tickEvery = 1,
    xLabel = 'x', yLabel = 'y', longLabels = false,
    lines = [], points = [], segments = [], polylines = [],
    width = null, ariaLabel = 'מערכת צירים', id = 'g',
    showZero = false,
  } = opts;

  // תוויות ציר ארוכות (למשל "מרחק מאילת בק\"מ") אינן נכנסות לצד הציר —
  // הן מוצבות מעל ציר y ומתחת לציר x, ודורשות שוליים גדולים יותר.
  const S = makeScale({
    xMin, xMax, yMin, yMax, unit, xUnit, yUnit, pad,
    padL, padR: padR ?? (longLabels ? 20 : pad),
    padT: padT ?? (longLabels ? 30 : pad),
    padB: padB ?? (longLabels ? 34 : pad),
  });
  const gsX = xGridStep ?? gridStep;
  const gsY = yGridStep ?? gridStep;
  const tsX = xTickStep ?? tickStep;
  const tsY = yTickStep ?? tickStep;
  const out = [];

  // --- רשת ---
  // הגנה: צעד רשת קטן מדי מול טווח גדול (למשל 0..9000 בצעד 1) היה מייצר אלפי
  // אלמנטים ו-SVG בגובה עשרות אלפי פיקסלים. במקרה כזה מוותרים על הרשת.
  const gridCount = (xMax - xMin) / gsX + (yMax - yMin) / gsY;
  if (showGrid && gridCount <= 120) {
    const grid = [];
    for (let x = Math.ceil(xMin / gsX) * gsX; x <= xMax + 1e-9; x += gsX) {
      if (Math.abs(x) < 1e-9) continue;
      grid.push(`<line x1="${r2(S.px(x))}" y1="${r2(S.py(yMin))}" x2="${r2(S.px(x))}" y2="${r2(S.py(yMax))}" stroke="${COL.grid}" stroke-width="1"/>`);
    }
    for (let y = Math.ceil(yMin / gsY) * gsY; y <= yMax + 1e-9; y += gsY) {
      if (Math.abs(y) < 1e-9) continue;
      grid.push(`<line x1="${r2(S.px(xMin))}" y1="${r2(S.py(y))}" x2="${r2(S.px(xMax))}" y2="${r2(S.py(y))}" stroke="${COL.grid}" stroke-width="1"/>`);
    }
    out.push(`<g class="grid">${grid.join('')}</g>`);
  }

  // --- צירים עם ראשי חץ ---
  const mk = `ar-${id}`;
  out.push(`<defs><marker id="${mk}" viewBox="0 0 10 10" markerWidth="8" markerHeight="8" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="${COL.axis}"/></marker></defs>`);
  out.push(`<line class="axis" x1="${r2(S.px(xMin))}" y1="${r2(S.py(0))}" x2="${r2(S.px(xMax) + 8)}" y2="${r2(S.py(0))}" stroke="${COL.axis}" stroke-width="1.6" marker-end="url(#${mk})"/>`);
  out.push(`<line class="axis" x1="${r2(S.px(0))}" y1="${r2(S.py(yMin))}" x2="${r2(S.px(0))}" y2="${r2(S.py(yMax) - 8)}" stroke="${COL.axis}" stroke-width="1.6" marker-end="url(#${mk})"/>`);
  if (longLabels) {
    // תווית עברית ב-SVG מתפרסת שמאלה מנקודת העיגון (סדר RTL), ולכן עיגון בקצה
    // הציר נחתך בגבול ה-viewBox. עיגון במרכז הרוחב בטוח לכל אורך תווית סביר.
    out.push(textEl(S.w / 2, S.padT - 12, yLabel, { anchor: 'middle', size: 10.5, weight: 600 }));
    out.push(textEl(S.w / 2, S.h - 6, xLabel, { anchor: 'middle', size: 10.5, weight: 600 }));
  } else {
    out.push(textEl(S.px(xMax) + 12, S.py(0) + 4, xLabel, { anchor: 'start', size: 11, weight: 600 }));
    out.push(textEl(S.px(0) - 5, S.py(yMax) - 11, yLabel, { anchor: 'end', size: 11, weight: 600 }));
  }

  // --- תוויות סימון על הצירים (כל תווית מספרית מקבלת direction="ltr") ---
  // אותה הגנה כמו ברשת: צעד סימון קטן מדי מול טווח גדול היה מייצר אלפי שנתות.
  const tickCount = (xMax - xMin) / tsX + (yMax - yMin) / tsY;
  if (showTicks && tickCount <= 120) {
    for (let x = Math.ceil(xMin / tsX) * tsX; x <= xMax + 1e-9; x += tsX) {
      if (Math.abs(x) < 1e-9) { if (showZero) out.push(textEl(S.px(0) - 4, S.py(0) + 11, '0', { anchor: 'end', size: 9 })); continue; }
      if (Math.round(x / tsX) % tickEvery !== 0) continue;
      out.push(`<line class="tick" x1="${r2(S.px(x))}" y1="${r2(S.py(0) - 3)}" x2="${r2(S.px(x))}" y2="${r2(S.py(0) + 3)}" stroke="${COL.axis}" stroke-width="1.2"/>`);
      out.push(textEl(S.px(x), S.py(0) + 12, fmt(x), { size: 9, weight: 400 }));
    }
    for (let y = Math.ceil(yMin / tsY) * tsY; y <= yMax + 1e-9; y += tsY) {
      if (Math.abs(y) < 1e-9) continue;
      if (Math.round(y / tsY) % tickEvery !== 0) continue;
      out.push(`<line class="tick" x1="${r2(S.px(0) - 3)}" y1="${r2(S.py(y))}" x2="${r2(S.px(0) + 3)}" y2="${r2(S.py(y))}" stroke="${COL.axis}" stroke-width="1.2"/>`);
      out.push(textEl(S.px(0) - 5, S.py(y) + 3.2, fmt(y), { anchor: 'end', size: 9, weight: 400 }));
    }
  }

  // --- ישרים ---
  const drawn = []; // קטעים בפיקסלים, לצורך מיקום תוויות ללא התנגשות
  const palette = [COL.line, COL.line2, COL.line3];
  lines.forEach((L, i) => {
    const color = L.color || palette[i % palette.length];
    let seg;
    if (L.vertical !== undefined) seg = clipVertical(L.vertical, { xMin, xMax, yMin, yMax });
    else if (L.through) {
      const [[x1, y1], [x2, y2]] = L.through;
      if (Math.abs(x2 - x1) < 1e-12) seg = clipVertical(x1, { xMin, xMax, yMin, yMax });
      else {
        const m = (y2 - y1) / (x2 - x1);
        seg = clipLine({ m, b: y1 - m * x1, xMin, xMax, yMin, yMax });
      }
    } else seg = clipLine({ m: L.m, b: L.b, xMin, xMax, yMin, yMax });
    if (!seg) return;
    const dash = L.dashed ? ' stroke-dasharray="5 4"' : '';
    drawn.push([S.px(seg[0][0]), S.py(seg[0][1]), S.px(seg[1][0]), S.py(seg[1][1])]);
    out.push(`<line x1="${r2(S.px(seg[0][0]))}" y1="${r2(S.py(seg[0][1]))}" x2="${r2(S.px(seg[1][0]))}" y2="${r2(S.py(seg[1][1]))}" stroke="${color}" stroke-width="${L.width || 2}"${dash} stroke-linecap="round"/>`);
    if (L.label) {
      const t = L.labelAt ?? 0.82;
      const lx = seg[0][0] + (seg[1][0] - seg[0][0]) * t;
      const ly = seg[0][1] + (seg[1][1] - seg[0][1]) * t;
      out.push(textEl(S.px(lx) + (L.labelDx ?? 12), S.py(ly) + (L.labelDy ?? -6), L.label, { size: 11, weight: 700, color }));
    }
  });

  // --- קטעים ---
  segments.forEach((s) => {
    const dash = s.dashed ? ' stroke-dasharray="4 3"' : '';
    drawn.push([S.px(s.from[0]), S.py(s.from[1]), S.px(s.to[0]), S.py(s.to[1])]);
    out.push(`<line x1="${r2(S.px(s.from[0]))}" y1="${r2(S.py(s.from[1]))}" x2="${r2(S.px(s.to[0]))}" y2="${r2(S.py(s.to[1]))}" stroke="${s.color || COL.axis}" stroke-width="${s.width || 1.5}"${dash} stroke-linecap="round"/>`);
  });

  // --- קווים שבורים (גרפים מקטעיים בשאלות מילוליות) ---
  polylines.forEach((p) => {
    for (let i = 0; i + 1 < p.points.length; i++) {
      drawn.push([S.px(p.points[i][0]), S.py(p.points[i][1]), S.px(p.points[i + 1][0]), S.py(p.points[i + 1][1])]);
    }
    const pts = p.points.map(([x, y]) => `${r2(S.px(x))},${r2(S.py(y))}`).join(' ');
    out.push(`<polyline points="${pts}" fill="none" stroke="${p.color || COL.line}" stroke-width="${p.width || 2}" stroke-linejoin="round" stroke-linecap="round"/>`);
  });

  // --- נקודות ---
  // מיקום תווית אוטומטי: תווית בהיסט קבוע נוחתת על הישר ומסתירה אותו. כאן נבחן
  // כל היסט אפשרי ונבחר זה שמרוחק ביותר מכל הקווים המסורטטים ואינו יוצא מהמסגרת.
  const CANDS = [
    { dx: 7, dy: -6, anchor: 'start' }, { dx: -7, dy: -6, anchor: 'end' },
    { dx: 7, dy: 14, anchor: 'start' }, { dx: -7, dy: 14, anchor: 'end' },
    { dx: 0, dy: -11, anchor: 'middle' }, { dx: 0, dy: 19, anchor: 'middle' },
  ];
  const distToSeg = (X, Y, [ax, ay, bx, by]) => {
    const vx = bx - ax, vy = by - ay;
    const L = vx * vx + vy * vy;
    const t = L === 0 ? 0 : Math.max(0, Math.min(1, ((X - ax) * vx + (Y - ay) * vy) / L));
    return Math.hypot(X - (ax + t * vx), Y - (ay + t * vy));
  };

  points.forEach((pt) => {
    const cx = S.px(pt.x), cy = S.py(pt.y);
    out.push(`<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${pt.r || 3}" fill="${pt.color || COL.point}"/>`);
    if (!pt.name) return;
    const size = pt.size || 11;
    let place;
    if (pt.dx !== undefined || pt.dy !== undefined || pt.anchor) {
      place = { dx: pt.dx ?? 7, dy: pt.dy ?? -6, anchor: pt.anchor || 'start' };
    } else {
      const wLbl = String(pt.name).length * size * 0.55;
      let bestScore = -Infinity;
      for (const c of CANDS) {
        const tx = cx + c.dx, ty = cy + c.dy;
        const bx = c.anchor === 'start' ? tx + wLbl / 2 : c.anchor === 'end' ? tx - wLbl / 2 : tx;
        // מחוץ למסגרת — נפסל
        if (bx - wLbl / 2 < 1 || bx + wLbl / 2 > S.w - 1 || ty - size > 1 || ty > S.h - 1) continue;
        let d = Infinity;
        for (const sg of drawn) d = Math.min(d, distToSeg(bx, ty - size * 0.35, sg));
        if (d > bestScore) { bestScore = d; place = c; }
      }
      place = place || { dx: 7, dy: -6, anchor: 'start' };
    }
    out.push(textEl(cx + place.dx, cy + place.dy, pt.name,
      { anchor: place.anchor, size, weight: 700, color: pt.color || COL.point }));
  });

  // רוחב מפורש כברירת מחדל = הרוחב הטבעי. בלעדיו ה-CSS מותח את ה-SVG לרוחב
  // המכל ומגדיל את כל הטקסט (הגופן נמדד ביחידות viewBox) — הכיתוב יוצא ענק ונחתך.
  const wAttr = ` width="${r2(width ?? S.w)}"`;
  return `<svg class="chart" viewBox="0 0 ${r2(S.w)} ${r2(S.h)}"${wAttr} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escAttr(ariaLabel)}">${out.join('')}</svg>`;
}

/**
 * הברחת ערך לתוך תכונת XML עטופה במרכאות כפולות.
 * תווית ציר כמו `הכיתוב "שנים"` סוגרת את התכונה מוקדם בלי זה, והדפדפן
 * מפרש את המשך הטקסט כתכונות — למשל `y` ללא ערך, ששובר את פרסור ה-SVG.
 */
export function escAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** עיצוב מספר לתווית ציר: ללא אפסים מיותרים, מינוס יוניקוד. */
export function fmt(n) {
  const v = Math.round(n * 1000) / 1000;
  const s = Number.isInteger(v) ? String(v) : String(v);
  return s.replace('-', '−');
}

export { COL };
