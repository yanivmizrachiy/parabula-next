// tests/svg-attribute-escaping.rules.test.mjs
// רגרסיה קבועה: תווית ציר שמכילה מרכאות כפולות סגרה את aria-label מוקדם,
// והדפדפן פירש את המשך הטקסט כתכונות — `y` ללא ערך שבר את פרסור ה-SVG
// והפיל את בדיקת כל הדפים בנייד. הבדיקה שומרת שזה לא יחזור.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { escAttr } from '../scripts/lib/coord-svg.mjs';

const root = process.cwd();
const pagePattern = /^עמוד-\d+\.html$/;

test('escAttr מבריח מרכאות, סוגריים משולשים ואמפרסנד', () => {
  assert.equal(escAttr('הכיתוב "שנים"'), 'הכיתוב &quot;שנים&quot;');
  assert.equal(escAttr('a & b'), 'a &amp; b');
  assert.equal(escAttr('<tag>'), '&lt;tag&gt;');
  assert.equal(escAttr('ללא תווים מיוחדים'), 'ללא תווים מיוחדים');
});

test('ערך aria-label מוברח נשאר תכונה יחידה', () => {
  const label = 'ציר x נושא את הכיתוב "שנים"';
  const markup = `<svg aria-label="${escAttr(label)}"></svg>`;
  const attributes = markup.match(/aria-label="[^"]*"/g);
  assert.equal(attributes.length, 1, 'התכונה חייבת להיסגר במקום אחד בלבד');
  assert.ok(!/=\s*"[^"]*"\s*[֐-׿]/.test(markup), 'אסור שטקסט עברי ימשיך אחרי סגירת התכונה');
  // ללא הברחה התכונה נקטעת והטקסט שאחריה נקרא כתכונות נוספות
  const raw = `<svg aria-label="${label}"></svg>`;
  assert.ok(/=\s*"[^"]*"\s*[֐-׿]/.test(raw), 'הבדיקה חייבת לזהות את המקרה השבור');
});

/**
 * מאתר תגים פותחים שרשימת התכונות שלהם אינה תקינה.
 * הבדיקה אינה מסתמכת על סוג התו שאחרי המרכאה: מקלפים כל `name="value"`,
 * כל `name='value'` וכל תכונה בוליאנית, ומה שנשאר חייב להיות רווחים בלבד.
 * שארית כלשהי פירושה שמרכאה בתוך ערך קטעה את התכונה.
 */
function malformedTags(html) {
  const bad = [];
  const tagPattern = /<([a-zA-Z][\w:-]*)((?:[^<>"']|"[^"]*"|'[^']*')*)\/?>/g;
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    const rest = match[2]
      .replace(/\/\s*$/, ' ') // תג סוגר־עצמית: הלוכסן אינו תכונה
      .replace(/\s+[\w:.-]+\s*=\s*"[^"]*"/g, ' ')
      .replace(/\s+[\w:.-]+\s*=\s*'[^']*'/g, ' ')
      .replace(/\s+[\w:.-]+(?=\s|$)/g, ' ')
      .trim();
    if (rest) bad.push({ tag: match[1], leftover: rest.slice(0, 80) });
  }
  return bad;
}

test('גלאי התכונות מזהה מרכאה לא־מוברחת בכל שפה', () => {
  // עברית אחרי הקטיעה
  assert.ok(malformedTags('<svg aria-label="הכיתוב "שנים" y"></svg>').length > 0);
  // לטינית אחרי הקטיעה — המקרה שהגלאי הראשון שלי פספס
  assert.ok(malformedTags('<svg aria-label="הכיתוב "years" y"></svg>').length > 0);
  // תקין: מוברח
  assert.equal(malformedTags('<svg aria-label="הכיתוב &quot;years&quot;"></svg>').length, 0);
  // תקין: תכונה בוליאנית ותכונת data
  assert.equal(malformedTags('<div hidden data-close class="x"></div>').length, 0);
});

test('אף דף עבודה אינו מכיל תכונה שנסגרת מוקדם בגלל מרכאות', () => {
  const files = fs.readdirSync(root).filter((file) => pagePattern.test(file));
  assert.ok(files.length > 0, 'לא נמצאו דפי עבודה לבדיקה');

  const broken = [];
  for (const file of files) {
    const bad = malformedTags(fs.readFileSync(path.join(root, file), 'utf8'));
    if (bad.length) broken.push(`${file} (${bad[0].tag}: ${bad[0].leftover})`);
  }

  assert.deepEqual(broken, [], `דפים עם תכונה שנקטעה:\n${broken.join('\n')}`);
});
