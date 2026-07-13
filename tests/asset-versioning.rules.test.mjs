import test from 'node:test';
import assert from 'node:assert/strict';
import { versionizeHtml, assertMathjaxVersioned } from '../scripts/lib/versionize-assets.mjs';

// רגרסיה שדווחה ע"י יניב (2026-07-12): אחרי שדרוג MathJax 3→4, דפדפן/PWA שהחזיקו
// מנוע MathJax ישן ב-cache רינדרו תוכן חדש שבור (סימן שווה וסמלים). השורש: סקריפט
// MathJax וה-CSS נטענו ללא גרסה, ולכן ה-build לא אילץ טעינה טרייה. החוזה: build
// מזריק ?v=<buildVersion> לכל נכס שעלול לשבור תוכן חדש (§6: גרסה אחת מה-build).

const HEAD = `<script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
<link rel="stylesheet" href="vendor/fonts/rubik.css" />
<link rel="stylesheet" href="styles/a4-base.css" />
<link rel="stylesheet" href="styles/pages/עמוד-58.css" />`;

test('versionizeHtml stamps the MathJax engine', () => {
  const out = versionizeHtml(HEAD, 'abc123');
  assert.match(out, /tex-mml-chtml\.js\?v=abc123"/);
  assert.doesNotMatch(out, /tex-mml-chtml\.js"/, 'no bare MathJax src may remain');
});

test('versionizeHtml stamps every stylesheet link', () => {
  const out = versionizeHtml(HEAD, 'abc123');
  assert.match(out, /rubik\.css\?v=abc123"/);
  assert.match(out, /a4-base\.css\?v=abc123"/);
  assert.match(out, /עמוד-58\.css\?v=abc123"/);
});

test('versionizeHtml is idempotent — re-stamps instead of chaining', () => {
  const once = versionizeHtml(HEAD, 'v1');
  const twice = versionizeHtml(once, 'v2');
  assert.match(twice, /tex-mml-chtml\.js\?v=v2"/);
  assert.doesNotMatch(twice, /\?v=v1/, 'old version must be replaced, not duplicated');
  assert.equal((twice.match(/\?v=/g) || []).length, (once.match(/\?v=/g) || []).length);
});

test('assertMathjaxVersioned throws on a bare engine, passes when stamped', () => {
  assert.throws(() => assertMathjaxVersioned(HEAD, 'x.html'), /Unversioned MathJax/);
  assert.doesNotThrow(() => assertMathjaxVersioned(versionizeHtml(HEAD, 'v'), 'x.html'));
});
