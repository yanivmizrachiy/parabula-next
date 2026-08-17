// שכבת רינדור לדף A4 — HTML בלבד, ללא CSS inline (CLAUDE.md §3).
//
// כללי מקום מענה (CLAUDE.md §4.3): מבנה מקום המענה נגזר ממבנה התשובה.
// ערך יחיד → קו אחד. תשובה מורכבת → תיבה לכל ערך עם אופרטור מודפס ביניהן.

export const FOOTER_LINES = [
  'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים',
  'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין'
];

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** קטע LTR מוטבע — לשיעורים, משוואות וביטויים מספריים בתוך משפט עברי. */
export function ltr(content) {
  return `<span class="ltr" dir="ltr">${content}</span>`;
}

/** שיעורי נקודה: A(3,2) — נשמר כיחידה LTR אחת כדי שה־RTL לא יהפוך אותה. */
export function pt(name, x, y) {
  return ltr(`${esc(name)}(${x},${y})`);
}

/** נוסחה בשורה ב־MathJax. */
export function math(tex) {
  return `\\(${tex}\\)`;
}

/** קו מענה יחיד — לתשובה שהיא ערך אחד או ניסוח מילולי קצר. */
export function line({ width = 'full' } = {}) {
  return `<span class="wline wline-${width}"></span>`;
}

/** n שורות מענה מלאות להסבר או נימוק. */
export function lines(n, { label = '' } = {}) {
  const head = label ? `<span class="wlabel">${esc(label)}</span>` : '';
  return `<div class="wlines">${head}${'<span class="wrule"></span>'.repeat(n)}</div>`;
}

/**
 * ביטוי מענה מובנה: תיבה לכל ערך, אופרטור מודפס ביניהן.
 * parts: מחרוזת '_' לתיבה, כל שאר המחרוזות מודפסות כאופרטור/סוגר.
 * דוגמה: expr(['_', '+', '_']) → ▭ + ▭
 */
export function expr(parts, { label = '' } = {}) {
  const head = label ? `<span class="wlabel">${esc(label)}</span>` : '';
  const body = parts
    .map(part => (part === '_' ? '<span class="wline wline-box"></span>' : `<span class="wop">${esc(part)}</span>`))
    .join('');
  return `<div class="wexpr-row">${head}<span class="wexpr" dir="ltr">${body}</span></div>`;
}

/** שיעורי נקודה כמקום מענה: ( ▭ , ▭ ) */
export function exprPoint(label = '') {
  return expr(['(', '_', ',', '_', ')'], { label });
}

/** רשימת בחירה מרובה — ריבוע סימון לכל טענה. */
export function choices(items) {
  return `<ul class="wchoices">${items.map(item => `<li><span class="wbox"></span><span class="wchoice-text">${item}</span></li>`).join('')}</ul>`;
}

/** תת־סעיפים בכדור שחור (אין מספור שאלות גלוי — CLAUDE.md §4). */
export function subs(items) {
  return `<ul class="wsubs">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

/** אותיות סעיף א/ב/ג — תווית סעיף מותרת. */
export function lettered(items) {
  const letters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
  return `<ul class="wlettered">${items
    .map((item, i) => `<li><span class="wletter">${letters[i] ?? String(i + 1)}.</span><span class="wlettered-body">${item}</span></li>`)
    .join('')}</ul>`;
}

/**
 * טבלת מענה.
 * rows כמספר → אותו מספר שורות ריקות לגמרי.
 * rows כמערך → כל איבר הוא מערך תאים; תא ריק נשאר מקום מענה.
 * תאים חסרים בשורה מושלמים כתאים ריקים, כך שכל שורה תואמת את הכותרות.
 */
export function table(headers, rows) {
  const head = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const data = typeof rows === 'number'
    ? Array.from({ length: rows }, () => [])
    : rows;
  const body = data
    .map(cells => `<tr>${headers.map((_, i) => `<td>${cells[i] ?? ''}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="wtable"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

/** כרטיס משימה. הכדור השחור מגיע מה־CSS, לא מהטקסט. */
export function task(text, ...parts) {
  return `<div class="wtask"><p class="wtask-text">${text}</p>${parts.join('')}</div>`;
}

/** תיבת תזכורת / מושגים. */
export function note(title, items) {
  return `<aside class="wnote"><h3 class="wnote-title">${esc(title)}</h3><ul class="wnote-list">${items.map(i => `<li>${i}</li>`).join('')}</ul></aside>`;
}

/** מערכת צירים כאיור עם כיתוב אופציונלי. */
export function figure(grid, caption = '') {
  const cap = caption ? `<figcaption class="wfigcap">${esc(caption)}</figcaption>` : '';
  return `<figure class="wfigure">${grid.toString()}${cap}</figure>`;
}

/** שתי עמודות בתוך הדף — לניצול רוחב מלא בלי דחיסת גופן. */
export function cols(left, right) {
  return `<div class="wcols"><div class="wcol">${left}</div><div class="wcol">${right}</div></div>`;
}

/** דף A4 שלם. אין מספור שאלות; רק מספר עמוד בכותרת. */
export function renderPage(page) {
  const footer = FOOTER_LINES.map(l => `<span class="wfoot-line">${esc(l)}</span>`).join('');
  return `<section class="a4-page seg-page" id="page-${page.n}" data-page="${page.n}">`
    + `<header class="whead">`
    + `<span class="whead-unit">${esc(page.unit)}</span>`
    + `<h2 class="whead-title">${esc(page.title)}</h2>`
    + `<span class="whead-page">עמוד ${page.n}</span>`
    + `</header>`
    + `<div class="wbody">${page.blocks.join('')}</div>`
    + `<footer class="wfoot">${footer}</footer>`
    + `</section>`;
}
