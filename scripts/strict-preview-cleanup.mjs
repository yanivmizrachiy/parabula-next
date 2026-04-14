import fs from 'node:fs';
const fix = (p, fn) => {
  if (!fs.existsSync(p)) return false;
  const a = fs.readFileSync(p, 'utf8');
  const b = fn(a);
  if (a !== b) fs.writeFileSync(p, b, 'utf8');
  return a !== b;
};
const changed = [];
changed.push(fix('preview/app.html', s => {
  let o = s.replace(/\n?\s*<style>[\s\S]*?<\/style>\s*/m, '\n');
  if (!o.includes('./app-hub.css')) o = o.replace('./mobile.css" />', './mobile.css" />\n  <link rel="stylesheet" href="./app-hub.css" />');
  return o;
}));
changed.push(fix('preview/README.md', s => s.replace(/^\- `print-center\.js`\n?/m, '').replace('קיימת כרגע כפילות תפקודית בין `print.js` לבין `print-center.js`; אין להתעלם מכך.','`print.js` הוא קובץ ההדפסה הקנוני הפעיל בשכבת ההדפסה.')));
changed.push(fix('preview/APP_CONTRACT.md', s => s.replace(/\n- `print\.js` ו-`print-center\.js` מתעדים\/מממשים את אותו אזור פונקציונלי ויש לטפל בזה בהמשך\.\n/, '\n- `print.js` הוא קובץ ההדפסה הקנוני הפעיל.\n')));
changed.push(fix('PROJECT_RULES.md', s => s.includes('## 7) Shared cleanup permission (design only)') ? s : s + '\n\n---\n\n## 7) Shared cleanup permission (design only)\n\n- Design-only shared cleanup is allowed for a page family such as equations when no learning content is changed.\n- The no-inline-style rule applies to preview utility pages as well.\n- Mobile entry files under preview are an official part of the live system.\n'));
console.log(JSON.stringify({ changed: changed.some(Boolean) }));
