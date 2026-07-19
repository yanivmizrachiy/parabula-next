// מנוע SVG וקטורי למערכות צירים.
//
// חוזה המנוע (CLAUDE.md §4.3):
// - קנה מידה זהה בציר X ובציר Y. `unit` הוא מספר יחיד; אין scaleX/scaleY נפרדים.
// - כל <text> שמכיל ספרה ואין בו אות עברית מקבל direction="ltr".
// - כל גודל גאומטרי מחושב מנוסחה מפורשת וניתן לחישוב הלוך־חזור דרך `toMath`.
//
// מערכת הקואורדינטות: מקור מתמטי (x ימינה, y למעלה) ממופה ל־SVG (y כלפי מטה).

const HEBREW = /[֐-׿]/;
const DIGIT = /[0-9]/;

/** האם הטקסט חייב direction="ltr" — מכיל ספרה ואין בו אות עברית. */
export function needsLtr(text) {
  return DIGIT.test(text) && !HEBREW.test(text);
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** עיגול יציב לשני מקומות — מונע 0.30000000000000004 בפלט ה־SVG. */
function num(value) {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * בונה מערכת צירים.
 *
 * @param {object} options
 * @param {number} options.xMin  שיעור X מינימלי (שלם)
 * @param {number} options.xMax  שיעור X מקסימלי (שלם)
 * @param {number} options.yMin  שיעור Y מינימלי (שלם)
 * @param {number} options.yMax  שיעור Y מקסימלי (שלם)
 * @param {number} [options.unit] פיקסלים ליחידה — זהה ב־X וב־Y
 * @param {number} [options.pad]  שוליים בפיקסלים סביב תחום הצירים
 */
export function createGrid({ xMin, xMax, yMin, yMax, unit = 22, pad = 18 }) {
  for (const [name, value] of Object.entries({ xMin, xMax, yMin, yMax })) {
    if (!Number.isInteger(value)) throw new Error(`createGrid: ${name} must be an integer, received ${value}`);
  }
  if (xMax <= xMin) throw new Error(`createGrid: xMax (${xMax}) must exceed xMin (${xMin})`);
  if (yMax <= yMin) throw new Error(`createGrid: yMax (${yMax}) must exceed yMin (${yMin})`);
  if (!(unit > 0)) throw new Error(`createGrid: unit must be positive, received ${unit}`);

  const width = (xMax - xMin) * unit + pad * 2;
  const height = (yMax - yMin) * unit + pad * 2;

  // המרות הלוך־חזור. toSvg ∘ toMath = identity עד כדי שגיאת נקודה צפה.
  const toSvgX = x => pad + (x - xMin) * unit;
  const toSvgY = y => pad + (yMax - y) * unit;
  const toMathX = px => (px - pad) / unit + xMin;
  const toMathY = py => yMax - (py - pad) / unit;

  const layers = { grid: [], axes: [], shapes: [], points: [], labels: [] };
  const meta = { points: [], segments: [], polygons: [], axisCrossings: [] };

  const api = {
    unit, pad, width, height, xMin, xMax, yMin, yMax,
    toSvgX, toSvgY, toMathX, toMathY, meta,

    /** רשת משבצות יחידה — בסיס להבנת שטח כמספר משבצות. */
    grid() {
      for (let x = xMin; x <= xMax; x += 1) {
        layers.grid.push(`<line class="cg-grid" x1="${num(toSvgX(x))}" y1="${num(toSvgY(yMin))}" x2="${num(toSvgX(x))}" y2="${num(toSvgY(yMax))}"/>`);
      }
      for (let y = yMin; y <= yMax; y += 1) {
        layers.grid.push(`<line class="cg-grid" x1="${num(toSvgX(xMin))}" y1="${num(toSvgY(y))}" x2="${num(toSvgX(xMax))}" y2="${num(toSvgY(y))}"/>`);
      }
      return api;
    },

    /** צירים עם חצים, שנתות ותוויות מספריות. */
    axes({ labelEvery = 1, showZero = true } = {}) {
      const x0 = num(toSvgX(0));
      const y0 = num(toSvgY(0));
      layers.axes.push(`<line class="cg-axis" x1="${num(toSvgX(xMin))}" y1="${y0}" x2="${num(toSvgX(xMax))}" y2="${y0}" marker-end="url(#cg-arrow)"/>`);
      layers.axes.push(`<line class="cg-axis" x1="${x0}" y1="${num(toSvgY(yMin))}" x2="${x0}" y2="${num(toSvgY(yMax))}" marker-end="url(#cg-arrow)"/>`);
      layers.labels.push(`<text class="cg-axis-name" x="${num(toSvgX(xMax))}" y="${num(y0 + 15)}" text-anchor="middle">x</text>`);
      layers.labels.push(`<text class="cg-axis-name" x="${num(x0 - 13)}" y="${num(toSvgY(yMax))}" text-anchor="middle">y</text>`);

      for (let x = xMin; x <= xMax; x += 1) {
        if (x === 0) continue;
        layers.axes.push(`<line class="cg-tick" x1="${num(toSvgX(x))}" y1="${num(y0 - 3)}" x2="${num(toSvgX(x))}" y2="${num(y0 + 3)}"/>`);
        if (x % labelEvery === 0) api.text(String(x), toSvgX(x), y0 + 13, { anchor: 'middle', cls: 'cg-tick-label' });
      }
      for (let y = yMin; y <= yMax; y += 1) {
        if (y === 0) continue;
        layers.axes.push(`<line class="cg-tick" x1="${num(x0 - 3)}" y1="${num(toSvgY(y))}" x2="${num(x0 + 3)}" y2="${num(toSvgY(y))}"/>`);
        if (y % labelEvery === 0) api.text(String(y), x0 - 7, toSvgY(y) + 4, { anchor: 'end', cls: 'cg-tick-label' });
      }
      if (showZero) api.text('0', x0 - 7, y0 + 13, { anchor: 'end', cls: 'cg-tick-label' });
      return api;
    },

    /** נקודה מסומנת. label ריק משאיר נקודה בלי כיתוב. */
    point(x, y, label = '', { dx = 7, dy = -7, cls = '' } = {}) {
      const px = toSvgX(x);
      const py = toSvgY(y);
      layers.points.push(`<circle class="${cls ? `cg-point ${cls}` : 'cg-point'}" cx="${num(px)}" cy="${num(py)}" r="3.2"/>`);
      if (label) {
        api.text(label, px + dx, py + dy, { anchor: dx < 0 ? 'end' : 'start', cls: 'cg-point-label' });
      }
      meta.points.push({ x, y, label, svgX: num(px), svgY: num(py) });
      return api;
    },

    /** קטע בין שתי נקודות מתמטיות; רושם אורך וחיתוכי צירים ל־meta. */
    segment(a, b, { cls = 'cg-seg', dashed = false } = {}) {
      const classes = dashed ? `${cls} cg-dashed` : cls;
      layers.shapes.push(`<line class="${classes}" x1="${num(toSvgX(a[0]))}" y1="${num(toSvgY(a[1]))}" x2="${num(toSvgX(b[0]))}" y2="${num(toSvgY(b[1]))}"/>`);
      const axisParallel = a[1] === b[1] ? 'x' : a[0] === b[0] ? 'y' : null;
      const length = axisParallel === 'x' ? Math.abs(b[0] - a[0])
        : axisParallel === 'y' ? Math.abs(b[1] - a[1])
        : null;
      meta.segments.push({ a, b, axisParallel, length });
      recordCrossings(a, b);
      return api;
    },

    /** מצולע סגור; רושם שטח (נוסחת השרוכים) ל־meta. */
    polygon(vertices, { cls = 'cg-poly', fill = true } = {}) {
      const pts = vertices.map(([x, y]) => `${num(toSvgX(x))},${num(toSvgY(y))}`).join(' ');
      layers.shapes.push(`<polygon class="${cls}${fill ? ' cg-fill' : ''}" points="${pts}"/>`);
      meta.polygons.push({ vertices, area: shoelaceArea(vertices) });
      for (let i = 0; i < vertices.length; i += 1) {
        recordCrossings(vertices[i], vertices[(i + 1) % vertices.length]);
      }
      return api;
    },

    /** טקסט חופשי. direction="ltr" נקבע אוטומטית לפי תוכן (CLAUDE.md §4.3). */
    text(content, px, py, { anchor = 'start', cls = 'cg-text' } = {}) {
      const dir = needsLtr(content) ? ' direction="ltr"' : '';
      layers.labels.push(`<text class="${cls}" x="${num(px)}" y="${num(py)}" text-anchor="${anchor}"${dir}>${esc(content)}</text>`);
      return api;
    },

    /** תווית ליד נקודה מתמטית, ממוקמת ביחידות הצירים. */
    labelAt(content, x, y, options = {}) {
      return api.text(content, toSvgX(x) + (options.dx ?? 0), toSvgY(y) + (options.dy ?? 0), options);
    },

    toString() {
      const body = [...layers.grid, ...layers.axes, ...layers.shapes, ...layers.points, ...layers.labels].join('');
      return `<svg class="cg" viewBox="0 0 ${num(width)} ${num(height)}" width="${num(width)}" height="${num(height)}" role="img" xmlns="http://www.w3.org/2000/svg">`
        + `<defs><marker id="cg-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`
        + `<path d="M0,0 L8,4 L0,8 z" class="cg-arrow-head"/></marker></defs>${body}</svg>`;
    }
  };

  function recordCrossings(a, b) {
    if (a[1] === b[1] && Math.sign(a[0]) * Math.sign(b[0]) < 0) {
      meta.axisCrossings.push({ axis: 'y', at: [0, a[1]] });
    }
    if (a[0] === b[0] && Math.sign(a[1]) * Math.sign(b[1]) < 0) {
      meta.axisCrossings.push({ axis: 'x', at: [a[0], 0] });
    }
  }

  return api;
}

/** שטח מצולע פשוט בנוסחת השרוכים. */
export function shoelaceArea(vertices) {
  let sum = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[(i + 1) % vertices.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

/** אורך קטע המקביל לציר. זורק שגיאה לקטע אלכסוני — אינו בכלים המותרים לחט״ב. */
export function axisParallelLength(a, b) {
  if (a[1] === b[1]) return Math.abs(b[0] - a[0]);
  if (a[0] === b[0]) return Math.abs(b[1] - a[1]);
  throw new Error(`axisParallelLength: segment ${JSON.stringify(a)}–${JSON.stringify(b)} is not axis-parallel`);
}
