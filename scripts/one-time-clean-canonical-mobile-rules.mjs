import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'CLAUDE.md');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  '1. מריצים `npm run topics:sync`.\n2. מריצים `npm run topics:check`.\n3. מריצים בדיקות מלאות.\n4. מאמתים שמספרי הנושאים והדפים זהים בנייח ובנייד.\n',
  '1. מריצים `npm run validate:meta`.\n2. מריצים `npm run validate:schema`.\n3. מריצים `npm run validate:mobile`, `npm run validate:mobile:browser` ו-`npm run validate:mobile:deep` לפי היקף השינוי.\n4. מאמתים שמספרי הנושאים והדפים זהים בנייח ובנייד ושכל shards עברו.\n'
);

text = text.replace(
  'npm run topics:sync\nnpm run topics:check\n',
  'npm run validate:mobile:browser\nnpm run validate:mobile:deep\n'
);

text = text.replace(
  '- `npm run topics:check` — מונע divergence בין `meta/topics.json` לראי הישן.\n',
  '- `npm run validate:mobile:browser` — בדיקת Android production בסיסית על build אמיתי.\n- `npm run validate:mobile:deep` — סריקה מלאה של כל הדפים, בשתי תצוגות ובשלושה viewports, כולל חפיפות, clipping וצילומי כשל.\n'
);

if (!text.includes('### 6.1 CSS רספונסיבי ורכיבים פנימיים')) {
  const anchor = '- אין ליצור CSS ייעודי בתוך תיקיית דף נושא אם קיים stylesheet קנוני לנושא.\n';
  if (!text.includes(anchor)) throw new Error('Could not find CSS rules anchor in CLAUDE.md');
  text = text.replace(
    anchor,
    `${anchor}\n### 6.1 CSS רספונסיבי ורכיבים פנימיים\n\n- כל ילד של flex/grid שמכיל תוכן משתנה מקבל \`min-width: 0\` כאשר אחרת הוא עלול להרחיב את ההורה.\n- רוחב קשיח כגון \`width: 140px\` מותר רק אם הוכח שהוא נכנס בכל viewports הנתמכים; אחרת משתמשים ברוחב גמיש וב-\`max-width: 100%\`.\n- שורת תשובה עם label ותיבה נבנית ב-grid/flex גמיש, למשל \`grid-template-columns: max-content minmax(0, 1fr)\`.\n- אין להשתמש ב-\`overflow: hidden\` כדי להסתיר חפיפה, clipping או רכיב רחב מדי.\n- שינוי ב-stylesheet משותף לנושא מחייב סריקה מלאה של כל דפי הנושא ואת שער הנייד העמוק לכל הדפים.\n`
  );
}

text = text.replace(
  '- RTL ו-A4 נשמרים.\n- הבדיקות הרלוונטיות עברו.\n',
  '- RTL ו-A4 נשמרים.\n- אין חפיפות פנימיות, clipping, ילדים מחוץ להורה, גלילה אופקית או נושא מוסתר באף viewport נתמך.\n- כל shards של `scripts/validate-mobile-all-pages.mjs` עברו עבור כל הדפים הקנוניים.\n- הבדיקות הרלוונטיות עברו.\n'
);

const obsoleteTerms = [
  'npm run topics:sync',
  'npm run topics:check',
  'mobile-topics.json',
  'mobile-app-install.html',
  'preview/phone.html'
];
text = text
  .split('\n')
  .filter(line => !obsoleteTerms.some(term => line.includes(term)))
  .join('\n');

for (const term of obsoleteTerms) {
  if (text.includes(term)) throw new Error(`Obsolete mobile architecture reference remains: ${term}`);
}
for (const required of [
  'scripts/validate-mobile-all-pages.mjs',
  'validate:mobile:deep',
  '### 6.1 CSS רספונסיבי ורכיבים פנימיים',
  '360×800',
  '412×915',
  '915×412'
]) {
  if (!text.includes(required)) throw new Error(`Required mobile quality rule missing: ${required}`);
}

fs.writeFileSync(file, `${text.trimEnd()}\n`, 'utf8');
console.log('CLAUDE.md mobile quality rules cleaned and strengthened.');
