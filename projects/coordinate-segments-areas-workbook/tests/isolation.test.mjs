// שומר הבידוד: מודול קנוני אחד לכל יחידה, ללא קובצי וריאנט מקבילים.
// ההיסטוריה: unit-03-advanced נפגע פעם מכתיבות מקבילות ושוחזר; הבדיקות כאן
// מונעות הישנות — גם חיבור קובץ פגום מחדש וגם הצטברות גרסאות v2/new/final.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(root, 'src', 'pages');
const indexSource = fs.readFileSync(path.join(pagesDir, 'index.mjs'), 'utf8');

test('רצף העמודים משתמש במודול הקנוני של יחידה 3', () => {
  assert.match(indexSource, /from ['"]\.\/unit-03-advanced\.mjs['"]/);
});

test('המודול הקנוני קיים, שלם וללא סימני מיזוג', () => {
  const canonical = path.join(pagesDir, 'unit-03-advanced.mjs');
  assert.ok(fs.existsSync(canonical));
  const source = fs.readFileSync(canonical, 'utf8');
  assert.doesNotMatch(source, /<<<<<<<|=======|>>>>>>>/);
  assert.match(source, /export default \[page39, page40, page41, page42, page43, page44, page45\]/);
});

test('אין קובצי וריאנט זמניים לצד המודולים הקנוניים', () => {
  const files = fs.readdirSync(pagesDir);
  const variants = files.filter(name =>
    /-(v\d+|new|final|old|copy|backup|tmp)\.mjs$/i.test(name));
  assert.deepEqual(variants, [], `קובצי וריאנט אסורים: ${variants.join(', ')}`);
});

test('כל מודול עמודים שנטען ב-index קיים בפועל, ואין מודול עמודים יתום', () => {
  const imported = [...indexSource.matchAll(/from ['"]\.\/([\w-]+\.mjs)['"]/g)].map(m => m[1]);
  for (const name of imported) {
    assert.ok(fs.existsSync(path.join(pagesDir, name)), `import שבור: ${name}`);
  }
  const unitModules = fs.readdirSync(pagesDir)
    .filter(name => name.startsWith('unit-0') && name.endsWith('.mjs'));
  const orphans = unitModules.filter(name => !imported.includes(name));
  assert.deepEqual(orphans, [], `מודול עמודים שאינו מחובר לרצף: ${orphans.join(', ')}`);
});
