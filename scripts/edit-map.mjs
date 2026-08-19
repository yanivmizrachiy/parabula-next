#!/usr/bin/env node

const pageArg = process.argv[2]?.trim();
const page = /^\d+$/u.test(pageArg || '') ? pageArg : null;
const LIVE_BASE = 'https://yanivmizrachiy.github.io/razpages';

const rows = [
  ['כללים מחייבים', 'CLAUDE.md'],
  ['טקסט/שאלות של דף', page ? `עמוד-${page}.html` : 'עמוד-N.html'],
  ['חריג עיצוב של דף', page ? `styles/pages/עמוד-${page}.css` : 'styles/pages/עמוד-N.css'],
  ['חזקות ושורשים — עיצוב משותף', 'styles/topics/pythagoras-power-practice.css'],
  ['פיתגורס — יסודות משותפים', 'styles/topics/pythagoras-foundations.css'],
  ['A4 גלובלי', 'styles/a4-base.css'],
  ['סדר/רישום נושאים ודפים', 'meta/topics.json'],
  ['מודל החוברת המאוחדת', 'pythagoras-workbook-model.js'],
  ['פריסה ל-GitHub Pages', '.github/workflows/deploy-pages.yml'],
  ['סיווג בדיקות לפי שינוי', 'scripts/classify-ci-change-scope.mjs'],
];

console.log(page ? `\nמפת עריכה מהירה — עמוד ${page}\n` : '\nמפת עריכה מהירה\n');
const width = Math.max(...rows.map(([label]) => label.length));
for (const [label, file] of rows) {
  console.log(`${label.padEnd(width)}  →  ${file}`);
}

console.log('\nפקודות שימושיות');
console.log('npm run edit:map -- 639        # איפה עורכים עמוד מסוים');
console.log('npm run pythagoras:check       # בדיקת פיתגורס מהירה בלי סריקות כבדות');
console.log('npm run ci:all                 # בדיקת ריפו מלאה כשבאמת צריך');

console.log('\nקישורים חיים');
if (page) {
  console.log(`דף ${page}: ${LIVE_BASE}/עמוד-${page}.html`);
}
console.log(`חוברת פיתגורס: ${LIVE_BASE}/pythagoras-workbook.html`);
