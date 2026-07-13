// חיבור נכסים לגרסת ה-build כדי למנוע cache ישן (§6: גרסה אחת מה-build, מוזרקת).
// הבעיה שנפתרת: שדרוג MathJax (3→4) השאיר מנוע ישן ב-cache הדפדפן/SW, והוא רינדר
// תוכן חדש שבור (סימן שווה וסמלים). הפתרון: לכל טעינת נכס שעלול להתיישן ולשבור
// תוכן חדש — סקריפט MathJax וכל ה-CSS — מוסיפים ?v=<buildVersion>. גרסה חדשה בכל
// deploy (GITHUB_SHA) => URL חדש => טעינה טרייה תמיד, גם דרך ה-Service Worker.

// הסקריפט הקריטי: מנוע MathJax. נתיב יחסי או מוחלט, עם/בלי גרסה קיימת.
const MATHJAX_SRC_RE = /(<script\b[^>]*\bsrc=")([^"?]*vendor\/mathjax\/tex-mml-chtml\.js)((?:\?v=[^"]*)?)(")/g;

// כל קישור stylesheet (a4-base, styles/pages, vendor/fonts, catalog/mobile).
const CSS_LINK_RE = /(<link\b[^>]*\bhref=")([^"?]+\.css)((?:\?v=[^"]*)?)(")/g;

/**
 * מוסיף/מעדכן ?v=<version> לסקריפט MathJax ולכל קישורי ה-CSS ב-HTML.
 * אידמפוטנטי: הרצה חוזרת מעדכנת את הגרסה במקום לשרשר.
 */
export function versionizeHtml(html, version) {
  const v = String(version);
  return html
    .replace(MATHJAX_SRC_RE, (_m, pre, url, _old, post) => `${pre}${url}?v=${v}${post}`)
    .replace(CSS_LINK_RE, (_m, pre, url, _old, post) => `${pre}${url}?v=${v}${post}`);
}

/** נכשל אם נשאר סקריפט MathJax ללא גרסה (ערובת build כמו הטוקן שלא הוחלף). */
export function assertMathjaxVersioned(html, file) {
  const bare = /<script\b[^>]*\bsrc="[^"]*vendor\/mathjax\/tex-mml-chtml\.js"/;
  if (bare.test(html)) {
    throw new Error(`Unversioned MathJax script in dist/${file} — cache-bust injection failed`);
  }
}
