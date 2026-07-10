#!/usr/bin/env node
/**
 * build-equations-pages.mjs
 *
 * Data-driven generator for the non-quadratic equations topic (משוואות).
 * Reads:
 *   - meta/equations-master-map.json  (logical page -> on-disk file)
 *   - meta/equations-content.json     (faithful PDF transcription per page)
 *
 * For every logical page that has transcribed content it rewrites the worksheet
 * body of `עמוד-<file>.html` to the locked v2 gold design (numbered pages only,
 * equation centered in the gray card, grid-paper solution area, `var = ▭`) and
 * writes the matching scoped `styles/pages/עמוד-<file>.css`.
 *
 * Design contract: STATE/EQUATIONS_DESIGN_PASS_RULES.md
 *   - no per-exercise numbering (only the page badge)
 *   - equation centered/prominent inside the gray card, above the writing area
 *   - content is transcribed only, never invented
 *
 * Pages without transcribed content are left untouched (e.g. logical 53-54 have
 * no source PDF page -> EXTRA_UNVERIFIED).
 *
 * Nav, header, page number and title of each file are preserved as-is; only the
 * worksheet body and the page CSS are produced here.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const map = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'equations-master-map.json'), 'utf8'));
const content = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'equations-content.json'), 'utf8'));

const fileByLogical = new Map(map.pages.map((p) => [p.logical, p]));
const instruction = content.instruction;

const onlyArg = process.argv[2]; // optional "1-8" or "9" range filter
let lo = 1, hi = Infinity;
if (onlyArg) {
  const m = onlyArg.match(/^(\d+)(?:-(\d+))?$/);
  if (m) { lo = Number(m[1]); hi = m[2] ? Number(m[2]) : lo; }
}

const unknownOf = (eq) => (/y/.test(eq) ? 'y' : 'x');
const esc = (s) => s; // equations are author-controlled TeX-safe strings

function card(eq, i) {
  const v = unknownOf(eq);
  return `              <div class="problem-block" aria-label="תרגיל" data-source-line="${i + 1}">
                <div class="problem-work">
                  <div class="problem-figure"><div class="problem-equation">\\(${esc(eq)}\\)</div></div>
                  <div class="solution-space" aria-label="אזור פתרון (כתיבה חופשית)"></div>
                </div>
                <div class="problem-answer">\\(${v}\\) = <span class="answer-box box-md"></span></div>
              </div>`;
}

function buildBody(sourcePage, equations, columns) {
  // Explicit columns for engine-independent RTL ordering (no auto-flow guesswork).
  // 1 column = single list (long/sparse pages). 2 columns: first=right (reading order
  // 1..k), second=left (k+1..n) — matches the source worksheet layout.
  let colsHtml;
  if (columns === 1) {
    colsHtml = `            <div class="eq-col">
${equations.map((e, i) => card(e, i)).join('\n\n')}
            </div>`;
  } else {
    const k = Math.ceil(equations.length / 2);
    const right = equations.slice(0, k).map((e, i) => card(e, i)).join('\n\n');
    const left = equations.slice(k).map((e, i) => card(e, i + k)).join('\n\n');
    colsHtml = `            <div class="eq-col eq-col-right">
${right}
            </div>
            <div class="eq-col eq-col-left">
${left}
            </div>`;
  }

  return `
      <div class="question-block">
        <div class="eq-body" aria-label="תוכן" data-source="משוואות.pdf" data-source-page="${sourcePage}">
          <div class="q-main">
            <div class="bullet-container"><div class="bullet-large"></div></div>
            <div class="q-text">${instruction}</div>
          </div>

          <div class="eq-grid" role="group" aria-label="תרגילים">
${colsHtml}
          </div>
        </div>
      </div>
    `;
}

function buildCss(fileNum, logical, n, columns, fontSize) {
  const rows = Math.ceil(n / columns);
  const grid =
    'linear-gradient(to bottom, transparent 21px, var(--grid-line) 21px, var(--grid-line) 22px),\n' +
    '    linear-gradient(to right, transparent 21px, var(--grid-line) 21px, var(--grid-line) 22px)';
  return `/* עמוד ${fileNum} — משוואות עמוד ${logical} (נעלם אחד)
   נוצר אוטומטית ע"י scripts/build-equations-pages.mjs מתוך משוואות.pdf עמוד ${logical}.
   מבנה v2 + מודל-זהב: ללא מספור תרגילים, משוואה ממורכזת בשטח האפור, אזור כתיבה, ואז ערך הנעלם.
   חוזה עיצוב: STATE/EQUATIONS_DESIGN_PASS_RULES.md. ללא שינוי/המצאת תוכן לימודי. */

.page-${fileNum}.equations-page {
  justify-content: flex-start;
  gap: 10px;
}

.page-${fileNum} .header-container {
  margin-bottom: 8px;
}

.page-${fileNum} .question-block {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-${fileNum} .eq-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-${fileNum} .q-main {
  align-items: flex-start;
  margin-bottom: 0;
}

.page-${fileNum} .q-text {
  color: var(--text-main);
  line-height: 1.5;
  font-size: 14px;
}

.page-${fileNum} .eq-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(${columns}, minmax(0, 1fr));
  column-gap: 14px;
  width: 100%;
  align-items: stretch;
  direction: rtl;
}

.page-${fileNum} .eq-col {
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(${rows}, minmax(0, 1fr));
  row-gap: 8px;
}

.page-${fileNum} .problem-block {
  min-height: 0;
  height: 100%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  break-inside: avoid;
}

.page-${fileNum} .problem-work {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* המשוואה כמוקד מרכזי בתוך השטח האפור של הכרטיס — ללא מספור */
.page-${fileNum} .problem-figure {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 6px 4px 4px;
}

.page-${fileNum} .problem-equation {
  direction: ltr;
  unicode-bidi: isolate;
  text-align: center;
  font-family: 'Rubik', 'Assistant', Arial, sans-serif;
  font-weight: 500;
  font-size: ${fontSize}px;
  line-height: ${fontSize + 6}px;
}

.page-${fileNum} .solution-space {
  flex: 1;
  min-height: 30px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background-color: var(--bg-paper);
  background-image:
    ${grid};
  background-size: 22px 22px;
  background-repeat: repeat;
}

.page-${fileNum} .problem-answer {
  direction: ltr;
  unicode-bidi: isolate;
  white-space: nowrap;
  flex: 0 0 auto;
  text-align: center;
  padding-top: 5px;
  border-top: 1px solid var(--border-light);
  font-size: 13px;
}

.page-${fileNum} .problem-answer .answer-box {
  height: 18px;
  transform: translateY(-1px);
}

@media screen and (max-width: 900px) {
  body {
    overflow-x: hidden;
  }

  .preview-nav {
    zoom: 0.48;
    margin-top: 10px;
    margin-bottom: 6px;
  }

  .page-${fileNum}.a4-page {
    zoom: 0.48;
    margin-top: 8px;
    margin-bottom: 16px;
  }
}

@media screen and (min-width: 481px) and (max-width: 900px) {
  .preview-nav,
  .page-${fileNum}.a4-page {
    zoom: 0.64;
  }
}

@media print {
  .page-${fileNum} .problem-block {
    box-shadow: none;
  }

  .page-${fileNum} .solution-space {
    background-image:
      ${grid};
  }
}
`;
}

const written = [];
const skipped = [];
for (const [logicalStr, data] of Object.entries(content.pages)) {
  const logical = Number(logicalStr);
  if (logical < lo || logical > hi) continue;
  const entry = fileByLogical.get(logical);
  if (!entry) { skipped.push(`logical ${logical}: not in master map`); continue; }

  const htmlPath = path.join(root, entry.file);
  let html = fs.readFileSync(htmlPath, 'utf8');

  const columns = data.columns || 2;
  // Visual length proxy: TeX fraction markup (\frac{a}{b}) renders compact, so it
  // must not inflate the length-based font heuristic. Collapse it to ~3 glyphs.
  const visualLen = (e) =>
    e.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\[a-zA-Z]+/g, 'x').length;
  const maxLen = Math.max(...data.equations.map(visualLen));
  const fontSize = data.fontSize || (columns === 1 ? 19 : maxLen >= 22 ? 15 : maxLen >= 17 ? 16 : 18);

  if (!/<\/header>[\s\S]*?<\/main>/.test(html)) {
    skipped.push(`logical ${logical} (${entry.file}): no <header>/<main> found`);
    continue;
  }
  // normalize <main> class and replace the worksheet body between </header> and </main>
  html = html.replace(/<main class="[^"]*">/, `<main class="a4-page page-${entry.fileNum} equations-page">`);
  const body = buildBody(data.sourcePage, data.equations, columns);
  const replaced = html.replace(/(<\/header>)[\s\S]*?(<\/main>)/, `$1\n${body}$2`);
  fs.writeFileSync(htmlPath, replaced, 'utf8');

  const cssPath = path.join(root, 'styles', 'pages', `עמוד-${entry.fileNum}.css`);
  fs.writeFileSync(cssPath, buildCss(entry.fileNum, logical, data.equations.length, columns, fontSize), 'utf8');

  written.push(`logical ${logical} -> ${entry.file} (+css)  [${data.equations.length} eq, ${columns}col, ${fontSize}px]`);
}

console.log('BUILD_EQUATIONS_PAGES');
console.log(`written: ${written.length}`);
for (const w of written) console.log('  + ' + w);
if (skipped.length) {
  console.log(`skipped: ${skipped.length}`);
  for (const s of skipped) console.log('  - ' + s);
}
