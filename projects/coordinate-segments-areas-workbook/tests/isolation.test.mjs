// שומר מפני החזרת הבנייה לקובץ שנפגע מכתיבות מקבילות.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexSource = fs.readFileSync(path.join(root, 'src', 'pages', 'index.mjs'), 'utf8');

test('רצף העמודים משתמש במודול המתקדם המבודד', () => {
  assert.match(indexSource, /unit-03-advanced-v2\.mjs/);
  assert.doesNotMatch(indexSource, /from ['"]\.\/unit-03-advanced\.mjs['"]/);
});

test('המודול המבודד קיים ואינו מכיל סימני מיזוג', () => {
  const cleanPath = path.join(root, 'src', 'pages', 'unit-03-advanced-v2.mjs');
  assert.ok(fs.existsSync(cleanPath));
  const source = fs.readFileSync(cleanPath, 'utf8');
  assert.doesNotMatch(source, /<<<<<<<|=======|>>>>>>>/);
  assert.match(source, /export default \[page39, page40, page41, page42, page43, page44, page45\]/);
});
