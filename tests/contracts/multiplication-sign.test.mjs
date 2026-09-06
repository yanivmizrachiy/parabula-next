import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// CLAUDE.md §4 — סימן הכפל המוצג לתלמיד הוא נקודה אמצעית בלבד.
// אסור „×” ואסור „\times” בשום דף עבודה קנוני; ב־MathJax משתמשים ב־\cdot.
const FORBIDDEN_MULTIPLICATION = [
  { label: 'סימן × (U+00D7)', re: /×/u },
  { label: 'פקודת \\times ב-MathJax', re: /\\times\b/u },
];

function getPages() {
  return fs.readdirSync(root).filter(name => /^עמוד-\d+\.html$/.test(name));
}

test('worksheet pages exist for the multiplication-sign contract', () => {
  assert.ok(getPages().length > 0, 'No root pages found');
});

for (const file of getPages()) {
  test(`multiplication sign is a middle dot only — ${file}`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const { label, re } of FORBIDDEN_MULTIPLICATION) {
      const match = html.match(re);
      assert.equal(
        match,
        null,
        `${file}: נמצא ${label} — יש להשתמש בנקודה אמצעית „·” (או \\cdot ב-MathJax)`,
      );
    }
  });
}
