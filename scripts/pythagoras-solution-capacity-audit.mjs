import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const strict = process.argv.includes('--strict');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
const topic = meta.topics.find((item) => item.name === 'משפט פיתגורס');
if (!topic) throw new Error('הנושא משפט פיתגורס חסר');

const strip = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
  .replace(/<[^>]+>/gu, ' ')
  .replace(/&nbsp;|&#160;/gu, ' ')
  .replace(/\s+/gu, ' ')
  .trim();

const count = (text, re) => (text.match(re) ?? []).length;
const rows = [];
const issues = [];

for (let i = 0; i < topic.pages.length; i += 1) {
  const page = topic.pages[i];
  const html = fs.readFileSync(path.join(root, page.file), 'utf8');
  const visible = strip(html);
  const workAreas = count(html, /class="[^"]*(?:full-solution-space|solution-space)[^"]*"/gu);
  const explicitLineCounts = [...html.matchAll(/data-required-lines="(\d+)"/gu)].map((m) => Number(m[1]));
  const finalAnswers = count(html, /class="[^"]*(?:student-final-answer|pyt-final-answer|problem-answer|final-answer)[^"]*"/gu);
  const fullCards = count(html, /class="[^"]*(?:full-solution-card|equation-practice-card|problem-block|pyt-sub-block)[^"]*"/gu);
  const calcSignals = count(visible, /(?:חשבו|מצאו|פתרו|הציגו דרך|הראו את החישוב|אורך|שטח|היקף)/gu);
  const fullPythagorasSignals = /(?:משפט פיתגורס|משולש ישר|יתר|ניצב)/u.test(visible) && /(?:חשבו|מצאו|פתרו|דרך מלאה|החישוב)/u.test(visible);
  const minDeclared = explicitLineCounts.length ? Math.min(...explicitLineCounts) : null;

  rows.push({
    local: i + 1,
    file: page.file,
    workAreas,
    declared: explicitLineCounts.length,
    minDeclared,
    finalAnswers,
    fullCards,
    calcSignals,
  });

  if (workAreas > 0 && explicitLineCounts.length < workAreas) {
    issues.push(`${page.file} (עמוד ${i + 1}): ${workAreas} אזורי דרך, אך רק ${explicitLineCounts.length} מצהירים data-required-lines`);
  }
  if (fullPythagorasSignals && workAreas > 0 && finalAnswers < workAreas) {
    issues.push(`${page.file} (עמוד ${i + 1}): ${workAreas} אזורי דרך לעומת ${finalAnswers} תשובות סופיות`);
  }
  if (fullPythagorasSignals && workAreas > 4) {
    issues.push(`${page.file} (עמוד ${i + 1}): ${workAreas} אזורי דרך חישוביים — יותר מ־4 בעמוד A4`);
  }
  if (fullPythagorasSignals && explicitLineCounts.some((n) => n < 5)) {
    issues.push(`${page.file} (עמוד ${i + 1}): נמצא אזור דרך מלאה עם פחות מ־5 שורות מוצהרות`);
  }
}

console.log('\nPythagoras solution-capacity audit');
console.log('local | file | work | declared | min-lines | final | cards | calc-signals');
for (const r of rows) {
  if (r.workAreas || r.calcSignals) {
    console.log(`${String(r.local).padStart(2)} | ${r.file} | ${r.workAreas} | ${r.declared} | ${r.minDeclared ?? '-'} | ${r.finalAnswers} | ${r.fullCards} | ${r.calcSignals}`);
  }
}

if (issues.length) {
  console.log(`\n[ISSUES] ${issues.length}`);
  for (const issue of issues) console.log(`- ${issue}`);
  if (strict) process.exit(1);
} else {
  console.log('\n[OK] לא נמצאו חריגות קיבולת לפי החוזה הנוכחי.');
}
