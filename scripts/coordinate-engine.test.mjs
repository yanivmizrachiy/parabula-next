import assert from 'node:assert/strict';
import {
  createCartesianTransform,
  quadrantOf,
  reflectAcrossOrigin,
  reflectAcrossXAxis,
  reflectAcrossYAxis,
  renderCoordinatePlane,
  translatePoint,
} from './coordinate-engine.mjs';

const t = createCartesianTransform({ xMin: -10, xMax: 10, yMin: -10, yMax: 10, width: 520, height: 520, padding: 20 });

for (const point of [
  { x: 0, y: 0 },
  { x: -10, y: -10 },
  { x: 10, y: 10 },
  { x: -3.5, y: 7.25 },
]) {
  const roundTrip = t.toCartesian(t.toPixel(point));
  assert.ok(Math.abs(roundTrip.x - point.x) < 1e-10);
  assert.ok(Math.abs(roundTrip.y - point.y) < 1e-10);
}

assert.deepEqual(translatePoint({ x: -4, y: 2 }, 6, -3), { x: 2, y: -1 });
assert.deepEqual(reflectAcrossXAxis({ x: 3, y: -5 }), { x: 3, y: 5 });
assert.deepEqual(reflectAcrossYAxis({ x: 3, y: -5 }), { x: -3, y: -5 });
assert.deepEqual(reflectAcrossOrigin({ x: 3, y: -5 }), { x: -3, y: 5 });
assert.equal(quadrantOf({ x: 3, y: 5 }), 1);
assert.equal(quadrantOf({ x: -3, y: 5 }), 2);
assert.equal(quadrantOf({ x: -3, y: -5 }), 3);
assert.equal(quadrantOf({ x: 3, y: -5 }), 4);
assert.equal(quadrantOf({ x: 0, y: 5 }), 0);

const pixel = t.toPixel({ x: 2.24, y: -3.76 });
assert.deepEqual(t.snap(pixel, 0.5), { x: 2, y: -4 });

const svg = renderCoordinatePlane({
  transform: t,
  points: [{ x: -4, y: 2, label: 'K' }, { x: 2, y: -1, label: 'K′' }],
  segments: [{ a: { x: -4, y: 2 }, b: { x: 2, y: -1 }, label: 'הזזה' }],
  polygons: [{ points: [{ x: -2, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 2 }], label: 'משולש' }],
  ariaLabel: 'בדיקת מערכת צירים בארבעת הרביעים',
});
assert.match(svg, /role="img"/);
assert.match(svg, /aria-label="בדיקת מערכת צירים בארבעת הרביעים"/);
assert.match(svg, /K′/);
assert.match(svg, /coord-axis-label-x/);
assert.match(svg, /coord-axis-label-y/);
assert.match(svg, /coord-origin-label/);
assert.match(svg, /clipPath/);
assert.match(svg, />-5<\/text>/);
assert.match(svg, /direction="ltr" unicode-bidi="isolate">-5<\/text>/);
assert.doesNotMatch(svg, />5-<\/text>/);
assert.doesNotMatch(svg, /NaN|Infinity/);

const sparseLabels = renderCoordinatePlane({ transform: t, step: 1, labelEvery: 2 });
assert.match(sparseLabels, />-10<\/text>/);
assert.match(sparseLabels, />-8<\/text>/);
assert.doesNotMatch(sparseLabels, />-9<\/text>/);

const positiveOnly = createCartesianTransform({ xMin: 1, xMax: 5, yMin: 1, yMax: 5, width: 300, height: 300, padding: 20 });
const positiveSvg = renderCoordinatePlane({ transform: positiveOnly });
assert.doesNotMatch(positiveSvg, /coord-origin-label/);
assert.doesNotMatch(positiveSvg, /NaN|Infinity/);

assert.throws(() => createCartesianTransform({ xMin: 1, xMax: 1 }), RangeError);
assert.throws(() => t.snap({ x: 1, y: 1 }, 0), RangeError);
assert.throws(() => renderCoordinatePlane({ transform: t, step: 0 }), RangeError);
assert.throws(() => renderCoordinatePlane({ transform: t, labelEvery: 0 }), RangeError);

console.log('coordinate-engine: all tests passed');
