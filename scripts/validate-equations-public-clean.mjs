import fs from 'node:fs';

const failures = [];
const fail = (msg) => failures.push(msg);
const assert = (ok, msg) => { if (!ok) fail(msg); };

const publicFiles = [
  'עמוד-95.html',
  'preview/equations.js'
];

for (const file of publicFiles) {
  const s = fs.readFileSync(file, 'utf8');

  assert(!s.includes('גרסה עריכה'), `${file} must not expose prototype/editing labels to public worksheet users.`);
  assert(!s.includes('טרם הומר לעריכה'), `${file} must not expose conversion status labels to public worksheet users.`);
  assert(!s.includes('תיקון עריך:'), `${file} must not expose system correction panel labels.`);
  assert(!s.includes('מקור חי'), `${file} must not expose internal source-system labels.`);
}

const page = fs.readFileSync('עמוד-95.html', 'utf8');
assert(page.includes('6 + x = 6.5'), 'Page 1 must still contain the requested visible correction.');
assert(page.includes('styles/topics/equations-edits.css'), 'Page 1 must keep temporary corrections CSS linked.');
assert(!page.includes('עמוד-95-editable.html'), 'Public page 1 must not link to the bad editable prototype.');

const css = fs.readFileSync('styles/pages/עמוד-95.css', 'utf8');
assert(css.includes('object-fit: contain'), 'Page 1 CSS must keep object-fit: contain to avoid left-side clipping.');
assert(!css.includes('object-fit: cover'), 'Page 1 CSS must not use object-fit: cover.');

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_PUBLIC_CLEAN_FAILED');
  for (const f of failures) console.error('- ' + f);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_PUBLIC_CLEAN_OK');
console.log('public_page=worksheet_only_no_system_clutter');
console.log('known_correction=6 + x = 6.5');
