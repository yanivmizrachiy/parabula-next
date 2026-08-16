import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function getPages() {
  return fs.readdirSync(root).filter(name => /^עמוד-\d+\.html$/.test(name));
}

test('root pages exist', () => {
  const pages = getPages();
  assert.ok(pages.length > 0, 'No root pages found');
});

for (const file of getPages()) {
  test(`contract ${file}`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const n = file.match(/^עמוד-(\d+)\.html$/)?.[1];

    assert.ok(html.includes(`page-${n}`), `${file}: missing page-${n}`);
    assert.equal(/\sstyle\s*=\s*["']/.test(html), false, `${file}: inline CSS is forbidden`);
    assert.ok(html.includes('styles/a4-base.css'), `${file}: missing a4-base.css`);
    assert.ok(html.includes(`styles/pages/עמוד-${n}.css`), `${file}: missing page css`);

    const imgMatches = Array.from(html.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/giu));
    for (const [, src] of imgMatches) {
      if (!src.startsWith('pages/משוואות/assets/')) continue;
      const assetPath = path.join(root, src.replaceAll('/', path.sep));
      assert.ok(fs.existsSync(assetPath), `${file}: missing equations asset ${src}`);
    }
  });
}