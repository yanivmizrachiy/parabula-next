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
const fmt = value => Object.is(value, -0) ? '0' : String(value);

export function renderCoordinatePlane({
  transform = createCartesianTransform(),
  points = [],
  segments = [],
  polygons = [],
  step = 1,
  ariaLabel = 'מערכת צירים קרטזית',
} = {}) {
  const { width, height, xMin, xMax, yMin, yMax, toPixel } = transform;
  const grid = [];
  for (let x = Math.ceil(xMin / step) * step; x <= xMax; x += step) {
    const px = toPixel({ x, y: 0 }).x;
    grid.push(`<line class="coord-grid-line" x1="${px}" y1="0" x2="${px}" y2="${height}"/>`);
  }
  for (let y = Math.ceil(yMin / step) * step; y <= yMax; y += step) {
    const py = toPixel({ x: 0, y }).y;
    grid.push(`<line class="coord-grid-line" x1="0" y1="${py}" x2="${width}" y2="${py}"/>`);
  }
  const origin = toPixel({ x: 0, y: 0 });
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
    const label = point.label ? `<text class="coord-point-label" x="${p.x + 9}" y="${p.y - 9}">${esc(point.label)}</text>` : '';
    shapes.push(`<g class="coord-point" aria-label="${esc(point.label ? `${point.label} (${fmt(point.x)}, ${fmt(point.y)})` : `(${fmt(point.x)}, ${fmt(point.y)})`)}"><circle cx="${p.x}" cy="${p.y}" r="5"/>${label}</g>`);
  }
  return `<svg class="coordinate-plane" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(ariaLabel)}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><g class="coord-grid">${grid.join('')}</g><g class="coord-axes"><line x1="0" y1="${origin.y}" x2="${width}" y2="${origin.y}"/><line x1="${origin.x}" y1="0" x2="${origin.x}" y2="${height}"/></g><g class="coord-shapes">${shapes.join('')}</g></svg>`;
}
