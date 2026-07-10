import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicName = 'משוואות';
const excludedTopic = 'משוואות ריבועיות';
const maxPages = Number(process.env.EQUATIONS_QUEUE_LIMIT || 10);
const writeReport = process.env.EQUATIONS_QUEUE_WRITE_REPORT === '1' || process.argv.includes('--write-report');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const requestedReportPath = process.env.EQUATIONS_QUEUE_REPORT_PATH || '';
const reportPath = requestedReportPath
  ? path.resolve(root, requestedReportPath)
  : path.join(root, 'STATE', `EQUATIONS_SMART_QUEUE_${stamp}.md`);

function readText(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf8');
}

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

function localIndex(page) {
  const match = String(page.title || '').match(/עמוד\s+(\d+)/);
  return match ? Number(match[1]) : Number(page.number || 0);
}

function relPath(...parts) {
  return path.join(...parts).replaceAll('\\', '/');
}

function svgPathFor(local) {
  return relPath('pages', topicName, 'assets', `page-${String(local).padStart(2, '0')}.svg`);
}

function classifyPage(page) {
  const file = page.file;
  const local = localIndex(page);
  const html = readText(file);
  const cssFile = relPath('styles', 'pages', file.replace(/\.html$/, '.css'));
  const css = readText(cssFile);
  const svgFile = svgPathFor(local);
  const svg = readText(svgFile);

  const facts = {
    local,
    title: page.title,
    file,
    cssFile,
    svgFile,
    htmlExists: Boolean(html),
    cssExists: Boolean(css),
    svgExists: Boolean(svg),
    exercises: count(html, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g),
    answers: count(html, /class\s*=\s*"[^"]*\banswer-line\b[^"]*"/g),
    equations: count(html, /class\s*=\s*"[^"]*\beq\b[^"]*"/g),
    verified: count(html, /data-correction\s*=\s*"verified"/g),
    preserved: count(html, /data-correction\s*=\s*"existing-content-preserved"/g),
    mathJax: count(html, /\\\(/g),
    oldClasses: count(html, /problem-block|problem-answer|solution-space|answer-box/g),
    svgRefs: count(html, /page-\d+\.svg/g),
    cropRisk: /translateY|object-fit\s*:\s*cover/.test(css),
    softGrid: /rgba\(142,\s*163,\s*196,\s*0\.(12|15|17|18|20|24)\)/.test(css),
    svgText: count(svg, /<text\b/g),
    svgTspan: count(svg, /<tspan\b/g),
    svgPathCount: count(svg, /<path\b/g),
    svgGlyphs: count(svg, /id="glyph-/g)
  };

  let status = 'needs-inspection';
  let nextAction = 'בדיקה ידנית';
  let priority = 90;

  if (!facts.htmlExists) {
    status = 'missing-html';
    nextAction = 'לעצור — חסר HTML';
    priority = 1;
  } else if (facts.exercises > 0 && facts.answers > 0 && facts.oldClasses === 0) {
    if (facts.preserved > 0 && facts.verified === 0) {
      status = 'html-preserved-needs-source-verification';
      nextAction = 'לאמת מול PDF ואז לסמן verified אם נכון';
      priority = 10;
    } else if (facts.verified > 0) {
      status = 'html-verified-needs-visual-lock';
      nextAction = 'בדיקה חזותית ונעילה בדוח STATE';
      priority = 30;
    } else {
      status = 'html-live-needs-provenance';
      nextAction = 'להוסיף provenance אחרי אימות מקור';
      priority = 20;
    }
  } else if (facts.svgRefs > 0 || facts.svgExists) {
    status = facts.cropRisk ? 'svg-crop-risk' : 'svg-temporary-source-needed';
    nextAction = facts.cropRisk
      ? 'לתקן עטיפת SVG בלבד: contain + no transform'
      : 'לחילוץ מקור אמין לפני המרה ל-HTML/MathJax';
    priority = facts.cropRisk ? 15 : 40;
  }

  if (facts.file === 'עמוד-42.html' && facts.verified >= 10) {
    status = 'locked-candidate';
    nextAction = 'לא לבנות מחדש; רק לנעול בדוח';
    priority = 80;
  }

  return { ...facts, status, nextAction, priority };
}

const metaPath = path.join(root, 'meta', 'topics.json');
if (!fs.existsSync(metaPath)) {
  throw new Error('Missing meta/topics.json');
}

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const topic = meta.topics.find((entry) => entry.name === topicName);
if (!topic) {
  throw new Error(`Missing topic: ${topicName}`);
}

const pages = topic.pages
  .filter((page) => page.topic === topicName && page.topic !== excludedTopic)
  .slice()
  .sort((a, b) => localIndex(a) - localIndex(b));

const rows = pages.slice(0, maxPages).map(classifyPage);
const next = rows
  .filter((row) => !row.status.startsWith('locked'))
  .slice()
  .sort((a, b) => a.priority - b.priority || a.local - b.local)[0];

const canonicalPrint = 'preview/print.html?topic=משוואות&autoselect=topic&maxLocalPage=3';
const previewOverlap = readText('STATE/PREVIEW_OVERLAP_AUDIT.md');
const printJs = readText('preview/print.js');
const hasCanonicalPrint = previewOverlap.includes('preview/print.html: YES') && previewOverlap.includes('canonical: preview/print.js => YES');
const printSupportsScope = printJs.includes('maxLocalPage') && printJs.includes('isWithinRequestedScope');
const pdfCandidates = ['sources/equations/משוואות-52.pdf', 'sources/legacy/parabula-old/sources/משוואות.pdf'].filter((rel) => fs.existsSync(path.join(root, rel)));

function yesNo(value) {
  return value ? 'כן' : 'לא';
}

const tableRows = rows.map((row) => `| ${row.local} | \`${row.file}\` | ${row.exercises} | ${row.answers} | ${row.verified} | ${row.preserved} | ${row.svgRefs || (row.svgExists ? 1 : 0)} | ${row.oldClasses} | ${yesNo(row.cropRisk)} | ${yesNo(row.softGrid)} | ${row.status} | ${row.nextAction} |`).join('\n');

const report = `# EQUATIONS SMART QUEUE

Generated: ${new Date().toISOString()}

## Scope

- Topic: \`${topicName}\`
- Excluded: \`${excludedTopic}\`
- Pages inspected: first ${rows.length} pages only
- Default mode is read-only: no file is written unless \`EQUATIONS_QUEUE_WRITE_REPORT=1\` or \`--write-report\` is used.
- This script does not modify worksheet pages, preview files, or source files.

## Canonical preview rule

- canonical print path: \`${canonicalPrint}\`
- canonical preview files confirmed: ${hasCanonicalPrint ? 'YES' : 'NO'}
- print scope support: ${printSupportsScope ? 'YES' : 'NO'}
- rule: do not create additional \`preview/*.html\` routes for equation subsets.

## Source candidates

${pdfCandidates.length ? pdfCandidates.map((rel) => `- \`${rel}\``).join('\n') : '- No equation PDF candidate found'}

## Queue table

| Local page | HTML | Exercises | Answer boxes | verified | preserved | SVG ref | old classes | crop risk | soft grid | status | next action |
|---:|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
${tableRows}

## Next recommended page

${next ? `- local page: ${next.local}\n- file: \`${next.file}\`\n- status: ${next.status}\n- action: ${next.nextAction}` : '- no next page selected'}

## Fast automation strategy

1. Keep using \`preview/print.html\` for printing and selection.
2. Improve one worksheet page at a time.
3. If page is HTML-live: adjust only that page HTML/CSS and preserve source provenance.
4. If page is SVG-only: do not invent exercises; first extract/verify source from PDF or SVG evidence.
5. After each page: run this queue script and add a STATE lock report only for meaningful milestones.
6. Never commit from a dirty local repo; use a clean clone or exact \`git add\` file list.
`;

if (writeReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, 'utf8');
}

console.log('EQUATIONS_SMART_QUEUE_OK');
console.log(`pages_inspected=${rows.length}`);
console.log(`canonical_preview=${hasCanonicalPrint ? 'YES' : 'NO'}`);
console.log(`print_scope=${printSupportsScope ? 'YES' : 'NO'}`);
console.log(`write_report=${writeReport ? 'YES' : 'NO'}`);
if (next) {
  console.log(`next_local_page=${next.local}`);
  console.log(`next_file=${next.file}`);
  console.log(`next_status=${next.status}`);
}
if (writeReport) {
  console.log(`report=${path.relative(root, reportPath)}`);
} else {
  console.log('report=not_written_default_read_only');
}
console.log('--- EQUATIONS_SMART_QUEUE_REPORT_START ---');
console.log(report.trimEnd());
console.log('--- EQUATIONS_SMART_QUEUE_REPORT_END ---');
