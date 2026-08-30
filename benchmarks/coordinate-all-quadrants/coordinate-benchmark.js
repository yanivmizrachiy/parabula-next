import { createCartesianTransform, renderCoordinatePlane } from '../../scripts/coordinate-engine.mjs';

const parse = (node, name) => {
  try { return JSON.parse(node.dataset[name] || '[]'); }
  catch { throw new Error(`Invalid coordinate benchmark data: ${name}`); }
};

for (const node of document.querySelectorAll('[data-coordinate-plane]')) {
  const transform = createCartesianTransform({ xMin: -6, xMax: 6, yMin: -6, yMax: 6, width: 520, height: 360, padding: 34 });
  node.innerHTML = renderCoordinatePlane({
    transform,
    points: parse(node, 'points'),
    segments: parse(node, 'segments'),
    labelEvery: 1,
    ariaLabel: 'מערכת צירים בארבעת הרביעים',
  });
}
