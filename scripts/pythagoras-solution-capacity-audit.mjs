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
  const equationWorkAreas = count(html, /class="[^"]*equation-practice-card[^"]*"[\s\S]*?class="[^"]*work-lines[^"]*"/gu);
  const explicitLineCounts = [...html.matchAll(/data-required-lines="(\d+)"/gu)].map((m) => Number(m[1]));
  const finalAnswers = count(html, /class="[^"]*(?:student-final-answer|pyt-final-answer|problem-answer|final-answer)[^"]*"/gu);
  const fullCards = count(html, /class="[^"]*(?:full-solution-card|equation-practice-card|problem-block|pyt-sub-block|pyt-calc-block)[^"]*"/gu);
  const calcSignals = count(visible, /(?:חשבו|מצאו|פתרו|הציגו דרך|הראו את החישוב|אורך|שטח|היקף)/gu);
  const fullPythagorasSignals = /(?:משפט פיתגורס|משולש ישר|יתר|ניצב)/u.test(visible) && /(?:חשבו|מצאו|פתרו|דרך מלאה|החישוב)/u.test(visible);
  const minDeclared = explicitLineCounts.length ? Math.min(...explicitLineCounts) : null;
  const measuredAreas = workAreas + equationWorkAreas;

  rows.push({
    local: i + 1,
    file: page.file,
    workAreas: measuredAreas,
    declared: explicitLineCounts.length,
    minDeclared,
    finalAnswers,
    fullCards,
    calcSignals,
  });

  if (explicitLineCounts.some((n) => !Number.isInteger(n) || n <= 0)) {
    issues.push(`${page.file} (עמוד ${i + 1}): data-required-lines חייב להיות מספר שורות חיובי`);
  }

  // Static gate checks structural answer capacity. Actual pixel/line capacity is
  // enforced in Chromium by pythagoras-writing-capacity-browser-audit.mjs.
  if (fullPythagorasSignals && measuredAreas > 0 && finalAnswers < measuredAreas) {
    issues.push(`${page.file} (עמוד ${i + 1}): ${measuredAreas} אזורי דרך לעומת ${finalAnswers} תשובות סופיות`);
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
  console.log('\n[OK] מבנה קיבולת הפתרון תקין; גובה השורות נבדק בדפדפן.');
}
