const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
};

export function createCartesianTransform({
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  width = 520,
  height = 330,
  padding = 28,
} = {}) {
  for (const [value, name] of [[xMin,'xMin'],[xMax,'xMax'],[yMin,'yMin'],[yMax,'yMax'],[width,'width'],[height,'height'],[padding,'padding']]) finite(value, name);
  if (xMax <= xMin || yMax <= yMin) throw new RangeError('axis bounds must increase');
  if (width <= padding * 2 || height <= padding * 2) throw new RangeError('padding leaves no drawable area');
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const sx = innerW / (xMax - xMin);
  const sy = innerH / (yMax - yMin);
  return Object.freeze({
    xMin, xMax, yMin, yMax, width, height, padding, sx, sy,
    toPixel({ x, y }) {
      finite(x, 'x'); finite(y, 'y');
      return { x: padding + (x - xMin) * sx, y: height - padding - (y - yMin) * sy };
    },
    toCartesian({ x, y }) {
      finite(x, 'pixel x'); finite(y, 'pixel y');
      return { x: xMin + (x - padding) / sx, y: yMin + (height - padding - y) / sy };
    },
    snap(point, step = 1) {
      finite(step, 'step');
      if (step <= 0) throw new RangeError('step must be positive');
      const p = this.toCartesian(point);
      return { x: Math.round(p.x / step) * step, y: Math.round(p.y / step) * step };
    },
  });
}

export const translatePoint = ({ x, y }, dx, dy) => ({ x: x + dx, y: y + dy });
export const reflectAcrossXAxis = ({ x, y }) => ({ x, y: -y });
export const reflectAcrossYAxis = ({ x, y }) => ({ x: -x, y });
export const reflectAcrossOrigin = ({ x, y }) => ({ x: -x, y: -y });
export const quadrantOf = ({ x, y }) => {
  if (x === 0 || y === 0) return 0;
  if (x > 0 && y > 0) return 1;
  if (x < 0 && y > 0) return 2;
  if (x < 0 && y < 0) return 3;
  return 4;
};

const esc = value => String(value).replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
const fmt = value => Object.is(value, -0) ? '0' : String(Number.isInteger(value) ? value : Number(value.toFixed(10)));
const range = (min, max, step) => {
  finite(step, 'step');
  if (step <= 0) throw new RangeError('step must be positive');
  const values = [];
  const start = Math.ceil((min - 1e-10) / step) * step;
  for (let value = start; value <= max + 1e-10; value += step) values.push(Number(value.toFixed(10)));
  return values;
};
const inRange = (value, min, max) => value >= min && value <= max;

export function renderCoordinatePlane({
  transform = createCartesianTransform(),
  points = [],
  segments = [],
  polygons = [],
  step = 1,
  labelEvery = 1,
  showGrid = true,
  showTicks = true,
  showNumbers = true,
  showAxisLabels = true,
  ariaLabel = 'מערכת צירים קרטזית',
} = {}) {
  const { width, height, padding, xMin, xMax, yMin, yMax, toPixel } = transform;
  finite(labelEvery, 'labelEvery');
  if (labelEvery <= 0) throw new RangeError('labelEvery must be positive');

  const left = padding;
  const right = width - padding;
  const top = padding;
  const bottom = height - padding;
  const xAxisVisible = inRange(0, yMin, yMax);
  const yAxisVisible = inRange(0, xMin, xMax);
  const xAxisY = xAxisVisible ? toPixel({ x: 0, y: 0 }).y : (yMin > 0 ? bottom : top);
  const yAxisX = yAxisVisible ? toPixel({ x: 0, y: 0 }).x : (xMin > 0 ? left : right);

  const grid = [];
  if (showGrid) {
    for (const x of range(xMin, xMax, step)) {
      const px = toPixel({ x, y: yMin }).x;
      grid.push(`<line class="coord-grid-line" x1="${px}" y1="${top}" x2="${px}" y2="${bottom}"/>`);
    }
    for (const y of range(yMin, yMax, step)) {
      const py = toPixel({ x: xMin, y }).y;
      grid.push(`<line class="coord-grid-line" x1="${left}" y1="${py}" x2="${right}" y2="${py}"/>`);
    }
  }

  const ticks = [];
  const numbers = [];
  if (showTicks || showNumbers) {
    for (const x of range(xMin, xMax, step)) {
      const px = toPixel({ x, y: yMin }).x;
      if (showTicks) ticks.push(`<line class="coord-tick" x1="${px}" y1="${xAxisY - 4}" x2="${px}" y2="${xAxisY + 4}"/>`);
      if (showNumbers && x !== 0 && Math.abs(x / labelEvery - Math.round(x / labelEvery)) < 1e-9) {
        const labelY = Math.min(bottom - 3, xAxisY + 18);
        numbers.push(`<text class="coord-number coord-number-x" x="${px}" y="${labelY}" text-anchor="middle" direction="ltr" unicode-bidi="isolate">${esc(fmt(x))}</text>`);
      }
    }
    for (const y of range(yMin, yMax, step)) {
      const py = toPixel({ x: xMin, y }).y;
      if (showTicks) ticks.push(`<line class="coord-tick" x1="${yAxisX - 4}" y1="${py}" x2="${yAxisX + 4}" y2="${py}"/>`);
      if (showNumbers && y !== 0 && Math.abs(y / labelEvery - Math.round(y / labelEvery)) < 1e-9) {
        const labelX = Math.max(left + 3, yAxisX - 10);
        numbers.push(`<text class="coord-number coord-number-y" x="${labelX}" y="${py + 4}" text-anchor="end" direction="ltr" unicode-bidi="isolate">${esc(fmt(y))}</text>`);
      }
    }
    if (showNumbers && xAxisVisible && yAxisVisible) {
      numbers.push(`<text class="coord-number coord-origin-label" x="${yAxisX - 9}" y="${xAxisY + 17}" text-anchor="end" direction="ltr" unicode-bidi="isolate">0</text>`);
    }
  }

  const axisLabels = [];
  if (showAxisLabels) {
    axisLabels.push(`<text class="coord-axis-label coord-axis-label-x" x="${right - 2}" y="${Math.max(top + 14, xAxisY - 8)}" text-anchor="end" direction="ltr">x</text>`);
    axisLabels.push(`<text class="coord-axis-label coord-axis-label-y" x="${Math.min(right - 10, yAxisX + 9)}" y="${top + 14}" text-anchor="start" direction="ltr">y</text>`);
  }

  const shapes = [];
  for (const polygon of polygons) {
    const coords = polygon.points.map(toPixel).map(p => `${p.x},${p.y}`).join(' ');
    shapes.push(`<polygon class="coord-polygon" points="${coords}" aria-label="${esc(polygon.label || 'מצולע')}"/>`);
  }
  for (const segment of segments) {
    const a = toPixel(segment.a), b = toPixel(segment.b);
    shapes.push(`<line class="coord-segment" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" aria-label="${esc(segment.label || 'קטע')}"/>`);
  }
  for (const point of points) {
    const p = toPixel(point);
    const label = point.label ? `<text class="coord-point-label" x="${p.x + 9}" y="${p.y - 9}" direction="ltr" unicode-bidi="isolate">${esc(point.label)}</text>` : '';
    shapes.push(`<g class="coord-point" aria-label="${esc(point.label ? `${point.label} (${fmt(point.x)}, ${fmt(point.y)})` : `(${fmt(point.x)}, ${fmt(point.y)})`)}"><circle cx="${p.x}" cy="${p.y}" r="5"/>${label}</g>`);
  }

  const clipId = `coord-clip-${Math.abs([width,height,xMin,xMax,yMin,yMax,step].join('-').split('').reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) | 0, 7))}`;
  return `<svg class="coordinate-plane" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(ariaLabel)}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><defs><clipPath id="${clipId}"><rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}"/></clipPath></defs><g class="coord-plot" clip-path="url(#${clipId})"><g class="coord-grid">${grid.join('')}</g><g class="coord-axes"><line class="coord-axis coord-axis-x" x1="${left}" y1="${xAxisY}" x2="${right}" y2="${xAxisY}"/><line class="coord-axis coord-axis-y" x1="${yAxisX}" y1="${top}" x2="${yAxisX}" y2="${bottom}"/></g><g class="coord-ticks">${ticks.join('')}</g><g class="coord-shapes">${shapes.join('')}</g></g><g class="coord-numbers">${numbers.join('')}</g><g class="coord-axis-labels">${axisLabels.join('')}</g></svg>`;
}
