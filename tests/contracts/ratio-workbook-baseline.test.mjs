import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const firstGlobalPage = 272;
const pageCount = 48;
const lastGlobalPage = firstGlobalPage + pageCount - 1;
const previousTopicPage = 600;
const nextTopicPage = 561;
const footerLine1 = 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const footerLine2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

function readPage(globalPage) {
  return fs.readFileSync(path.join(root, `עמוד-${globalPage}.html`), 'utf8');
}

test('ratio keeps exactly 48 canonical pages with stable numbering', () => {
  for (let localPage = 1; localPage <= pageCount; localPage += 1) {
    const globalPage = firstGlobalPage + localPage - 1;
    const file = path.join(root, `עמוד-${globalPage}.html`);
    assert.ok(fs.existsSync(file), `Missing ratio page ${globalPage}`);

    const html = readPage(globalPage);
    assert.match(html, new RegExp(`<title>עמוד ${localPage} — יחס</title>`), `עמוד-${globalPage}.html: wrong local title`);
    assert.ok(html.includes(`class="a4-page page-${globalPage}`), `עמוד-${globalPage}.html: missing global page class`);
    assert.ok(html.includes(`יחס — עמוד ${localPage} / ${pageCount}`), `עמוד-${globalPage}.html: wrong navigation metadata`);
    assert.ok(html.includes(`styles/pages/עמוד-${globalPage}.css`), `עמוד-${globalPage}.html: missing page stylesheet`);
    assert.ok(html.includes(footerLine1), `עמוד-${globalPage}.html: missing footer line 1`);
    assert.ok(html.includes(footerLine2), `עמוד-${globalPage}.html: missing footer line 2`);
  }

  assert.equal(lastGlobalPage, 319);
});

test('ratio preserves the full-book previous and next chain', () => {
  for (let localPage = 1; localPage <= pageCount; localPage += 1) {
    const globalPage = firstGlobalPage + localPage - 1;
    const html = readPage(globalPage);
    const expectedPrevious = localPage === 1 ? previousTopicPage : globalPage - 1;
    const expectedNext = localPage === pageCount ? nextTopicPage : globalPage + 1;

    assert.ok(html.includes(`href="עמוד-${expectedPrevious}.html">הקודם</a>`), `עמוד-${globalPage}.html: wrong previous link`);
    assert.ok(html.includes(`href="עמוד-${expectedNext}.html">הבא</a>`), `עמוד-${globalPage}.html: wrong next link`);
  }
});
