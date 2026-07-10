import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const write = (file, text) => fs.writeFileSync(file, text, 'utf8');

let rules = read('CLAUDE.md');

rules = rules.replace(
  /- `meta\/topics\.json` הוא מקור המטא-דאטה היחיד גם לנייח וגם לנייד\.[^\n]*\n/g,
  '- `meta/topics.json` הוא מקור המטא-דאטה היחיד גם לנייח וגם לנייד; mirror נוסף אסור.\n'
);

rules = rules.replace(
  /6\. מריצים `npm run topics:sync`\.[\s\S]*?9\. לא מסמנים השלמה אם הדף אינו מופיע ונגיש גם בנייד\.\n/g,
  '6. מריצים `npm run validate:meta` ו-`npm run validate:schema`; אין mirror נפרד למטא-דאטה.\n7. מריצים `npm test`, `npm run verify`, `npm run validate:access` ו-`npm run validate:mobile`.\n8. לכל דף חדש או שינוי פריסה מריצים גם `npm run validate:mobile:browser` ו-`npm run validate:mobile:all-pages`, או את שמונת ה-shards המקבילים ב-CI.\n9. בודקים בפועל נייח, קורא נייד, `פתח מלא` והדפסה.\n10. לא מסמנים השלמה אם הדף אינו מופיע, נגיש וללא חפיפות בכל משטחי הנייד.\n'
);

rules = rules
  .replace(/npm run topics:sync\n?/g, '')
  .replace(/npm run topics:check\n?/g, '')
  .replace(/- `npm run topics:check`[^\n]*\n/g, '')
  .replace('5. `preview/sw.js` הוא legacy כמעט ריק לצד `sw.js` הקנוני.\n', '');

if (!rules.includes('- `npm run validate:mobile:browser` — בדיקת Android production בסיסית על build אמיתי.')) {
  rules = rules.replace(
    '- `npm run validate:meta` — registry וסכמת metadata.\n',
    '- `npm run validate:meta` — registry וסכמת metadata.\n- `npm run validate:mobile:browser` — בדיקת Android production בסיסית על build אמיתי.\n- `npm run validate:mobile:all-pages` — סריקה גאומטרית מלאה של כל הדפים, בקורא וב-`פתח מלא`, בשלושה viewports.\n'
  );
}

if (!rules.includes('כל שמונת ה-shards של `scripts/validate-mobile-all-pages.mjs` עברו')) {
  rules = rules.replace(
    '- RTL ו-A4 נשמרים.\n',
    '- RTL ו-A4 נשמרים.\n- אין חפיפות פנימיות, clipping, ילדים מחוץ להורה, גלילה אופקית או נושא מוסתר באף viewport נתמך.\n- כל שמונת ה-shards של `scripts/validate-mobile-all-pages.mjs` עברו עבור כל הדפים הקנוניים.\n'
  );
}

if (rules.includes('topics:sync') || rules.includes('topics:check') || rules.includes('mobile-topics.json')) {
  throw new Error('obsolete mobile metadata architecture remains in CLAUDE.md');
}
write('CLAUDE.md', rules);

const agentFile = '.claude/agents/worksheet-designer.md';
let agent = read(agentFile);
agent = agent.replace(
  '6. Run `npm run topics:sync`, tests, metadata validation, and the relevant visual/print checks.\n7. Verify that the new page and its actions are visible and usable in both desktop and mobile interfaces.\n',
  '6. Run metadata/schema validation, tests, and the relevant visual/print checks; there is no metadata mirror or sync command.\n7. Run `npm run validate:mobile:browser` and `npm run validate:mobile:all-pages` for every new page or layout change.\n8. Verify the page in desktop, the mobile app reader, `Open Full`, and print.\n'
);
if (agent.includes('topics:sync') || agent.includes('topics:check')) {
  throw new Error('obsolete mobile metadata command remains in worksheet designer agent');
}
write(agentFile, agent);

let check = read('scripts/single-rules-source-check.mjs');
check = check.replace("    'validate:mobile:deep',\n", "    'validate:mobile:all-pages',\n");
if (!check.includes("'scripts/one-time-finalize-mobile-rules.mjs'")) {
  check = check.replace(
    "    'STATE/tmp-page16-visual-audit-trigger.txt'\n",
    "    'STATE/tmp-page16-visual-audit-trigger.txt',\n    'scripts/one-time-finalize-mobile-rules.mjs',\n    '.github/workflows/one-time-finalize-mobile-rules.yml',\n    'STATE/trigger-finalize-mobile-rules.tmp'\n"
  );
}
write('scripts/single-rules-source-check.mjs', check);

console.log('Finalized canonical mobile rules, worksheet agent, and permanent validation names.');
