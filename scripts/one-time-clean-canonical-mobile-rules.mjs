import fs from 'node:fs';

const file = 'CLAUDE.md';
let text = fs.readFileSync(file, 'utf8');

text = text.replaceAll('validate:mobile:all-pages', 'validate:mobile:deep');

text = text.replace(
  /`meta\/topics\.json` הוא מקור האמת היחיד למבנה התוכן\. לאחר שינויו:\n\n(?:\d+\. .*\n){4}/,
  '`meta/topics.json` הוא מקור האמת היחיד למבנה התוכן. לאחר שינויו:\n\n' +
  '1. מריצים `npm run validate:meta`.\n' +
  '2. מריצים `npm run validate:schema`.\n' +
  '3. מריצים `npm run validate:mobile`, `npm run validate:mobile:browser` ו-`npm run validate:mobile:deep` לפי היקף השינוי.\n' +
  '4. מאמתים שמספרי הנושאים והדפים זהים בנייח ובנייד ושכל shards עברו.\n'
);

text = text
  .split('\n')
  .filter(line => !line.includes('npm run topics:sync') && !line.includes('npm run topics:check'))
  .join('\n');

if (!text.includes('### 6.1 CSS רספונסיבי ורכיבים פנימיים')) {
  const marker = '\n---\n\n## 7. RTL, MathJax וכתיבה מתמטית';
  const section = [
    '',
    '### 6.1 CSS רספונסיבי ורכיבים פנימיים',
    '',
    '- כל ילד של flex/grid שמכיל תוכן משתנה מקבל `min-width: 0` כאשר אחרת הוא עלול להרחיב את ההורה.',
    '- רוחב קשיח כגון `width: 140px` מותר רק אם הוכח שהוא נכנס בכל viewports הנתמכים; אחרת משתמשים ברוחב גמיש וב-`max-width: 100%`.',
    '- שורת תשובה עם label ותיבה נבנית ב-grid/flex גמיש, למשל `grid-template-columns: max-content minmax(0, 1fr)`.',
    '- אין להשתמש ב-`overflow: hidden` כדי להסתיר חפיפה, clipping או רכיב רחב מדי.',
    '- שינוי ב-stylesheet משותף לנושא מחייב סריקה מלאה של כל דפי הנושא ואת שער הנייד העמוק לכל הדפים.',
    ''
  ].join('\n');
  if (!text.includes(marker)) throw new Error('Missing section 7 marker in CLAUDE.md');
  text = text.replace(marker, `${section}${marker}`);
}

if (!text.includes('scripts/validate-mobile-all-pages.mjs')) {
  const marker = '29. כדי לתמוך במאות ואלפי דפים, הסריקה חייבת להיות דטרמיניסטית, ניתנת לחלוקה ל-shards ומקבילית ב-CI.\n';
  if (!text.includes(marker)) throw new Error('Missing mobile scalability rule anchor in CLAUDE.md');
  text = text.replace(
    marker,
    `${marker}30. שער הסריקה הקנוני הוא \`scripts/validate-mobile-all-pages.mjs\`, והוא נחשף בפקודה \`npm run validate:mobile:deep\`.\n`
  );
}

if (!text.includes('npm run validate:mobile:deep')) {
  text = text.replace('npm run validate:mobile\n', 'npm run validate:mobile\nnpm run validate:mobile:browser\nnpm run validate:mobile:deep\n');
}

if (!text.includes('- `npm run validate:mobile:deep` —')) {
  text = text.replace(
    '- `npm run validate:meta` — registry וסכמת metadata.\n',
    '- `npm run validate:meta` — registry וסכמת metadata.\n' +
    '- `npm run validate:mobile:browser` — בדיקת Android production בסיסית על build אמיתי.\n' +
    '- `npm run validate:mobile:deep` — סריקה מלאה של כל הדפים, בשתי תצוגות ובשלושה viewports, כולל חפיפות, clipping וצילומי כשל.\n'
  );
}

if (!text.includes('כל shards של `scripts/validate-mobile-all-pages.mjs` עברו')) {
  text = text.replace(
    '- RTL ו-A4 נשמרים.\n- הבדיקות הרלוונטיות עברו.\n',
    '- RTL ו-A4 נשמרים.\n' +
    '- אין חפיפות פנימיות, clipping, ילדים מחוץ להורה, גלילה אופקית או נושא מוסתר באף viewport נתמך.\n' +
    '- כל shards של `scripts/validate-mobile-all-pages.mjs` עברו עבור כל הדפים הקנוניים.\n' +
    '- הבדיקות הרלוונטיות עברו.\n'
  );
}

const obsolete = [
  'npm run topics:sync',
  'npm run topics:check',
  'validate:mobile:all-pages',
  'mobile-topics.json',
  'mobile-app-install.html',
  'preview/phone.html'
];
for (const term of obsolete) {
  if (text.includes(term)) throw new Error(`Obsolete reference remains in CLAUDE.md: ${term}`);
}

const required = [
  'scripts/validate-mobile-all-pages.mjs',
  'validate:mobile:deep',
  '### 6.1 CSS רספונסיבי ורכיבים פנימיים',
  '360×800',
  '412×915',
  '915×412',
  'פתח מלא',
  'רוחב קשיח'
];
for (const term of required) {
  if (!text.includes(term)) throw new Error(`Required canonical rule missing: ${term}`);
}

if (/\n1\. מריצים ``\.\n2\. מריצים ``\./.test(text)) {
  throw new Error('Empty metadata commands remain in CLAUDE.md');
}

fs.writeFileSync(file, `${text.trimEnd()}\n`, 'utf8');
console.log('CLAUDE.md cleaned and strengthened successfully.');
