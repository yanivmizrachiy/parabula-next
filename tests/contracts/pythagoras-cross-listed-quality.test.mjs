import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildPythagorasWorkbook } from '../../pythagoras-workbook-model.js';

const ROOT = process.cwd();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const meta = JSON.parse(read('meta/topics.json'));
const workbook = buildPythagorasWorkbook(meta);
const crossListed = workbook.pages.filter((page) => page.primaryTopic !== workbook.name);
const expectedCrossListed = [375, 376, 377, 378, 379, 380];

const rawUnicodeMath = /[√²³⁰¹⁴⁵⁶⁷⁸⁹]/u;

test('ששת דפי פיתגורס המשויכים גם לגאומטריה נשארים חלק קנוני מהחוברת', () => {
  assert.deepEqual(crossListed.map((page) => page.sourceNumber), expectedCrossListed);
  for (const page of crossListed) {
    assert.notEqual(page.primaryTopic, workbook.name, `עמוד-${page.sourceNumber}: ההקשר המקורי אבד`);
  }
});

test('כל ששת הדפים המשויכים-במקביל משתמשים באותה שכבת MathJax/SVG קנונית', () => {
  const issues = [];
  for (const number of expectedCrossListed) {
    const file = `עמוד-${number}.html`;
    const html = read(file);
    if (!/vendor\/mathjax\/tex-mml-chtml\.js/u.test(html)) issues.push(`${file}: חסר MathJax מקומי`);
    if (!/vendor\/mathjax\/tex-font\/chtml\/woff2/u.test(html)) issues.push(`${file}: חסר גופן TeX מקומי`);
    if (!html.includes(`styles/pages/עמוד-${number}.css`)) issues.push(`${file}: חסר CSS קנוני`);
    if (!/<svg\b/u.test(html)) issues.push(`${file}: אין SVG וקטורי`);
    if (/<canvas\b/iu.test(html)) issues.push(`${file}: Canvas אסור`);
    if (/\bkatex\b/iu.test(html)) issues.push(`${file}: KaTeX אסור`);
    if (rawUnicodeMath.test(html)) issues.push(`${file}: נמצא כתיב מתמטי Unicode גולמי`);
    if (!/פיתגורס/u.test(html)) issues.push(`${file}: אין הקשר פיתגורס גלוי`);
  }
  assert.deepEqual(issues, [], `\n${issues.join('\n')}`);
});

test('החריגות המתמטיות שכבר תוקנו אינן יכולות לחזור', () => {
  const p375 = read('עמוד-375.html');
  assert.match(p375, /\\\(\\sqrt\{13\}\\\)/u);
  assert.doesNotMatch(p375, /√13/u);

  const p378 = read('עמוד-378.html');
  assert.match(p378, /אורך שיפוע הגג 2\.69 מטר/u);
  assert.match(p378, />2\.69<\/text>/u);
  assert.doesNotMatch(p378, /אורך שיפוע הגג 2\.50 מטר/u);
  assert.doesNotMatch(p378, />2\.50<\/text>/u);

  const p380 = read('עמוד-380.html');
  assert.match(p380, /\\\(C\^2\\\)/u);
  assert.doesNotMatch(p380, /C²/u);
});
