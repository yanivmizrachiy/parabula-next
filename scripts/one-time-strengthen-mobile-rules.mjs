import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text, 'utf8');

function replaceOnce(text, from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(from, to);
}

let rules = read('CLAUDE.md');

if (!rules.includes('בדיקת חפיפות פנימיות בין רכיבים')) {
  rules = replaceOnce(
    rules,
    '18. לאחר התקנה או פתיחה במצב standalone, כפתור ההתקנה חייב להיעלם ולא להיות מוצע שוב.\n',
    `18. לאחר התקנה או פתיחה במצב standalone, כפתור ההתקנה חייב להיעלם ולא להיות מוצע שוב.\n19. בדיקת נייד מחייבת חייבת לעבור על **כל דף קנוני** שמופיע ב-\`meta/topics.json\`; אין להסתפק בדף מדגם.\n20. כל דף נבדק בשני משטחים נפרדים: בתוך קורא האפליקציה ובחלון \`פתח מלא\`. הצלחה במשטח אחד אינה מוכיחה הצלחה בשני.\n21. כל דף נבדק לפחות בשלושה viewports: Android קטן portrait בגודל 360×800, מכשיר היעד portrait בגודל 412×915, ו-landscape בגודל 915×412.\n22. בדיקת נייד חייבת להמתין לטעינת גופנים ולסיום MathJax לפני מדידה חזותית.\n23. בדיקת חפיפות פנימיות בין רכיבים היא חובה: משוואה, אזור פתרון, שורת תשובה ותיבת תשובה אינם רשאים לדרוס זה את זה.\n24. כל ילד חזותי חייב להישאר בתוך ההורה שלו ובתוך גבולות A4; חריגה של ילד מכרטיס, משורת תשובה או מהעמוד היא רגרסיה חוסמת.\n25. אסור שטקסט, MathJax, כפתור, topic-link או answer-box יהיו חתוכים, מוסתרים או בעלי scrollWidth/scrollHeight גדול מהשטח הנראה בלי סיבה מכוונת ומתועדת.\n26. אסור להשתמש ברוחב קשיח לרכיב פנימי כאשר הוא עלול להיות רחב מההורה בנייד. בתוך flex/grid משתמשים לפי הצורך ב-\`min-width: 0\`, \`minmax(0, 1fr)\`, \`max-width: 100%\` ורוחב גמיש.\n27. \`overflow: hidden\` אינו תיקון לחפיפה או clipping. הוא מותר רק כאשר החיתוך הוא חלק מכוון ממנוע הקורא, ולא כדי להסתיר באג בפריסת דף.\n28. כל שמונת הנושאים וכל פעולות הניווט חייבים להיות גלויים ונגישים גם ב-\`פתח מלא\`; אין להסתמך על פס אופקי מוסתר.\n29. כשל חזותי חייב להפיק דו\"ח גאומטרי וצילום מסך של המשטח שנכשל, כדי לתקן את המקור ולא לנחש.\n30. שער ה-production הקנוני הוא \`scripts/validate-mobile-all-pages.mjs\`, המורץ ב-CI ב-sharding מקביל. כל shard חייב לעבור לפני פריסה.\n31. דף חדש שנוסף ל-\`meta/topics.json\` נכלל אוטומטית בסריקה המלאה; אסור לנהל רשימת דפים ידנית נפרדת לבדיקה.\n32. אסור להחליש tolerance, להשמיט viewport, לדלג על דף או למחוק בדיקת חפיפה כדי להפוך CI לירוק. מתקנים את ה-CSS/HTML/runtime שיצרו את הכשל.\n`,
    'mobile iron rules'
  );
}

if (!rules.includes('### 6.1 CSS רספונסיבי ורכיבים פנימיים')) {
  rules = replaceOnce(
    rules,
    '- אין ליצור CSS ייעודי בתוך תיקיית דף נושא אם קיים stylesheet קנוני לנושא.\n',
    `- אין ליצור CSS ייעודי בתוך תיקיית דף נושא אם קיים stylesheet קנוני לנושא.\n\n### 6.1 CSS רספונסיבי ורכיבים פנימיים\n\n- כל ילד של flex/grid שמכיל תוכן משתנה מקבל \`min-width: 0\` כאשר אחרת הוא עלול להרחיב את ההורה.\n- רוחב קבוע כגון \`width: 140px\` מותר רק אם הוכח שהוא נכנס בכל viewports הנתמכים; אחרת משתמשים ברוחב גמיש וב-\`max-width: 100%\`.\n- שורת תשובה עם label ותיבה נבנית ב-grid/flex גמיש, לדוגמה \`grid-template-columns: max-content minmax(0, 1fr)\`.\n- אין להסתמך על גלילה אופקית, clipping או overflow כדי להסתיר רכיב רחב מדי.\n- שינוי ב-stylesheet משותף לנושא מחייב סריקה מלאה של כל דפי אותו נושא וגם את שער הנייד המלא לכל הדפים.\n`,
    'responsive CSS rules'
  );
}

rules = rules.replace(
  '6. מריצים `npm run topics:sync`.\n7. מריצים `npm test`, `npm run verify`, `npm run validate:meta` ולפי היקף `npm run tech:max`.\n8. בודקים בפועל נייח, נייד והדפסה.\n9. לא מסמנים השלמה אם הדף אינו מופיע ונגיש גם בנייד.\n',
  '6. מריצים `npm run validate:meta` ו-`npm run validate:schema`; אין mirror נפרד למטא-דאטה.\n7. מריצים `npm test`, `npm run verify`, `npm run validate:access` ו-`npm run validate:mobile`.\n8. לכל דף חדש או שינוי פריסה מריצים גם `npm run validate:mobile:browser` ו-`npm run validate:mobile:deep` או את שמונת ה-shards המקבילים ב-CI.\n9. בודקים בפועל נייח, קורא נייד, `פתח מלא` והדפסה.\n10. לא מסמנים השלמה אם הדף אינו מופיע, נגיש וללא חפיפות בכל משטחי הנייד.\n'
);

rules = rules.replace('npm run topics:sync\nnpm run topics:check\n', 'npm run validate:mobile:browser\nnpm run validate:mobile:deep\n');
rules = rules.replace(
  '- `npm run topics:check` — מונע divergence בין `meta/topics.json` לראי הישן.\n',
  '- `npm run validate:mobile:browser` — בדיקת Android production בסיסית על build אמיתי.\n- `npm run validate:mobile:deep` — סריקה מלאה של כל הדפים, בשני משטחי הנייד ובשלושה viewports, כולל חפיפות, clipping וצילומי כשל.\n'
);
rules = rules.replace(
  '- הבדיקות הרלוונטיות עברו.\n',
  '- אין חפיפות פנימיות, clipping, ילדים מחוץ להורה, גלילה אופקית או נושא מוסתר באף viewport נתמך.\n- כל shards של `scripts/validate-mobile-all-pages.mjs` עברו עבור כל הדפים הקנוניים.\n- הבדיקות הרלוונטיות עברו.\n'
);

if (rules.includes('npm run topics:sync') || rules.includes('npm run topics:check')) {
  throw new Error('CLAUDE.md still contains obsolete metadata mirror commands');
}
write('CLAUDE.md', rules);

let check = read('scripts/single-rules-source-check.mjs');
check = replaceOnce(
  check,
  "    'scripts/single-rules-source-check.mjs'\n",
  "    'scripts/single-rules-source-check.mjs',\n    'בדיקת חפיפות פנימיות בין רכיבים',\n    'scripts/validate-mobile-all-pages.mjs',\n    'validate:mobile:deep',\n    'רוחב קשיח'\n",
  'required quality phrases'
);
check = replaceOnce(
  check,
  "  for (const phrase of requiredPhrases) {\n    if (!text.includes(phrase)) errors.push(`${canonical} missing required phrase: ${phrase}`);\n  }\n",
  "  for (const phrase of requiredPhrases) {\n    if (!text.includes(phrase)) errors.push(`${canonical} missing required phrase: ${phrase}`);\n  }\n  for (const obsolete of ['npm run topics:sync', 'npm run topics:check', 'mobile-topics.json', 'mobile-app-install.html', 'preview/phone.html']) {\n    if (text.includes(obsolete)) errors.push(`${canonical} still contains obsolete mobile architecture reference: ${obsolete}`);\n  }\n",
  'obsolete rules protection'
);
write('scripts/single-rules-source-check.mjs', check);

console.log('Strengthened CLAUDE.md mobile quality rules and permanent rules validation.');
