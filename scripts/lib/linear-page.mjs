// scripts/lib/linear-page.mjs — רינדור דף עבודה A4 לנושא "פונקציה קווית".
//
// זהו **renderer בלבד**: הוא מסדר על הדף תוכן שנמסר לו מתוך מקור שתומלל (§1).
// הוא אינו מחולל שאלות, נתונים או תשובות.
//
// חוזים שהוא אוכף (CLAUDE.md):
//   §3  — A4 קנוני, אין CSS inline, אין style="".
//   §4  — RTL, MathJax \(...\), אין מספור שאלות גלוי (רק כדור שחור).
//   §4.3 — מקום מענה תואם למבנה התשובה: תיבה נפרדת לכל ערך + אופרטור מודפס.

const FOOT_1 = 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const FOOT_2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

/* ---------- רכיבי מענה (§4.3) ---------- */

/** קו מענה יחיד — לתשובה שהיא ערך יחיד או מילולית. */
export const wline = (w = '') => `<span class="wline${w ? ' ' + w : ''}" aria-hidden="true"></span>`;

/** ביטוי מרובה-תיבות: תיבה לכל ערך, אופרטור מודפס ביניהן. ops.length = n-1 */
export function wexpr(n, ops = [], w = '') {
  const parts = [];
  for (let i = 0; i < n; i++) {
    parts.push(wline(w));
    if (i < n - 1) parts.push(`<span class="wop">${ops[i] ?? '+'}</span>`);
  }
  return `<span class="wexpr">${parts.join('')}</span>`;
}

/** זוג שיעורים ( ▭ , ▭ ) — סוגריים ופסיק מודפסים, תיבה לכל שיעור. */
export function wpoint(name = '') {
  const label = name ? `<span class="pname">${name}</span>` : '';
  return `${label}<span class="pt"><span class="paren">(</span>${wline()}<span class="wop">,</span>${wline()}<span class="paren">)</span></span>`;
}

/** יחס ▭ : ▭ */
export const wratio = () => wexpr(2, [':']);

/** משוואת ישר: y = ▭x + ▭ */
export function weq(lead = 'y =') {
  return `<span class="eqline"><span class="lead">${lead}</span>${wline('w40')}<span class="wop">x</span><span class="wop">+</span>${wline('w40')}</span>`;
}

/** משוואת ישר פתוחה לגמרי: y = ▭▭▭ */
export const weqOpen = (lead = 'y =') =>
  `<span class="eqline"><span class="lead">${lead}</span>${wline('w120')}</span>`;

/* ---------- בלוקים ---------- */

export const def = (html) => `<div class="defcard">${html}</div>`;

export const rules = (items) =>
  `<div class="rulestrip${items.length === 2 ? ' r2' : ''}">` +
  items.map((r) => `<div class="rulecard"><div class="ruletitle">${r.title}</div><div class="ruletext">${r.text}</div></div>`).join('') +
  `</div>`;

const subsHtml = (subs) =>
  !subs || !subs.length ? '' :
  `<div class="subs">` + subs.map((s) => `<div class="sub"><span class="subl">${s.l}</span><span class="subt">${s.t}</span></div>`).join('') + `</div>`;

const mcHtml = (mc) => {
  if (!mc) return '';
  const cls = mc.cols === 2 ? ' mc2' : mc.cols === 3 ? ' mc3' : '';
  return `<div class="mc${cls}">` +
    mc.opts.map((o, i) => `<div class="opt"><span class="ol">${'אבגדהו'[i]}</span><span class="ot">${o}</span></div>`).join('') +
    `</div>`;
};

const stmtsHtml = (stmts) =>
  !stmts || !stmts.length ? '' :
  `<div class="stmts">` + stmts.map((s) =>
    `<div class="stmt"><span class="slab">${s.l}</span><span class="stext">${s.t}</span>` +
    (s.circ ? `<span class="tfrow"><span class="circ">${s.circ}</span></span>` : '') + `</div>`).join('') + `</div>`;

const figHtml = (fig, cap) => {
  if (!fig) return '';
  const body = Array.isArray(fig)
    ? `<div class="figrow">${fig.map((f) => (typeof f === 'string' ? f : `<div>${f.svg}${f.cap ? `<div class="figcap">${f.cap}</div>` : ''}</div>`)).join('')}</div>`
    : fig;
  return `<div class="figure">${body}${cap ? `<div class="figcap">${cap}</div>` : ''}</div>`;
};

export const linesBlock = (n, tall = false) =>
  `<div class="lines">${Array.from({ length: n }, () => `<div class="ln${tall ? ' ln-tall' : ''}"></div>`).join('')}</div>`;

/** טבלת ערכים אופקית. cells[i] = null => תא למילוי. */
export function vtable(rowsSpec, { wide = false } = {}) {
  const cls = `vtab${wide ? ' wide' : ''}`;
  const rows = rowsSpec.map((r) =>
    `<tr><th>${r.head}</th>` +
    r.cells.map((c) => (c === null || c === undefined ? `<td class="fill"></td>` : `<td>${c}</td>`)).join('') +
    `</tr>`).join('');
  return `<table class="${cls}">${rows}</table>`;
}

/** טבלת סיווג עם כותרות עמודה. */
export function ctable(headers, rows) {
  return `<table class="ctab"><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>` +
    rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('') + `</table>`;
}

/**
 * כרטיס שאלה. אין מספור גלוי — רק כדור שחור (§4).
 * layout:'work' מציב את האיור לצד עמודת התשובות.
 */
export function q(spec) {
  const { stem = '', subs, fig, figCap, mc, stmts, answers, tail, layout = 'stack', figFirst = false } = spec;
  const inner = [];
  if (stem) inner.push(stem);

  if (layout === 'work' && fig) {
    inner.push(
      `<div class="workrow${spec.top ? ' top' : ''}">${figHtml(fig, figCap)}` +
      (answers ? `<div class="pairs-col">${answers.map((a) => `<span>${a}</span>`).join('')}</div>` : '') +
      `</div>`);
    inner.push(subsHtml(subs));
  } else {
    if (figFirst) { inner.push(figHtml(fig, figCap)); inner.push(subsHtml(subs)); }
    else { inner.push(subsHtml(subs)); inner.push(figHtml(fig, figCap)); }
    if (answers) inner.push(`<div class="pairs-col">${answers.map((a) => `<span>${a}</span>`).join('')}</div>`);
  }
  inner.push(mcHtml(mc));
  inner.push(stmtsHtml(stmts));
  if (tail) inner.push(tail);

  return `<div class="q"><div class="qrow"><div class="bullet-container"><div class="bullet-large"></div></div>` +
    `<div class="qbody">${inner.filter(Boolean).join('')}</div></div></div>`;
}

export const chapterBar = (name, sub) =>
  `<h2 class="chapter-bar"><span class="chapter-name">${name}</span>` +
  (sub ? `<span class="chapter-sub">${sub}</span>` : '') + `</h2>`;

/* ---------- הדף השלם ---------- */

export function buildPage({ fileNumber, localNumber, topicTotal, prevFile, nextFile, subtitle, blocks }) {
  const prev = prevFile
    ? `<a class="nav-link" href="${prevFile}">הקודם</a>`
    : `<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>`;
  const next = nextFile
    ? `<a class="nav-link" href="${nextFile}">הבא</a>`
    : `<span class="nav-link is-disabled" aria-disabled="true">הבא</span>`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${localNumber} — פונקציה קווית</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${fileNumber}.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side">${prev}</div>
            <div class="nav-meta">פונקציה קווית — עמוד ${localNumber} / ${topicTotal}</div>
            <div class="nav-side">${next}</div>
        </div>
        <div class="preview-nav-topics" aria-label="נושא הדף">
            <a class="topic-link is-active" href="עמוד-${fileNumber}.html" aria-current="page">פונקציה קווית</a>
        </div>
    </nav>

    <main class="a4-page page-${fileNumber} lin8-page">
        <header class="header-container">
            <div class="title-wrap">
                <h1 class="page-title">פונקציה קווית</h1>
                <p class="page-subtitle">${subtitle}</p>
            </div>
            <div class="page-number">${localNumber}</div>
        </header>

        <div class="question-block">
${blocks.map((b) => '            ' + b).join('\n')}
        </div>

        <footer class="gz-footer">
            <div class="f1">${FOOT_1}</div>
            <div class="f2">${FOOT_2}</div>
        </footer>
    </main>
</body>
</html>
`;
}

export { FOOT_1, FOOT_2 };
