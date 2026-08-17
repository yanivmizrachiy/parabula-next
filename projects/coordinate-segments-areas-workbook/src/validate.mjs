// ולידטור אמיתי של החוברת: מצליב את המקור, ה-dist, ה-audit, ה-metadata
// וה-STATUS, ונכשל על כל סתירה. אין הצלחה מלאכותית: כל בדיקה מודדת בפועל.
//
// מדיניות סף:
// - ספירות (עמודים, רשומות, משימות, סרטוטים) — שוויון מדויק, בלתי תלוי פלטפורמה.
// - מדדי גובה תלויי-גופן (אחוזי ניצול) — סבילות ±1.5 בין metadata (שמקורו
//   ב-CI/Linux) לבין מדידה מקומית; גלישות (overflows) — אפס, ללא סבילות.
// - קובץ המקור: היעדרו אינו כשל (מצב מתועד), אך מודפסת אזהרה חד-משמעית
//   ו-STATUS חייב להצהיר שהשאלות אינן משולבות.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import pages from './pages/index.mjs';
import { answers, glossary } from './all-answers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const ok = [];

const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

function check(condition, message, detail = '') {
  if (condition) ok.push(message);
  else errors.push(`${message}${detail ? ` — ${detail}` : ''}`);
}

// ---------- 1. קובצי הליבה קיימים ----------
for (const required of [
  'dist/index.html', 'dist/teacher-key.html', 'dist/workbook.css',
  'downloads/coordinate-segments-areas-workbook.pdf',
  'audit/generated-audit.json', 'SHA256SUMS.txt',
  'project-metadata.json', 'STATUS.md', 'README.md'
]) {
  check(exists(required), `קיים: ${required}`, 'הקובץ חסר — יש להריץ npm run build');
}
if (errors.length) {
  console.error('ולידציה נכשלה עוד לפני ההצלבות:\n' + errors.map(e => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}

const audit = JSON.parse(read('audit/generated-audit.json'));
const meta = JSON.parse(read('project-metadata.json'));
const status = read('STATUS.md');
const html = read('dist/index.html');

// ---------- 2. המקור מול ה-dist ----------
const htmlPageCount = (html.match(/<section class="a4-page/g) || []).length;
check(htmlPageCount === pages.length, `דפי HTML ב-dist (${htmlPageCount}) = דפי המקור (${pages.length})`);

// ---------- 3. audit מול המקור ----------
check(audit.htmlPages === pages.length, `audit.htmlPages (${audit.htmlPages}) = דפי המקור (${pages.length})`);
check(audit.answerRecords === answers.length, `audit.answerRecords (${audit.answerRecords}) = רשומות בפועל (${answers.length})`);
check(audit.glossaryTerms === glossary.length, `audit.glossaryTerms = ${glossary.length}`);
check(Array.isArray(audit.utilization) && audit.utilization.length === pages.length,
  'audit.utilization מכסה את כל העמודים');
check(Array.isArray(audit.answerPages) && audit.answerPages.length === pages.length,
  `כיסוי תשובות מלא (${audit.answerPages?.length}/${pages.length})`);
check((audit.skipped || []).length === 0, 'skipped ריק — אף שלב בנייה לא דולג', JSON.stringify(audit.skipped));

// ---------- 4. PDF ----------
let pdfPages = audit.pdfPages;
try {
  const info = execFileSync('pdfinfo', [path.join(root, 'downloads', 'coordinate-segments-areas-workbook.pdf')], { encoding: 'utf8' });
  pdfPages = Number((info.match(/^Pages:\s+(\d+)/m) || [])[1]);
  ok.push('pdfinfo נמדד ישירות');
} catch {
  warnings.push('pdfinfo אינו זמין במכונה זו — מספר דפי ה-PDF נלקח מה-audit של הבנייה');
}
check(pdfPages === pages.length, `דפי PDF (${pdfPages}) = דפי HTML (${pages.length})`);

// ---------- 5. גלישות וניצול — אפס סבילות לגלישה ----------
const overflowing = audit.utilization.filter(u => u.overflows);
check(overflowing.length === 0, 'אפס עמודים בגלישה',
  `עמודים בגלישה: ${overflowing.map(u => `${u.page} (${u.percent}%)`).join(', ')}`);
const percents = audit.utilization.map(u => u.percent);
const minUtil = Math.min(...percents);
const maxUtil = Math.max(...percents);
check(minUtil >= 80, `ניצול מזערי ${minUtil}% ≥ 80%`);
check(maxUtil <= 100, `ניצול מרבי ${maxUtil}% ≤ 100%`);

// ---------- 6. metadata מול audit — ספירות מדויקות ----------
const exact = [
  ['builtPages', audit.htmlPages],
  ['pdfPages', pdfPages],
  ['verifiedAnswerRecords', audit.answerRecords],
  ['verifiedTasks', audit.dom?.tasks],
  ['verifiedAnswerSlots', audit.dom?.answerSlots],
  ['verifiedCoordinateDiagrams', audit.dom?.grids],
  ['verifiedAnswerPages', audit.answerPages.length],
  ['glossaryTerms', glossary.length],
  ['pageOverflows', overflowing.length],
  ['skippedBuildStages', (audit.skipped || []).length],
  ['verifiedKiteAnswerRecords', answers.filter(r => r.kind === 'kite').length],
  ['verifiedRectilinearAnswerRecords', answers.filter(r => r.kind === 'rectilinear').length],
  ['verifiedRightTriangleAnswerRecords', answers.filter(r => r.kind === 'triangle').length],
  ['verifiedTriangleAreaAnswerRecords', answers.filter(r => r.kind === 'triangleArea').length],
  ['verifiedTriangleAnswerRecords', answers.filter(r => r.kind === 'triangle').length + answers.filter(r => r.kind === 'triangleArea').length],
  ['verifiedPointTriangleAnswerRecords', answers.filter(r => r.kind === 'pointTriangle').length]
];
for (const [key, actual] of exact) {
  check(meta[key] === actual, `metadata.${key} (${meta[key]}) = ערך נמדד (${actual})`);
}

// מדדי ניצול תלויי-גופן: סבילות ±1.5 בין metadata (מקור: CI) למדידה הנוכחית.
const UTIL_TOLERANCE = 1.5;
check(Math.abs(meta.minimumPageUtilizationPercent - minUtil) <= UTIL_TOLERANCE,
  `metadata.minimumPageUtilizationPercent (${meta.minimumPageUtilizationPercent}) בטווח ±${UTIL_TOLERANCE} מהנמדד (${minUtil})`);
check(Math.abs(meta.maximumPageUtilizationPercent - maxUtil) <= UTIL_TOLERANCE,
  `metadata.maximumPageUtilizationPercent (${meta.maximumPageUtilizationPercent}) בטווח ±${UTIL_TOLERANCE} מהנמדד (${maxUtil})`);

// ciStatus אינו נכתב ירוק כשהוולידציה עצמה מוצאת סתירות: אם נאספו שגיאות,
// הריצה תיכשל ממילא; כאן נוודא שהשדה מוגבל לערכים חוקיים בלבד.
check(['green', 'red', 'pending'].includes(meta.ciStatus), `metadata.ciStatus ערך חוקי (${meta.ciStatus})`);
check(exists(meta.isolatedAdvancedPagesModule),
  `metadata.isolatedAdvancedPagesModule מפנה לקובץ קיים (${meta.isolatedAdvancedPagesModule})`);

// ---------- 7. STATUS.md מול המספרים הנמדדים ----------
const progressMatch = status.match(/התקדמות נוכחית: (\d+)%/);
check(Boolean(progressMatch), 'STATUS מצהיר אחוז התקדמות');
if (progressMatch) {
  check(Number(progressMatch[1]) === meta.progressPercent,
    `אחוז ההתקדמות ב-STATUS (${progressMatch[1]}) = metadata (${meta.progressPercent})`);
}
check(status.includes(`**${pages.length} דפי A4`), `STATUS מצהיר את מספר הדפים הנמדד (${pages.length})`);
check(status.includes(`**${answers.length} רשומות תשובה`), `STATUS מצהיר את מספר רשומות התשובה הנמדד (${answers.length})`);
check(status.includes(`**${meta.automatedChecks} בדיקות אוטומטיות`), `STATUS מצהיר את מספר הבדיקות שב-metadata (${meta.automatedChecks})`);
check(status.includes('אפס גלישות') === (overflowing.length === 0), 'טענת "אפס גלישות" ב-STATUS תואמת את המדידה');

// ---------- 8. SHA256SUMS — אימות תוכן בפועל ----------
const sums = read('SHA256SUMS.txt').trim().split('\n');
check(sums.length >= 5, `SHA256SUMS מכיל ${sums.length} רשומות`);
for (const line of sums) {
  const match = line.match(/^([0-9a-f]{64}) \*(.+)$/);
  if (!match) { errors.push(`שורת checksum פגומה: ${line}`); continue; }
  const [, expected, relative] = match;
  if (!exists(relative)) { errors.push(`קובץ מה-checksums חסר: ${relative}`); continue; }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
  check(actual === expected, `sha256 תואם: ${relative}`, 'התוכן שונה מהרשום — יש לבנות מחדש');
}

// ---------- 9. קובץ המקור — גלאי נוכחות מפורש ----------
// הנתיב שבו המערכת מצפה לקבל את חוברת המקור כשתימסר:
const SOURCE_PDF = 'sources/שטחים והיקפים במערכת הצירים.pdf';
if (exists(SOURCE_PDF)) {
  ok.push(`קובץ המקור קיים: ${SOURCE_PDF}`);
  check(!status.includes('שאלות המקור אינן משולבות'),
    'קובץ המקור קיים אך STATUS עדיין מצהיר שהשאלות אינן משולבות — יש לעדכן את שלב השילוב');
} else {
  warnings.push(
    `קובץ המקור חסר: ${SOURCE_PDF} — שאלות המקור אינן משולבות, ` +
    'והפרויקט פועל במצב העשרה בלבד. אין לסמן את שלב שילוב המקור כהושלם.');
  check(status.includes('שאלות המקור אינן משולבות'),
    'STATUS חייב להצהיר במפורש שקובץ המקור חסר ושאלות המקור אינן משולבות');
}

// ---------- 10. סקריפטים ב-package.json מפנים לקבצים קיימים ----------
const scripts = JSON.parse(read('package.json')).scripts || {};
for (const [name, command] of Object.entries(scripts)) {
  for (const match of command.matchAll(/node\s+(?:--test\s+)?([\w./-]+\.mjs)/g)) {
    check(exists(match[1]), `הסקריפט "${name}" מפנה לקובץ קיים (${match[1]})`,
      'node script מפנה לקובץ חסר');
  }
}

// ---------- סיכום ----------
for (const warning of warnings) console.warn(`⚠ אזהרה: ${warning}`);
if (errors.length) {
  console.error(`\nולידציה נכשלה — ${errors.length} סתירות:\n` + errors.map(e => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`ולידציה עברה: ${ok.length} בדיקות הצלבה, ${warnings.length} אזהרות, אפס סתירות.`);
