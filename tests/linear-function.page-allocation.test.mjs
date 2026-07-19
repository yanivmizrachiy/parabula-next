// שער בטיחות להקצאת מספרי דפים בנושא "פונקציה קווית".
//
// רגרסיה אמיתית: הריפו משותף לתהליכי עבודה נוספים שמוסיפים דפים במקביל.
// כשהנושא גדל, ההקצאה הרצה גלשה לטווח של חוברת אחרת, והסקריפט **דרס 16 דפים**
// לפני שנעצר — כי הכתיבה קדמה לבדיקת האינווריאנטים.
// CLAUDE.md §4.3: אינווריאנט שנשבר — לא כותבים כלום.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const TOPIC = 'פונקציה קווית';
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));

test('אף דף של הנושא אינו שייך במקביל לנושא אחר', () => {
  const own = new Set();
  const others = new Map();
  for (const t of meta.topics) {
    for (const p of t.pages) {
      if (t.name === TOPIC) own.add(p.number);
      else others.set(p.number, t.name);
    }
  }
  const clash = [...own].filter((n) => others.has(n));
  assert.deepEqual(clash, [], `דפים משויכים לשני נושאים: ${clash.map((n) => `${n}(${others.get(n)})`).join(', ')}`);
});

test('כל דף בריפו מופיע בדיוק פעם אחת ב-topics.json', () => {
  const seen = new Map();
  const dup = [];
  for (const t of meta.topics) {
    for (const p of t.pages) {
      if (seen.has(p.number)) dup.push(`${p.number}: ${seen.get(p.number)} + ${t.name}`);
      seen.set(p.number, t.name);
    }
  }
  assert.deepEqual(dup, [], `דפים כפולים: ${dup.join(' | ')}`);
});

test('המספור המקומי של הנושא רציף מ-1', () => {
  const pages = meta.topics.find((t) => t.name === TOPIC)?.pages ?? [];
  assert.ok(pages.length > 0, `הנושא "${TOPIC}" ריק`);
  const locals = pages.map((p) => Number(/עמוד (\d+)/.exec(p.title)?.[1]));
  assert.deepEqual(locals, locals.map((_, i) => i + 1), 'המספור המקומי אינו רציף');
});

test('לכל דף של הנושא יש קובץ HTML ו-CSS בדיסק', () => {
  const pages = meta.topics.find((t) => t.name === TOPIC)?.pages ?? [];
  for (const p of pages) {
    assert.ok(fs.existsSync(path.join(root, p.file)), `חסר ${p.file}`);
    const css = path.join(root, 'styles', 'pages', `עמוד-${p.number}.css`);
    assert.ok(fs.existsSync(css), `חסר CSS לדף ${p.number}`);
  }
});

test('אין קובץ עמוד בדיסק שאינו רשום ב-topics.json', () => {
  const registered = new Set(meta.topics.flatMap((t) => t.pages.map((p) => p.file)));
  const orphans = fs.readdirSync(root)
    .filter((f) => /^עמוד-\d+\.html$/.test(f) && !registered.has(f));
  assert.deepEqual(orphans, [], `דפים יתומים: ${orphans.join(', ')}`);
});
