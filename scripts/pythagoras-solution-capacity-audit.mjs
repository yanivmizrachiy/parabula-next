import fs from 'node:fs';
import path from 'node:path';
import { buildPythagorasWorkbook } from '../pythagoras-workbook-model.js';

const root = process.cwd();
const strict = process.argv.includes('--strict');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
const workbook = buildPythagorasWorkbook(meta);
const pages = workbook.pages.map((page) => ({
  number: page.sourceNumber,
  file: page.file || `עמוד-${page.sourceNumber}.html`,
}));

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

for (let i = 0; i < pages.length; i += 1) {
  const page = pages[i];
  const html = fs.readFileSync(path.join(root, page.file), 'utf8');
  const visible = strip(html);
  const solutionAreas = count(html, /class="[^"]*(?:full-solution-space|solution-space)[^"]*"/gu);
  const equationWorkAreas = count(html, /class="[^"]*equation-practice-card[^"]*"[\s\S]*?class="[^"]*work-lines[^"]*"/gu);
  const explicitLineCounts = [...html.matchAll(/data-required-lines="(\d+)"/gu)].map((m) => Number(m[1]));
  const finalAnswers = count(html, /class="[^"]*(?:student-final-answer|pyt-final-answer|problem-answer|final-answer|answer-box)[^"]*"/gu)
    + count(html, /aria-label="אפשרויות לתשובה הסופית"/gu);
  const fullCards = count(html, /class="[^"]*(?:full-solution-card|equation-practice-card|problem-block|pyt-sub-block|pyt-calc-block)[^"]*"/gu);
  const calcSignals = count(visible, /(?:חשבו|מצאו|פתרו|הציגו דרך|הראו את החישוב|אורך|שטח|היקף)/gu);
  const minDeclared = explicitLineCounts.length ? Math.min(...explicitLineCounts) : null;
  const measuredAreas = solutionAreas + equationWorkAreas;

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
}

console.log('\nPythagoras static solution-capacity inventory');
console.log('local | file | work | declared | min-lines | final | cards | calc-signals');
for (const row of rows) {
  if (row.workAreas || row.calcSignals) {
    console.log(`${String(row.local).padStart(2)} | ${row.file} | ${row.workAreas} | ${row.declared} | ${row.minDeclared ?? '-'} | ${row.finalAnswers} | ${row.fullCards} | ${row.calcSignals}`);
  }
}

if (issues.length) {
  console.error(`\nPYTHAGORAS_SOLUTION_METADATA_FAILED issues=${issues.length}`);
  for (const issue of issues) console.error(`- ${issue}`);
  if (strict) process.exit(1);
} else {
  console.log('\nPYTHAGORAS_SOLUTION_METADATA_OK — המבנה הסטטי תקין; קיבולת פיזית נאכפת בבדיקת Chromium.');
}
