import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (file) => fs.readFileSync(file, 'utf8');

test('math rendering policy stays global and canonical', () => {
  const rules = read('CLAUDE.md');
  const pkg = JSON.parse(read('package.json'));
  const globalValidator = read('scripts/validate-math-rendering.mjs');
  const pythagorasValidator = read('scripts/validate-pythagoras-workbook.mjs');
  const pythagorasCss = read('styles/topics/pythagoras-power-practice.css');

  assert.match(rules, /אחידות גופן מתמטי — כלל גורף/u);
  assert.match(rules, /תרשים מתמטי חדש נבנה כ־SVG\/HTML וקטורי/u);
  assert.match(rules, /צילום או איור דקורטיבי/u);
  assert.match(rules, /raster/u);

  assert.equal(pkg.scripts['validate:math-rendering'], 'node scripts/validate-math-rendering.mjs');
  assert.match(pkg.scripts['ci:all'], /validate:math-rendering/u);
  assert.match(pkg.scripts['pythagoras:check'], /validate:math-rendering/u);

  assert.match(globalValidator, /root-symbol\|root-radicand/u);
  assert.doesNotMatch(globalValidator, /<img\\b/u);

  assert.doesNotMatch(pythagorasValidator, /validateMathAndDrawingStack/u);
  assert.doesNotMatch(pythagorasValidator, /אסורה תמונת raster/u);
  assert.match(pythagorasValidator, /validate-math-rendering\.mjs/u);

  assert.doesNotMatch(pythagorasCss, /\.root-symbol\b/u);
  assert.doesNotMatch(pythagorasCss, /\.root-radicand\b/u);
});
