import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { hasRenderableTex, renderableTextFromHtml } from '../../scripts/renderable-tex.mjs';

const read = (file) => fs.readFileSync(file, 'utf8');

test('זיהוי TeX מתעלם מהגדרות MathJax, סגנון, הערות ומאפייני HTML', () => {
  const html = `
    <script>MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]]}};</script>
    <style>.fake::after { content: "\\\\(x\\\\)"; }</style>
    <!-- \\(comment-only\\) -->
    <div aria-label="\\(attribute-only\\)">טקסט רגיל</div>
  `;

  assert.equal(hasRenderableTex(html), false);
  assert.doesNotMatch(renderableTextFromHtml(html), /MathJax|attribute-only|comment-only/u);
});

test('זיהוי TeX מזהה נוסחאות inline ו-display בטקסט שניתן לרינדור', () => {
  assert.equal(hasRenderableTex('<p>חשבו: \\(3^2=9\\)</p>'), true);
  assert.equal(hasRenderableTex('<section>$$a^2+b^2=c^2$$</section>'), true);
});

test('עמודי פיתגורס ללא נוסחה אינם מסומנים רק בגלל bootstrap של MathJax', () => {
  assert.equal(hasRenderableTex(read('עמוד-635.html')), false);
  assert.equal(hasRenderableTex(read('עמוד-645.html')), false);
});

test('עמוד פיתגורס עם נוסחאות אמיתיות נשאר מזוהה כעמוד מתמטי', () => {
  assert.equal(hasRenderableTex(read('עמוד-641.html')), true);
});
