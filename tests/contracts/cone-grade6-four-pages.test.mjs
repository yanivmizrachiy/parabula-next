import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = [617, 618, 619, 620];
const credit1 = 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const credit2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

for (const [index, number] of pages.entries()) {
  test(`cone grade 6 page ${number} is canonical, printable and real`, () => {
    const file = path.join(root, `עמוד-${number}.html`);
    const css = path.join(root, 'styles', 'pages', `עמוד-${number}.css`);
    assert.ok(fs.existsSync(file), `missing עמוד-${number}.html`);
    assert.ok(fs.existsSync(css), `missing styles/pages/עמוד-${number}.css`);

    const html = fs.readFileSync(file, 'utf8');
    const pageCss = fs.readFileSync(css, 'utf8');

    assert.match(html, /<html lang="he" dir="rtl">/u, 'Hebrew RTL contract missing');
    assert.ok(html.includes('styles/a4-base.css'), 'A4 base stylesheet missing');
    assert.ok(html.includes(`styles/pages/עמוד-${number}.css`), 'page stylesheet missing');
    assert.ok(pageCss.includes("../topics/cone-grade6.css"), 'cone design system import missing');
    assert.ok(html.includes(`page-${number}`), 'canonical page class missing');
    assert.ok(html.includes('cone6-page'), 'cone topic class missing');
    assert.ok(html.includes('<svg'), 'each cone page must contain vector graphics');
    assert.ok(html.includes('role="img"'), 'SVG accessibility label missing');
    assert.ok(html.includes(credit1), 'first credit line missing');
    assert.ok(html.includes(credit2), 'second credit line missing');

    assert.equal(/\sstyle\s*=\s*["']/iu.test(html), false, 'inline CSS is forbidden');
    assert.equal(/\b(?:דמו|placeholder|lorem ipsum)\b/iu.test(html), false, 'demo or placeholder content is forbidden');
    assert.equal(/נפח\s+(?:ה)?חרוט|נוסחת\s+נפח/iu.test(html), false, 'cone-volume content is outside this grade-6 worksheet scope');

    const localPage = index + 1;
    assert.ok(html.includes(`חרוט — עמוד ${localPage} / 4`), 'local topic pagination is wrong');
    if (index > 0) assert.ok(html.includes(`href="עמוד-${pages[index - 1]}.html">הקודם</a>`), 'previous-page link is wrong');
    if (index < pages.length - 1) assert.ok(html.includes(`href="עמוד-${pages[index + 1]}.html">הבא</a>`), 'next-page link is wrong');
  });
}

test('cone workbook uses diverse assessment structures', () => {
  const all = pages.map(number => fs.readFileSync(path.join(root, `עמוד-${number}.html`), 'utf8')).join('\n');
  assert.ok(all.includes('shape-choice-grid'), 'visual selection task missing');
  assert.ok(all.includes('error-grid'), 'claim/error-analysis task missing');
  assert.ok(all.includes('draw-box'), 'drawing/completion task missing');
  assert.ok(all.includes('answer-lines'), 'open reasoning space missing');
  assert.ok((all.match(/<svg\b/gu) || []).length >= 10, 'expected a rich vector-graphics set across four pages');
});
