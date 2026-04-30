import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const printJs = read('preview/print.js');
const printCss = read('preview/print.css');
const topicsJs = read('preview/topics.js');
const equationsCss = read('preview/equations.css');
const equationsJs = read('preview/equations.js');

assert(printJs.includes("const EQUATIONS_TOPIC = 'משוואות';"), 'print.js must define the exact equations topic.');
assert(printJs.includes('const isEquationsPrintMode = requestedTopic === EQUATIONS_TOPIC;'), 'print.js must enable A4 fit only by exact equations topic.');
assert(printJs.includes("document.body.classList.add('equations-print-mode')"), 'print.js must add equations-print-mode only for equations.');
assert(/function fitA4FramesToViewport\(\) \{\s*if \(!isEquationsPrintMode\) return;/s.test(printJs), 'fitA4FramesToViewport must return immediately outside equations mode.');
assert(!/document\.body\.classList\.add\('equations-print-mode'\)[\s\S]*else/s.test(printJs), 'equations-print-mode must not be applied as a general fallback.');

assert(printCss.includes('body.equations-print-mode .print-view'), 'print.css must scope print-view A4 fit to equations-print-mode.');
assert(printCss.includes('body.equations-print-mode .sheet-frame'), 'print.css must scope sheet-frame A4 fit to equations-print-mode.');
assert(printCss.includes('body.equations-print-mode .sheet-frame iframe'), 'print.css must scope iframe scaling to equations-print-mode.');
assert(!/^\.print-view\s*\{[\s\S]*?overflow-x:\s*hidden;/m.test(printCss), 'default .print-view must not globally force horizontal hiding for all topics.');
assert(!/^\.sheet-frame\s*\{[\s\S]*?width:\s*var\(--print-a4-width/m.test(printCss), 'default .sheet-frame must not globally use equations A4 fit width.');
assert(!/^\.sheet-frame iframe\s*\{[\s\S]*?transform:\s*scale\(var\(--print-a4-scale/m.test(printCss), 'default print iframe must not globally use equations scaling.');

assert(topicsJs.includes("const EQUATIONS_TOPIC = 'משוואות';"), 'topics.js must expose only the exact equations topic special route.');
assert(topicsJs.includes("const EQUATIONS_APP_URL = './equations.html';"), 'topics.js must point equations special action to equations.html.');
assert(topicsJs.includes('EQUATIONS_PRINT_URL'), 'topics.js must expose the dedicated equations print URL.');
assert(!topicsJs.includes('משוואות ריבועיות') || topicsJs.includes('EQUATIONS_TOPIC = \'משוואות\''), 'topics.js must not treat quadratic equations as the dedicated equations route.');

assert(equationsCss.includes('--eq-a4-scale'), 'equations.css must define equations-only A4 scale variables.');
assert(equationsJs.includes('fitEquationA4ToViewport'), 'equations.js must scale the equations reader only inside equations app.');
assert(equationsJs.includes("const TARGET_TOPIC = 'משוואות';"), 'equations.js must target exact equations topic.');
assert(equationsJs.includes("const EXCLUDED_TOPIC = 'משוואות ריבועיות';"), 'equations.js must explicitly exclude quadratic equations.');

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_PRINT_SCOPE_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_PRINT_SCOPE_OK');
console.log('scope=משוואות only');
console.log('quadratic_equations_touched=0');
