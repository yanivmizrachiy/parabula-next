import fs from 'node:fs';

const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };

const mainPage = fs.readFileSync('עמוד-95.html', 'utf8');
const editablePage = fs.readFileSync('עמוד-95-editable.html', 'utf8');
const editableCss = fs.readFileSync('styles/pages/עמוד-95-editable.css', 'utf8');

assert(mainPage.includes('עמוד-95-editable.html'), 'Main page must link to editable version.');
assert(editablePage.includes('main class="a4-page page-95-editable equations-page editable-equations-page"'), 'Editable page must keep A4 wrapper.');
assert(editablePage.includes('styles/a4-base.css'), 'Editable page must use a4-base.css.');
assert(editablePage.includes('styles/topics/equations.css'), 'Editable page must use equations.css.');
assert(editablePage.includes('styles/pages/עמוד-95-editable.css'), 'Editable page must use dedicated CSS.');
assert(editablePage.includes('\\(6 + x = 6.5\\)'), 'Editable page must contain live MathJax corrected equation.');
assert(!editablePage.includes('<style'), 'Editable page must not contain inline style blocks.');
assert(!editablePage.includes('style='), 'Editable page must not contain style attributes.');
assert(!editablePage.includes('<img class="pdf-page"'), 'Editable page must not use the closed SVG as its main visible worksheet source.');
assert(editableCss.includes('.page-95-editable .equation-line'), 'Editable CSS must style the live equation line.');
assert(editableCss.includes("font-family:'Rubik'"), 'Editable CSS must use Rubik project font for the live equation area.');

if (failures.length) {
  console.error('VALIDATE_PAGE_95_EDITABLE_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDATE_PAGE_95_EDITABLE_OK');
console.log('editable_page=עמוד-95-editable.html');
console.log('live_mathjax=6 + x = 6.5');
console.log('closed_svg_main_source=false');
