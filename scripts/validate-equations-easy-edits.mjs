import fs from 'node:fs';

const failures = [];
function assert(ok, msg) { if (!ok) failures.push(msg); }

const page = fs.readFileSync('עמוד-95.html', 'utf8');
const css = fs.readFileSync('styles/topics/equations-edits.css', 'utf8');

assert(page.includes('styles/topics/equations-edits.css'), 'עמוד-95.html must link equations-edits.css');
assert(page.includes('equation-edit-page-95-x-plus-6'), 'עמוד-95.html must contain the page-95 equation edit overlay');
assert(page.includes('6 + x = 6.5'), 'עמוד-95.html must show corrected equation 6 + x = 6.5');
assert(css.includes('.equations-page .pdf-wrap'), 'equations-edits.css must anchor overlay inside pdf-wrap');
assert(css.includes('.equation-edit-layer'), 'equations-edits.css must define edit layer');
assert(css.includes('.equation-edit-page-95-x-plus-6'), 'equations-edits.css must define the page 95 correction position');
assert(!page.includes('style='), 'עמוד-95.html must not use inline style attributes for the edit');

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_EASY_EDITS_FAILED');
  for (const f of failures) console.error('- ' + f);
  process.exit(1);
}
console.log('VALIDATE_EQUATIONS_EASY_EDITS_OK');
console.log('corrected_equation=6 + x = 6.5');
