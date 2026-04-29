import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const metadataPath = path.join(root, 'meta/topics.json');
const TARGET_TOPIC = 'משוואות';
const EXCLUDED_TOPIC = 'משוואות ריבועיות';
const EXPECTED_COUNT = 54;
const DESIGN_MARKER = '/* EQUATIONS_DESIGN_PASS_20260429 */';

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function write(relPath, content) {
  fs.writeFileSync(path.join(root, relPath), content, 'utf8');
}

function localIndex(page) {
  const match = String(page.title || '').match(/עמוד\s+(\d+)/);
  if (match) return Number(match[1]);
  return Number(page.number || 0);
}

function pageClassFor(file) {
  const match = String(file || '').match(/עמוד-(\d+)\.html$/);
  if (!match) throw new Error(`Cannot resolve page class for ${file}`);
  return `page-${match[1]}`;
}

function cssPathFor(file) {
  return `styles/pages/${file.replace(/\.html$/, '.css')}`;
}

function cleanLegacyGlobalCss(css) {
  return css
    .replace(/\n?\/\* EQUATIONS_STRICT_UNIFY \*\/[\s\S]*$/m, '')
    .replace(/\n?\.header-container\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?\.page-title\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?\.q-main,\.q-sub\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?\.q-text\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?\.answer-box\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?\.explain-box\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?\.math-table td,\.label-cell,\.ordered-pair,\.sym-item,\.axis-label\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n?body,html,\.a4-page\s*\{[\s\S]*?\}\s*/gm, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildDesignCss(pageClass) {
  return `${DESIGN_MARKER}
.${pageClass} {
  --eq-ink: #172033;
  --eq-muted: #5b6473;
  --eq-paper: #ffffff;
  --eq-line: #d8e0ed;
  --eq-soft: #f6f8fc;
  --eq-blue: #234b8f;
  font-family: 'Rubik', 'Assistant', Arial, sans-serif;
}

.${pageClass} .question-block {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.${pageClass} .pdf-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--eq-line);
  border-radius: 12px;
  background: var(--eq-paper);
}

.${pageClass} .pdf-page {
  width: 100%;
  height: calc(100% + 118px);
  object-fit: cover;
  object-position: center top;
  display: block;
  transform: translateY(-118px);
  transform-origin: top center;
}

.${pageClass} .pdf-wrap img,
.${pageClass} svg {
  max-width: 100%;
}

.${pageClass} .q-main,
.${pageClass} .q-sub {
  align-items: flex-start;
  margin-bottom: 8px;
}

.${pageClass} .q-text {
  color: var(--eq-ink);
  line-height: 1.55;
}

.${pageClass} .answer-box {
  vertical-align: middle;
  transform: none;
}

.${pageClass} .explain-box {
  margin-top: 8px;
}

.${pageClass} .math-table td,
.${pageClass} .label-cell,
.${pageClass} .ordered-pair,
.${pageClass} .sym-item,
.${pageClass} .axis-label {
  font-family: 'Rubik', 'Assistant', Arial, sans-serif;
}
`;
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const topic = metadata.topics.find((entry) => entry.name === TARGET_TOPIC);
if (!topic) throw new Error(`Missing topic: ${TARGET_TOPIC}`);
if (metadata.topics.find((entry) => entry.name === EXCLUDED_TOPIC)?.name === topic.name) {
  throw new Error('Topic separation failed: equations and quadratic equations collapsed.');
}
if (!Array.isArray(topic.pages) || topic.pages.length !== EXPECTED_COUNT) {
  throw new Error(`Expected ${EXPECTED_COUNT} equations pages, got ${topic.pages?.length ?? 0}`);
}

const pages = topic.pages.slice().sort((a, b) => localIndex(a) - localIndex(b));
const changed = [];

for (const page of pages) {
  if (page.topic !== TARGET_TOPIC) throw new Error(`Wrong topic on ${page.file}: ${page.topic}`);
  const cssRel = cssPathFor(page.file);
  const pageClass = pageClassFor(page.file);
  if (!fs.existsSync(path.join(root, cssRel))) throw new Error(`Missing CSS: ${cssRel}`);
  const current = read(cssRel);
  const cleaned = cleanLegacyGlobalCss(current).replace(new RegExp(`\\n?${DESIGN_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*$`, 'm'), '').trim();
  const next = `${cleaned}\n\n${buildDesignCss(pageClass)}\n`;
  if (next !== current) {
    write(cssRel, next);
    changed.push(cssRel);
  }
}

const reportPath = 'STATE/EQUATIONS_DESIGN_PASS_APPLIED.md';
const report = `# EQUATIONS_DESIGN_PASS_APPLIED — ParabulaNext

_Last updated: 2026-04-29_

## Applied scope

Applied a design-only cleanup to the non-quadratic equations topic:

- Topic: ${TARGET_TOPIC}
- Pages covered: ${pages.length}
- Quadratic-equation pages touched: 0

## What changed

For each equations page CSS file, the pass:

- removed legacy global equations cleanup overrides where present
- avoided global selectors such as \`.header-container\`, \`.page-title\`, and \`body,html,.a4-page\`
- preserved page-local layout rules
- appended a scoped design block marked \`${DESIGN_MARKER}\`
- scoped all new design rules to the exact page class, for example \`.page-42\`
- kept worksheet HTML and educational content unchanged
- kept \`styles/a4-base.css\` unchanged

## Files changed by the script

${changed.map((item) => `- ${item}`).join('\n') || '- No CSS files required changes.'}

## Verification required

After applying this pass, run:

- \`npm run validate:equations\`
- \`npm run validate:access\`
- \`npm test\`

Then check real preview and print/PDF output before declaring the design pass fully complete.
`;
write(reportPath, report);

console.log('EQUATIONS_DESIGN_PASS_APPLIED');
console.log(`changed_css_files=${changed.length}`);
for (const item of changed) console.log(item);
console.log(`report=${reportPath}`);
