import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const write = (file, text) => fs.writeFileSync(file, text, 'utf8');
const replaceOnce = (text, from, to, label) => {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return text.replace(from, to);
};

let rules = read('CLAUDE.md');
rules = replaceOnce(
  rules,
  '6. מריצים `npm run topics:sync`.\n7. מריצים `npm test`, `npm run verify`, `npm run validate:meta` ולפי היקף `npm run tech:max`.\n8. בודקים בפועל נייח, נייד והדפסה.\n9. לא מסמנים השלמה אם הדף אינו מופיע ונגיש גם בנייד.\n',
  '6. מריצים `npm run validate:meta` ו-`npm run validate:schema`; אין mirror נפרד למטא-דאטה.\n7. מריצים `npm test`, `npm run verify`, `npm run validate:access` ו-`npm run validate:mobile`.\n8. לכל דף חדש או שינוי פריסה מריצים גם `npm run validate:mobile:browser` ו-`npm run validate:mobile:all-pages`, או את שמונת ה-shards המקבילים ב-CI.\n9. בודקים בפועל נייח, קורא נייד, `פתח מלא` והדפסה.\n10. לא מסמנים השלמה אם הדף אינו מופיע, נגיש וללא חפיפות בכל משטחי הנייד.\n',
  'page workflow commands'
);
rules = rules.replace(
  'npm run topics:sync\nnpm run topics:check\n',
  'npm run validate:mobile:browser\nnpm run validate:mobile:all-pages\n'
);
rules = replaceOnce(
  rules,
  '- `npm run topics:check` — מונע divergence בין `meta/topics.json` לראי הישן.\n',
  '- `npm run validate:mobile:browser` — בדיקת Android production בסיסית על build אמיתי.\n- `npm run validate:mobile:all-pages` — סריקה גאומטרית מלאה של כל 98 הדפים, בקורא וב-`פתח מלא`, בשלושה viewports.\n',
  'command descriptions'
);
rules = replaceOnce(
  rules,
  '- RTL ו-A4 נשמרים.\n- הבדיקות הרלוונטיות עברו.\n',
  '- RTL ו-A4 נשמרים.\n- אין חפיפות פנימיות, clipping, ילדים מחוץ להורה, גלילה אופקית או נושא מוסתר באף viewport נתמך.\n- כל שמונת ה-shards של `scripts/validate-mobile-all-pages.mjs` עברו עבור כל הדפים הקנוניים.\n- הבדיקות הרלוונטיות עברו.\n',
  'completion criteria'
);
rules = rules.replace('5. `preview/sw.js` הוא legacy כמעט ריק לצד `sw.js` הקנוני.\n', '');
if (rules.includes('topics:sync') || rules.includes('topics:check')) throw new Error('obsolete topic mirror commands remain in CLAUDE.md');
write('CLAUDE.md', rules);

let check = read('scripts/single-rules-source-check.mjs');
check = check.replace("    'validate:mobile:deep',\n", "    'validate:mobile:all-pages',\n");
check = replaceOnce(
  check,
  "    'STATE/tmp-page16-visual-audit-trigger.txt'\n",
  "    'STATE/tmp-page16-visual-audit-trigger.txt',\n    'scripts/one-time-finalize-mobile-rules.mjs',\n    '.github/workflows/one-time-finalize-mobile-rules.yml',\n    'STATE/trigger-finalize-mobile-rules.tmp'\n",
  'temporary rules file protection'
);
write('scripts/single-rules-source-check.mjs', check);

console.log('Finalized canonical mobile rules and permanent validation names.');
