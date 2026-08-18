import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const baseCss = fs.readFileSync('sources/lovable/ratio-workbook/src/ratio-v2.css', 'utf8');
const layoutCss = fs.readFileSync('sources/lovable/ratio-workbook/src/ratio-layout-fixes.css', 'utf8');

function ruleBody(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing CSS rule: ${selector}`);
  return match[1];
}

function expectCanonicalBox(body) {
  assert.match(body, /height:\s*30px\s*;/);
  assert.match(body, /border:\s*1\.35px\s+solid\s+#1f2a44\s*;/i);
  assert.match(body, /border-radius:\s*8px\s*;/);
  assert.match(body, /background:\s*#fff\s*;/i);
  assert.match(body, /box-shadow:\s*0\s+1px\s+2px\s+rgba\(15,\s*23,\s*42,\s*0\.12\)\s*;/i);
}

test('ratio and ordered-pair boxes use the canonical print answer-box style', () => {
  expectCanonicalBox(ruleBody(baseCss, '.ratio-answer-box'));
  expectCanonicalBox(ruleBody(layoutCss, '.ordered-pair-box'));
});

test('dense layouts never shrink ratio answer boxes below the canonical 30px height', () => {
  for (const selector of [
    '.ratio-answer-container.is-inline .ratio-answer-box',
    '.response-set .ratio-answer-box',
  ]) {
    const body = ruleBody(layoutCss, selector);
    assert.match(body, /height:\s*30px\s*;/);
    assert.doesNotMatch(body, /height:\s*(?:[12][0-9])px\s*;/);
  }
});
