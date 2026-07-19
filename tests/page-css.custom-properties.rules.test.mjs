// tests/page-css.custom-properties.rules.test.mjs
// משתנה CSS שאינו מוגדר לא בדף, לא בשכבת הבסיס ולא בשכבת הנושא מתפרש כערך ריק,
// והפריסה נשברת בשקט בלי שגיאה. הבדיקה הזו החליפה נעיצה של ערך פיקסלים אחד
// בקובץ אחד — היא שומרת על כל קובצי ה-CSS של הדפים.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const definitionsIn = (text) =>
  new Set([...text.matchAll(/(^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[2]));

function inheritedTokens() {
  const tokens = new Set();
  const base = path.join(root, 'styles', 'a4-base.css');
  if (fs.existsSync(base)) for (const t of definitionsIn(fs.readFileSync(base, 'utf8'))) tokens.add(t);
  const topicsDir = path.join(root, 'styles', 'topics');
  if (fs.existsSync(topicsDir)) {
    for (const file of fs.readdirSync(topicsDir)) {
      if (!file.endsWith('.css')) continue;
      for (const t of definitionsIn(fs.readFileSync(path.join(topicsDir, file), 'utf8'))) tokens.add(t);
    }
  }
  return tokens;
}

test('page CSS never reads a custom property that nothing defines', () => {
  const pagesDir = path.join(root, 'styles', 'pages');
  assert.ok(fs.existsSync(pagesDir), 'styles/pages is missing');

  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.css'));
  assert.ok(files.length > 0, 'no page stylesheets found');

  const inherited = inheritedTokens();
  assert.ok(inherited.size > 0, 'expected design tokens in styles/a4-base.css');

  const offenders = [];
  for (const file of files) {
    const css = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    const own = definitionsIn(css);
    const used = new Set([...css.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((m) => m[1]));
    for (const name of used) {
      if (!own.has(name) && !inherited.has(name)) offenders.push(`styles/pages/${file}: ${name}`);
    }
  }

  assert.deepEqual(offenders, [], `custom properties read but never defined:\n - ${offenders.join('\n - ')}`);
});
