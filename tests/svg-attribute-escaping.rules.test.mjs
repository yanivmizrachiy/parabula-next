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

test('אף דף עבודה אינו מכיל תכונה שנסגרת מוקדם בגלל מרכאות', () => {
  const files = fs.readdirSync(root).filter((file) => pagePattern.test(file));
  assert.ok(files.length > 0, 'לא נמצאו דפי עבודה לבדיקה');

  const broken = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    // תכונה שנסגרה ומיד אחריה טקסט עברי = המרכאות שבתוכה קטעו אותה
    if (/=\s*"[^"]*"\s*[֐-׿]/.test(html)) broken.push(file);
  }

  assert.deepEqual(broken, [], `דפים עם תכונה שנקטעה: ${broken.join(', ')}`);
});
