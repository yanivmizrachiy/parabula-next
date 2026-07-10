import fs from 'node:fs';

const file = 'CLAUDE.md';
let text = fs.readFileSync(file, 'utf8');

function replaceOnce(from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  text = text.replace(from, to);
}

replaceOnce(
  '18. לאחר התקנה או פתיחה במצב standalone, כפתור ההתקנה חייב להיעלם ולא להיות מוצע שוב.\n',
  `18. לאחר התקנה או פתיחה במצב standalone, כפתור ההתקנה חייב להיעלם ולא להיות מוצע שוב.\n19. כל דף קנוני חייב לעבור בדיקת דפדפן חזותית וגאומטרית אמיתית בשתי התצוגות: בתוך קורא האפליקציה וב-\`פתח מלא\`.\n20. הבדיקה חייבת לרוץ על **כל הדפים**, לא על מדגם, ולפחות בגדלים: 360×800, 412×915 ו-915×412.\n21. הבדיקה חייבת לזהות אוטומטית: חפיפות, clipping, גלישה מחוץ לכרטיס או ל-A4, גלילה אופקית, רכיב רחב מההורה, טקסט חתוך, ניווט חסר, נושא מוסתר, נכס חסר, שגיאת JavaScript ו-MathJax שלא הושלם.\n22. ברכיבי נייד גמישים אסור להשתמש ברוחב קשיח שעלול להיות גדול מההורה. רכיב עם רוחב קבוע חייב לכלול הגבלת \`max-width: 100%\` ולהוכיח containment בבדיקת דפדפן.\n23. אסור לסמן דף כתקין רק משום שה-build, ה-HTML, הסכמה או בדיקות JavaScript עברו. בדיקה מבנית אינה תחליף לבדיקה חזותית.\n24. כל דף חדש שנוסף ל-\`meta/topics.json\` חייב להיכנס אוטומטית לסריקת כל-הדפים, בלי רשימה ידנית נוספת.\n25. כשל חזותי בדף יחיד הוא רגרסיה חוסמת PR ופריסה. אין לפרסם גרסה שבה אפילו דף אחד נכשל.\n26. בכל כשל יש להפיק JSON מפורט וצילום מסך אוטומטי של התצוגה שנכשלה.\n27. כאשר תקלה נובעת מסגנון משותף, מתקנים את שורש הבעיה בשכבה המשותפת ולא מוסיפים תיקון נקודתי לכל דף.\n28. דיווח משתמש על תקלה שחמקה מה-CI מחייב שני תיקונים: תיקון התקלה עצמה ותוספת בדיקה שמונעת את הישנותה בכל הדפים העתידיים.\n29. כדי לתמוך במאות ואלפי דפים, הסריקה חייבת להיות דטרמיניסטית, ניתנת לחלוקה ל-shards ומקבילית ב-CI.\n`,
  'insert mandatory visual geometry rules'
);

replaceOnce(
  '- `mobile-topics.json` — עותק ראי היסטורי שנדרש עדיין בחלק מבדיקות/פריסה; אינו מקור אמת ואסור לרנטיים להסתמך עליו במקום `meta/topics.json`.\n',
  '- `meta/topics.json` הוא מקור המטא-דאטה היחיד גם לנייח וגם לנייד. `mobile-topics.json` או כל mirror אחר אסורים.\n',
  'remove obsolete mobile metadata mirror'
);

replaceOnce(
  `- \`mobile-app.webmanifest\`\n- \`mobile-app-install.html\`\n- \`mobile-app-install.js\`\n- \`sw.js\`\n\n\`preview/phone.*\` הוא legacy/compat בלבד. תיקוני נייד חדשים נעשים קודם ב-\`mobile-app.*\`.\n`,
  `- \`mobile-app.webmanifest\`\n- \`sw.js\`\n- \`icon.svg\`\n\nדף התקנה נפרד, \`preview/phone.*\`, mirror של מטא-דאטה או runtime נייד נוסף אסורים. ההתקנה מתבצעת רק מתוך \`mobile-app.html\` באמצעות זרימת PWA אמיתית.\n`,
  'clean canonical mobile map'
);

text = text.replace('- `scripts/sync-mobile-topics.mjs`\n', '');

replaceOnce(
  '- `scripts/a4-visual-audit.mjs`\n',
  '- `scripts/a4-visual-audit.mjs`\n- `scripts/validate-mobile-all-pages.mjs` — שער גאומטרי מלא לכל הדפים, בקורא האפליקציה וב-`פתח מלא`, במספר viewports, עם sharding וצילומי כשל.\n',
  'register all-pages mobile validator'
);

fs.writeFileSync(file, text, 'utf8');
console.log('CLAUDE.md patched with mandatory all-pages visual geometry rules.');
