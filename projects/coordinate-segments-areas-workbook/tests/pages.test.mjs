// בדיקות חוזה הדף: רציפות, A4, inline CSS, RTL/LTR, SVG, MathJax וכותרת תחתית.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pages from '../src/pages/index.mjs';
import { renderPage, FOOTER_LINES, esc } from '../src/render.mjs';
import { needsLtr } from '../src/coordinate-svg.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = pages.map(renderPage).join('\n');

test('מספרי העמודים רצופים, ייחודיים ומתחילים ב־1', () => {
  const numbers = pages.map(page => page.n);
  assert.equal(new Set(numbers).size, numbers.length, 'קיים מספר עמוד כפול');
  numbers.forEach((n, index) => assert.equal(n, index + 1, `רצף נשבר בעמוד ${n}`));
});

test('לכל עמוד יש כותרת, שם יחידה ולפחות בלוק תוכן אחד', () => {
  for (const page of pages) {
    assert.ok(page.title && page.title.trim(), `עמוד ${page.n} ללא כותרת`);
    assert.ok(page.unit && page.unit.trim(), `עמוד ${page.n} ללא שם יחידה`);
    assert.ok(page.blocks.length > 0, `עמוד ${page.n} ריק`);
  }
});

test('אין CSS inline — לא <style> ולא style="..."', () => {
  assert.equal(/<style\b/i.test(html), false);
  assert.equal(/\sstyle\s*=\s*["']/i.test(html), false);
});

test('אין מספור שאלות גלוי', () => {
  assert.equal(/שאלה\s*\d/.test(html), false, 'נמצאה כותרת „שאלה N” בדף עבודה');
});

test('הכותרת התחתונה מופיעה בשתי שורותיה המדויקות בכל עמוד', () => {
  for (const line of FOOTER_LINES) {
    const occurrences = html.split(esc(line)).length - 1;
    assert.equal(occurrences, pages.length, `השורה "${line}" הופיעה ${occurrences} פעמים`);
  }
});

test('נוסח התואר של יניב רז מלא ותקין', () => {
  assert.ok(FOOTER_LINES[0].includes('מדריך מחוזי חט"ב בעיר ירושלים'));
  assert.equal(/מדריך חט"ב בעיר ירושלים/.test(html), false);
  assert.equal(/מדריך מחוזי בעיר ירושלים/.test(html), false);
});

test('כל <text> מספרי בתוך ה־SVG מקבל direction="ltr"', () => {
  const texts = [...html.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)];
  assert.ok(texts.length > 0, 'לא נמצא טקסט SVG כלל');
  for (const [, attributes, content] of texts) {
    if (needsLtr(content)) {
      assert.match(attributes, /direction="ltr"/, `חסר direction="ltr" עבור "${content}"`);
    }
  }
});

test('כל ביטוי מענה מובנה עטוף במכל LTR', () => {
  const exprs = [...html.matchAll(/<span class="wexpr"([^>]*)>/g)];
  assert.ok(exprs.length > 0);
  for (const [, attributes] of exprs) {
    assert.match(attributes, /dir="ltr"/);
  }
});

test('כל שיעורי הנקודות מוגשים כיחידת LTR אחת', () => {
  // ‎A(3,2)‎ חייב להיות בתוך .ltr, אחרת ה־RTL יהפוך את הסוגריים.
  const bare = html.match(/(?<!>)\b[A-Z]\(-?\d+,-?\d+\)/g) || [];
  const wrapped = html.match(/<span class="ltr" dir="ltr">[A-Z]\(-?\d+,-?\d+\)<\/span>/g) || [];
  assert.ok(wrapped.length > 0, 'לא נמצאו שיעורי נקודה עטופים');
  assert.equal(bare.length, 0, `נמצאו שיעורים ללא עטיפת LTR: ${bare.slice(0, 5).join(', ')}`);
});

test('MathJax: אין תוחם $ יחיד; מותרים רק \\(...\\) ו־$$...$$', () => {
  const singleDollar = html.match(/(?<!\$)\$(?!\$)/g) || [];
  assert.equal(singleDollar.length, 0, 'נמצא תוחם $ יחיד');
});

test('תוחמי MathJax מאוזנים', () => {
  const open = (html.match(/\\\(/g) || []).length;
  const close = (html.match(/\\\)/g) || []).length;
  assert.equal(open, close, 'תוחמי \\( ו־\\) אינם מאוזנים');
  assert.equal((html.match(/\$\$/g) || []).length % 2, 0);
});

test('כל SVG סגור ותקין מבנית', () => {
  assert.equal((html.match(/<svg\b/g) || []).length, (html.match(/<\/svg>/g) || []).length);
  const svgCount = (html.match(/<svg\b/g) || []).length;
  assert.ok(svgCount >= pages.length, `רק ${svgCount} סרטוטים ל־${pages.length} עמודים`);
});

test('לכל SVG יש viewBox ותפקיד נגיש', () => {
  for (const [, attributes] of html.matchAll(/<svg\b([^>]*)>/g)) {
    assert.match(attributes, /viewBox="0 0 [\d.]+ [\d.]+"/);
    assert.match(attributes, /role="img"/);
  }
});

test('מבנה כל עמוד: כותרת, גוף וכותרת תחתית אחת בדיוק', () => {
  for (const page of pages) {
    const rendered = renderPage(page);
    assert.equal((rendered.match(/class="whead"/g) || []).length, 1);
    assert.equal((rendered.match(/class="wbody"/g) || []).length, 1);
    assert.equal((rendered.match(/class="wfoot"/g) || []).length, 1);
    assert.match(rendered, new RegExp(`id="page-${page.n}"`));
  }
});

test('קובץ ה־CSS מקבע את חוזה A4 ואינו מסתיר גלישה', () => {
  const css = fs.readFileSync(path.join(root, 'styles', 'workbook.css'), 'utf8');
  assert.match(css, /width:\s*210mm/);
  assert.match(css, /height:\s*297mm/);
  assert.match(css, /size:\s*A4/);
  assert.equal(/overflow:\s*(auto|scroll)/.test(css), false, 'אסור overflow auto/scroll בתוך דף A4');
  assert.equal(/overflow:\s*hidden/.test(css), false, 'אסור להסתיר גלישה כפתרון');
});

test('אין הפניה ל־CDN; MathJax מוגש מ־vendor מקומי', () => {
  const build = fs.readFileSync(path.join(root, 'src', 'build.mjs'), 'utf8');
  assert.equal(/https?:\/\/[^"']*mathjax/i.test(build), false);
  assert.equal(/cdn\./i.test(html), false);
});

test('כל בלוק בגוף הדף הוא אלמנט ולא טקסט חופשי', () => {
  for (const page of pages) {
    for (const [index, block] of page.blocks.entries()) {
      assert.match(block.trim(), /^</, `עמוד ${page.n} בלוק ${index} אינו מתחיל באלמנט`);
    }
  }
});
