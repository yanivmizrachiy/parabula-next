// tests/catalog.curriculum.rules.test.mjs
// חוזה §4.5 בקורא המחשב. עד כה לא הייתה לו שום בדיקה: עץ תכנית הלימודים,
// המונים והלוח היו מאומתים רק בשאילתות ידניות, ומחיקה שלהם הייתה עוברת בשקט.
// הבדיקה נועלת את החוזה ברמת המקור — היא אינה מחליפה אימות בדפדפן.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const catalogJs = read('catalog.js');
const catalogHtml = read('catalog.html');
const mobileJs = read('mobile-app.js');
const topics = JSON.parse(read('meta/topics.json'));

test('הקורא קורא את עץ תכנית הלימודים מהמקור הקנוני היחיד', () => {
  assert.ok(catalogJs.includes('meta/topics.json'), 'catalog.js חייב לקרוא את meta/topics.json');
  assert.ok(catalogJs.includes('data.curriculum'), 'catalog.js חייב לקרוא את מפתח curriculum');
  assert.ok(mobileJs.includes('state.db.curriculum'), 'mobile-app.js חייב לקרוא את מפתח curriculum');
});

test('שני הקוראים בונים עץ ולא רשימה שטוחה', () => {
  for (const [name, js, cls] of [['catalog.js', catalogJs, 'toc-node'], ['mobile-app.js', mobileJs, 'topic-node']]) {
    assert.ok(js.includes(cls), `${name}: חסר צומת עץ .${cls}`);
    assert.ok(/children/.test(js), `${name}: אינו יורד לצאצאי הצומת`);
    assert.ok(js.includes('curriculumId'), `${name}: אינו משתמש בשיוך הדף`);
  }
});

test('המונה בכל צומת מוצג מהערך הנגזר ואינו נכתב בקוד', () => {
  assert.ok(/node\.pageCount/.test(catalogJs), 'catalog.js: המונה חייב לבוא מ-pageCount');
  assert.ok(/node\.pageCount/.test(mobileJs), 'mobile-app.js: המונה חייב לבוא מ-pageCount');
  // אסור שמספר דפים או נושאים יופיע כקבוע בקוד הקוראים (§6)
  for (const [name, js] of [['catalog.js', catalogJs], ['mobile-app.js', mobileJs]]) {
    const hardcoded = js.match(/\b(?:\d{3,4})\s*דפים/g) || [];
    assert.deepEqual(hardcoded, [], `${name}: ספירת דפים קשיחה — ${hardcoded.join(', ')}`);
  }
});

test('רשת הביטחון קיימת: דף ללא שיוך אינו נעלם', () => {
  for (const [name, js] of [['catalog.js', catalogJs], ['mobile-app.js', mobileJs]]) {
    assert.ok(js.includes('UNASSIGNED_ID'), `${name}: חסרה רשת ביטחון ליתומים`);
    assert.ok(js.includes('ממתינים לשיוך'), `${name}: הצומת החלופי חייב להיות גלוי בעברית`);
  }
});

test('סדר הדפים בצומת נגזר מהמספור המודפס ולא מסדר המערך', () => {
  for (const [name, js] of [['catalog.js', catalogJs], ['mobile-app.js', mobileJs]]) {
    assert.ok(/localOf/.test(js), `${name}: חסר מיון לפי המספור המקומי`);
    assert.ok(/topicOrder/.test(js), `${name}: חסר שימור סדר הנושא השטוח`);
  }
});

test('לוח המונים קיים, מודאלי ומשחרר את הרקע', () => {
  assert.ok(catalogHtml.includes('id="board"'), 'catalog.html: חסר לוח המונים');
  assert.ok(catalogHtml.includes('aria-modal="true"'), 'catalog.html: הלוח חייב להיות מודאלי');
  assert.ok(catalogHtml.includes('id="boardToggleEmpty"'), 'catalog.html: חסרה מסננת הצמתים הריקים');
  assert.ok(catalogJs.includes("setAttribute('inert'"), 'catalog.js: הרקע חייב להיות inert בזמן פתיחה');
  assert.ok(catalogJs.includes("removeAttribute('inert')"), 'catalog.js: ה-inert חייב להשתחרר בסגירה');
  assert.ok(catalogJs.includes('handleBoardKeydown'), 'catalog.js: חסרה לכידת Tab בדיאלוג');
  assert.ok(catalogJs.includes('returnFocus'), 'catalog.js: המיקוד חייב לחזור למפעיל');
});

test('כל מזהי ה-DOM שהקורא ניגש אליהם רשומים ברשימת ה-IDs', () => {
  // dom.x יהיה undefined בשקט אם ה-id לא נרשם ברשימה הקשיחה בראש הקובץ
  const whitelist = new Set([...catalogJs.matchAll(/'([A-Za-z][A-Za-z0-9]*)'/g)].map((m) => m[1]));
  const used = new Set([...catalogJs.matchAll(/\bdom\.([A-Za-z][A-Za-z0-9]*)\b/g)].map((m) => m[1]));
  const missing = [...used].filter((id) => !whitelist.has(id) && !catalogJs.includes(`dom.${id} =`)
    && !catalogJs.includes(`${id}Contains`));
  assert.deepEqual(missing, [], `מזהים שנעשה בהם שימוש ואינם רשומים: ${missing.join(', ')}`);
});

test('כל צומת בעץ השמור נגיש דרך המזהה ההיררכי שלו', () => {
  const flat = [];
  (function walk(nodes) {
    for (const node of nodes) { flat.push(node); if (node.children?.length) walk(node.children); }
  })(topics.curriculum.nodes);

  const ids = new Set(flat.map((n) => n.id));
  for (const node of flat) {
    const parentId = node.id.split('.').slice(0, -1).join('.');
    if (!parentId) continue;
    assert.ok(ids.has(parentId), `הצומת ${node.id} מפנה לאב ${parentId} שאינו קיים`);
  }
  assert.ok(flat.length >= 3, 'העץ חייב להכיל לפחות את שלוש הכיתות');
});
