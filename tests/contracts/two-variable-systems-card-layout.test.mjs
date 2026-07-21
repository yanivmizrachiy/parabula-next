import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'styles/topics/two-variable-systems.css'), 'utf8');
const systemPages = [601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 612];

test('system cards use a vertical exercise-work-answer layout', () => {
  assert.match(css, /grid-template-areas:\s*"dot system"\s*"\. work"\s*"\. answer"/);
  assert.doesNotMatch(css, /"dot system work"/);
  assert.doesNotMatch(css, /border-right:\s*1px dashed var\(--systems-line\)/);
});

test('mathematical systems are isolated left-to-right', () => {
  assert.match(css, /\.system-math\s*\{[^}]*direction:\s*ltr;/s);
  assert.match(css, /\.system-math\s*\{[^}]*unicode-bidi:\s*isolate;/s);
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
