import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// §4: הקרדיט חייב להופיע בכל דף עבודה, בשתי שורות ובנוסח המדויק.
const CREDIT_1 = 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const CREDIT_2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

// תוויות דמו של רמת קושי — אסור שיופיעו לתלמיד בשום צורה.
const FORBIDDEN_LABELS = [
  'שאלות תרגול והעשרה',
  'תרגול מדורג',
  'תרגול נוסף',
  'שאלות חשיבה ואתגר',
  'שאלת אתגר',
  'רמת התרגול',
  'שלב ביניים',
  'שילוב כלים',
  'תרגול, העמקה וחשיבה',
  'למידה מודרכת',
];

// תווית שלב/רמה מספרית ("שלב 12 - ...") אסורה בכל טקסט גלוי.
const STAGE_LABEL_RE = /שלב\s+\d+\s*[-–]/;

function getPages() {
  return fs.readdirSync(root).filter(name => /^עמוד-\d+\.html$/.test(name));
}

test('every worksheet page exists', () => {
  assert.ok(getPages().length > 0, 'No root pages found');
});

for (const file of getPages()) {
  test(`credit + no demo labels — ${file}`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');

    assert.ok(html.includes(CREDIT_1), `${file}: missing credit line 1`);
    assert.ok(html.includes(CREDIT_2), `${file}: missing credit line 2`);

    // שתי השורות חייבות לשבת יחד בתוך אלמנט footer של הדף.
    const footers = html.match(/<footer[\s\S]*?<\/footer>/g) || [];
    assert.ok(
      footers.some(f => f.includes(CREDIT_1) && f.includes(CREDIT_2)),
      `${file}: credit lines are not together inside a <footer>`,
    );

    // שורה 2 מופיעה אחרי שורה 1 — "בשורה למטה".
    assert.ok(
      html.indexOf(CREDIT_1) < html.indexOf(CREDIT_2),
      `${file}: credit line 2 must follow line 1`,
    );

    for (const label of FORBIDDEN_LABELS) {
      assert.ok(!html.includes(label), `${file}: forbidden demo label "${label}"`);
    }
    assert.ok(!STAGE_LABEL_RE.test(html), `${file}: forbidden numbered stage label`);
  });
}
