import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// רגרסיה שדווחה ע"י יניב (2026-07-12): בקורא הקטלוג ובגלילה הרציפה בנייד,
// ה-iframe של הדף מוקטן עם transform-origin: top left, אבל בזרימת RTL
// iframe רחב מהגיליון גולש שמאלה — והדף מוצג חתוך.
// החוזה: ה-iframe חייב להיות מעוגן פיזית ל-top/left בתוך הגיליון
// (position:absolute; top:0; left:0) כך שההקטנה תמיד תואמת את נקודת המוצא.

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function ruleBody(css, selectorRe) {
  const clean = stripComments(css);
  const match = clean.match(new RegExp(`${selectorRe.source}\\s*\\{([^}]*)\\}`, 'u'));
  return match ? match[1] : null;
}

function assertAnchored(file, selectorRe, label) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  const body = ruleBody(css, selectorRe);
  assert.ok(body, `${file}: missing ${label} rule`);
  assert.match(body, /position\s*:\s*absolute/u, `${file}: ${label} must be position:absolute (RTL clip guard)`);
  assert.match(body, /top\s*:\s*0/u, `${file}: ${label} must anchor top:0`);
  assert.match(body, /left\s*:\s*0/u, `${file}: ${label} must anchor left:0 (matches transform-origin top left)`);
}

test('catalog reader sheet iframe is anchored top/left', () => {
  assertAnchored('catalog.css', /\.sheet\s+iframe/u, '.sheet iframe');
});

test('mobile scroll reader sheet iframe is anchored top/left', () => {
  assertAnchored('mobile-app.css', /\.m-sheet\s+iframe/u, '.m-sheet iframe');
});
