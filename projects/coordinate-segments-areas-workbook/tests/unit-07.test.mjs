// חוזי יחידה 7 — אוריינות: תכנון ומדידה (עמודים 65–70).
// כל ערך נגזר מהקודקודים; מחירים בדוקים כמכפלות מוצהרות.

import test from 'node:test';
import assert from 'node:assert/strict';
import pages from '../src/pages/index.mjs';
import unit07 from '../src/pages/unit-07-literacy.mjs';
import { answers } from '../src/all-answers.mjs';
import { derive } from '../src/teacher-key.mjs';
import { EXPECTED_PAGES } from './expected-pages.mjs';

test(`רצף העמודים 1–${EXPECTED_PAGES} רציף (בדיקת יחידה 7)`, () => {
  const ns = pages.map(p => p.n);
  assert.equal(ns.length, EXPECTED_PAGES, `יש ${ns.length} עמודים במקום ${EXPECTED_PAGES}`);
  assert.deepEqual([...ns].sort((a, b) => a - b), Array.from({ length: EXPECTED_PAGES }, (_, i) => i + 1));
});

test('יחידה 7 מחוברת לרצף במלואה', () => {
  const range = pages.filter(p => p.n >= 65 && p.n <= 70);
  assert.equal(range.length, 6);
  for (const p of unit07) {
    assert.ok(pages.includes(p), `עמוד ${p.n} של unit-07 אינו ברצף`);
  }
});

test('עמוד 65: אזורי הגינה, הגדר והשטח הפנוי מסתכמים', () => {
  const grass = derive(answers.find(a => a.id === 'p65-grass'));
  const bed = derive(answers.find(a => a.id === 'p65-bed'));
  const path = derive(answers.find(a => a.id === 'p65-path'));
  assert.equal(grass.area, 24);
  assert.equal(bed.area, 6);
  assert.deepEqual(bed.legs, [3, 4]);
  assert.equal(path.area, 10);
  const fence = answers.find(a => a.id === 'p65-fence').expect;
  assert.equal(fence.fenceLength, 2 * (fence.plotWidth + fence.plotHeight));
  assert.equal(fence.plotArea, fence.plotWidth * fence.plotHeight);
  assert.equal(fence.freeArea, fence.plotArea - grass.area - bed.area - path.area);
  const alt = answers.find(a => a.id === 'p65-alt').expect;
  assert.equal(alt.altFence, 2 * (10 + 7));
  assert.ok(alt.altFence < fence.fenceLength);
});

test('עמוד 66: שטח המגרש, הגדר והעלויות נגזרים ומוסכמים', () => {
  const trap = derive(answers.find(a => a.id === 'p66-trap'));
  const rect = derive(answers.find(a => a.id === 'p66-rect'));
  assert.equal(trap.area, 18);
  assert.equal(trap.legBC, 5, 'השוק האלכסונית חייבת להיות 3-4-5');
  assert.equal(rect.area, 32);
  const field = answers.find(a => a.id === 'p66-field').expect;
  assert.equal(field.totalArea, trap.area + rect.area);
  assert.equal(field.outlinePerimeter, 14 + 5 + 11 + 4);
  assert.equal(field.fencedLength, field.outlinePerimeter - field.gate);
  const costs = answers.find(a => a.id === 'p66-costs').expect;
  assert.equal(costs.pavingCost, field.totalArea * costs.pavingPerM2);
  assert.equal(costs.fenceCost, field.fencedLength * costs.fencePerM);
  assert.equal(costs.totalCost, costs.pavingCost + costs.fenceCost);
  const cmp = answers.find(a => a.id === 'p66-compare').expect;
  assert.equal(cmp.altArea, 10 * 5);
  assert.equal(cmp.altArea, field.totalArea, 'אותו שטח בשתי ההצעות');
  assert.equal(cmp.altPerimeter, 2 * (10 + 5));
  assert.equal(cmp.altFenced, cmp.altPerimeter - field.gate);
  assert.equal(cmp.altFenceCost, cmp.altFenced * costs.fencePerM);
  assert.equal(cmp.savings, costs.fenceCost - cmp.altFenceCost);

  const budget = answers.find(a => a.id === 'p66-budget').expect;
  assert.equal(budget.originalTotal, costs.totalCost);
  assert.equal(budget.altTotal, costs.pavingCost + cmp.altFenceCost);
  assert.equal(budget.bothFit, budget.originalTotal <= budget.budget && budget.altTotal <= budget.budget);
});

test('עמוד 67: אורכי המסלולים נגזרים מקטעי הרשומות עצמם', () => {
  const len = id => derive(answers.find(a => a.id === id)).length;
  const routes = answers.find(a => a.id === 'p67-routes').expect;
  assert.equal(routes.directRoute, len('p67-SA') + len('p67-AB') + len('p67-BC'));
  assert.equal(routes.altRoute, len('p67-SE') + len('p67-EC') + len('p67-BC') + len('p67-AB'));
  assert.equal(routes.withExtraStation, routes.directRoute + 2 * len('p67-AM'));
  assert.equal(routes.shortest, Math.min(routes.directRoute, routes.altRoute, routes.withExtraStation));
  // המסלול הישיר והחלופי שווים — זו נקודת הלימוד של "מסלול אחר באותו אורך".
  assert.equal(routes.directRoute, routes.altRoute);

  // מסלול החזרה: מרחק מנהטן בין C(-2,-3) ל-S(-4,2).
  const back = answers.find(a => a.id === 'p67-return').expect;
  assert.equal(back.horizontalPart, Math.abs(-4 - -2));
  assert.equal(back.verticalPart, Math.abs(2 - -3));
  assert.equal(back.shortestReturn, back.horizontalPart + back.verticalPart);
});

test('עמוד 68: קנה המידה — אורך פי 10 ושטח פי 100', () => {
  const building = derive(answers.find(a => a.id === 'p68-building'));
  const court = derive(answers.find(a => a.id === 'p68-court'));
  const path = derive(answers.find(a => a.id === 'p68-pathSeg'));
  const real = answers.find(a => a.id === 'p68-real').expect;
  assert.equal(real.buildingWidthM, building.width * real.unitMeters);
  assert.equal(real.buildingHeightM, building.height * real.unitMeters);
  assert.equal(real.buildingAreaM2, building.area * real.unitMeters ** 2);
  assert.equal(real.courtAreaM2, court.area * real.unitMeters ** 2);
  assert.equal(real.pathLengthM, path.length * real.unitMeters);
  assert.equal(real.buildingPerimeterM, building.perimeter * real.unitMeters);
  assert.equal(real.areaFactor, real.lengthFactor ** 2);
});

test('עמוד 69: העלות מהשיעורים בלבד, והסתירה בין המלל לשיעורים', () => {
  const garden = derive(answers.find(a => a.id === 'p69-garden'));
  assert.equal(garden.area, 35);
  const sort = answers.find(a => a.id === 'p69-sort').expect;
  assert.equal(sort.cost, garden.area * 12);
  const missing = answers.find(a => a.id === 'p69-missing').expect;
  assert.equal(missing.base, 7 - 1);
  assert.equal(missing.withHeight4, missing.base * 4 / 2);
  const contradiction = answers.find(a => a.id === 'p69-contradiction').expect;
  assert.equal(contradiction.derivedLength, garden.width, 'האורך הנגזר הוא רוחב הגן');
  assert.notEqual(contradiction.statedLength, contradiction.derivedLength);
});

test('עמוד 70: ארבע דרכים תקפות לאותו טרפז, והטעות היא שכחת החלוקה ב-2', () => {
  const trap = derive(answers.find(a => a.id === 'p70-trap'));
  assert.equal(trap.area, 28);
  assert.equal(trap.legAD, 5);
  assert.equal(trap.legBC, 5);
  const ways = answers.find(a => a.id === 'p70-ways').expect;
  assert.equal(ways.midRect, 4 * 4);
  assert.equal(ways.sideTriangleEach, 3 * 4 / 2);
  assert.equal(ways.wayDecompose, ways.midRect + 2 * ways.sideTriangleEach);
  assert.equal(ways.boundingRect, 10 * 4);
  assert.equal(ways.wayBounding, ways.boundingRect - ways.cutTriangles);
  assert.equal(ways.wayFormula, (10 + 4) * 4 / 2);
  assert.equal(new Set([ways.wayDecompose, ways.wayBounding, ways.wayFormula, trap.area]).size, 1);
  const error = answers.find(a => a.id === 'p70-error').expect;
  assert.equal(error.wrongResult, (10 + 4) * 4, 'הטעות היא הנוסחה ללא חלוקה');
  const fourth = answers.find(a => a.id === 'p70-fourth').expect;
  assert.equal(fourth.lowerTriangle, 10 * 4 / 2);
  assert.equal(fourth.upperTriangle, 4 * 4 / 2);
  assert.equal(fourth.lowerTriangle + fourth.upperTriangle, trap.area);
});

test('כיסוי תשובות: לכל עמוד 65–70 יש לפחות רשומה אחת', () => {
  for (let n = 65; n <= 70; n++) {
    assert.ok(answers.some(a => a.page === n), `עמוד ${n} ללא רשומת תשובה`);
  }
});
