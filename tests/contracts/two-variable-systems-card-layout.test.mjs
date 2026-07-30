import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'styles/topics/two-variable-systems.css'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
const systemsTopic = meta.topics.find((topic) => topic.name === 'מערכת משוואות בשני נעלמים');
// נגזר מהמטא־דאטה — לא רשימה קשיחה שמתיישנת בכל פיצול (CLAUDE.md §6)
const systemPages = systemsTopic.pages
  .map((page) => page.number)
  .filter((number) => fs.readFileSync(path.join(root, `עמוד-${number}.html`), 'utf8').includes('<section class="system-card">'));

const assertRule = (selector, declarations) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'));
  assert.ok(match, `missing CSS rule: ${selector}`);
  for (const declaration of declarations) {
    assert.match(match[1], declaration, `${selector} must include ${declaration}`);
  }
};

test('system cards use a vertical exercise-work-answer layout', () => {
  assert.match(css, /grid-template-areas:\s*"dot system"\s*"\. work"\s*"\. answer"/);
  assert.doesNotMatch(css, /"dot system work"/);
  assertRule('.systems2-page .system-card', [/direction:\s*ltr;/]);
});

test('all displayed exercises are left aligned, LTR and exactly 13px', () => {
  assertRule('.systems2-page .system-math', [
    /direction:\s*ltr;/,
    /unicode-bidi:\s*isolate;/,
    /text-align:\s*left;/,
    /font-size:\s*13px;/,
  ]);
  assertRule('.systems2-page.systems-wide .system-math', [/text-align:\s*left;/, /font-size:\s*13px;/]);
  assertRule('.systems2-page.systems-intro .system-math', [/text-align:\s*left;/, /font-size:\s*13px;/]);
  assertRule('.systems2-page.systems-fractions .system-math', [/text-align:\s*left;/, /font-size:\s*13px;/]);
  assertRule('.systems2-page .classification-math', [/direction:\s*ltr;/, /text-align:\s*left;/, /font-size:\s*13px;/]);
  assertRule('.systems2-page .challenge-math', [/direction:\s*ltr;/, /text-align:\s*left;/, /font-size:\s*13px;/]);
  assertRule('.systems2-page.systems-reasoning .reasoning-system', [/direction:\s*ltr;/, /text-align:\s*left;/, /font-size:\s*13px;/]);
});

test('MathJax display containers cannot recenter the exercises', () => {
  const displayRules = [
    '.systems2-page .system-math mjx-container[display="true"]',
    '.systems2-page .classification-math mjx-container[display="true"]',
    '.systems2-page .challenge-math mjx-container[display="true"]',
    '.systems2-page.systems-reasoning .reasoning-system mjx-container[display="true"]',
  ];
  for (const selector of displayRules) {
    assertRule(selector, [/text-align:\s*left\s*!important;/]);
  }
});

test('solution workspace is a large blue square grid with no writing lines', () => {
  assertRule('.systems2-page .work-lines', [
    /display:\s*block;/,
    /min-height:\s*150px;/,
    /border:\s*1px solid var\(--systems-grid-border\);/,
    /linear-gradient\(to right,\s*var\(--systems-grid\)\s*1px,\s*transparent\s*1px\)/,
    /linear-gradient\(to bottom,\s*var\(--systems-grid\)\s*1px,\s*transparent\s*1px\)/,
    /background-size:\s*12px 12px;/,
    /print-color-adjust:\s*exact;/,
  ]);
  assertRule('.systems2-page .work-line', [/display:\s*none;/]);
  assert.doesNotMatch(css, /\.work-line\s*\{[^}]*border-bottom:/s);
});

test('final answer stays at the bottom below a blue separator', () => {
  assertRule('.systems2-page .final-answer', [
    /grid-area:\s*answer;/,
    /align-self:\s*end;/,
    /border-top:\s*1px solid var\(--systems-blue\);/,
    /width:\s*100%;/,
  ]);
});

// CLAUDE.md §4.6 — מרחב הפתרון קודם לצפיפות; עד 3 מערכות בעמוד.
test('no page crowds more than three systems, so every exercise keeps real writing room', () => {
  for (const number of systemPages) {
    const html = fs.readFileSync(path.join(root, `עמוד-${number}.html`), 'utf8');
    const count = (html.match(/<section class="system-card">/g) || []).length;
    assert.ok(count <= 3, `עמוד-${number}.html נושא ${count} מערכות — מעל 3 (§4.6)`);
  }
});

test('the solution grid stretches to fill the page height', () => {
  assertRule('.systems2-page .systems-list', [/grid-auto-rows:\s*1fr;/]);
});

test('every system card keeps exercise, work area and final answer in that order', () => {
  for (const number of systemPages) {
    const html = fs.readFileSync(path.join(root, `עמוד-${number}.html`), 'utf8');
    const cards = html.split('<section class="system-card">').slice(1);
    assert.ok(cards.length > 0, `עמוד-${number}.html must contain system cards`);
    for (const [index, card] of cards.entries()) {
      const end = card.indexOf('</section>');
      const body = end === -1 ? card : card.slice(0, end);
      const math = body.indexOf('class="system-math"');
      const work = body.indexOf('class="work-lines"');
      const answer = body.indexOf('class="final-answer"');
      assert.ok(math !== -1 && work !== -1 && answer !== -1, `page ${number}, card ${index + 1} is incomplete`);
      assert.ok(math < work && work < answer, `page ${number}, card ${index + 1} must be exercise → work → final answer`);
    }
  }
});
