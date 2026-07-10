import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readText } from './_test-utils.mjs';

test('/preview Reader must expose topic navigation, search, and a viewer', async () => {
  const html = await readText(path.join('preview', 'index.html'));

  assert.ok(/id="topicsList"/u.test(html), 'preview/index.html: missing id="topicsList" (grouped topics sidebar)');
  assert.ok(/id="topicFilter"/u.test(html), 'preview/index.html: missing id="topicFilter" (topic filter select)');
  assert.ok(/id="searchBox"/u.test(html), 'preview/index.html: missing id="searchBox" (global search)');
  assert.ok(/id="prevBtn"/u.test(html) && /id="nextBtn"/u.test(html), 'preview/index.html: missing prev/next navigation buttons');
  assert.ok(/<iframe id="viewer"/u.test(html), 'preview/index.html: missing viewer iframe');
  assert.ok(/meta\/topics\.json/u.test(html), 'preview/index.html: must load meta/topics.json (canonical metadata)');
});

test('Preview CSS must style topic bar and not hide navigation elements', async () => {
  const css = await readText(path.join('styles', 'preview.css'));

  assert.ok(/\.reader-topics\b/u.test(css), 'styles/preview.css: missing .reader-topics style');
  assert.ok(/\.reader-topicBtn\b/u.test(css), 'styles/preview.css: missing .reader-topicBtn style');

  // Regression guard: previously a rule hid the sidebar entirely.
  assert.ok(!/\.reader-sidebar\s*\{\s*display\s*:\s*none\s*;?\s*\}/u.test(css), 'styles/preview.css: must not set .reader-sidebar { display: none }');
});

test('Golden Preview: calm background + centered host (no LTR hacks)', async () => {
  const css = await readText(path.join('styles', 'preview.css'));

  assert.ok(
    /background-color\s*:\s*var\(--bg-subtle\)/iu.test(css),
    'styles/preview.css: expected museum background to use existing token var(--bg-subtle)'
  );
  assert.ok(
    /\.reader-pageHost\s*\{[\s\S]*?display\s*:\s*flex\s*;[\s\S]*?justify-content\s*:\s*center\s*;[\s\S]*?overflow\s*:\s*hidden\s*;[\s\S]*?\}/u.test(
      css
    ),
    'styles/preview.css: expected .reader-pageHost to center content (flex) and avoid inner scrollbars'
  );
  assert.ok(
    /\.reader-pageHost\s*>\s*\.a4-page\s*\{[\s\S]*?margin\s*:\s*0\s*!important\s*;[\s\S]*?outline\s*:\s*1px\s+solid\s+var\(--border-light\)\s*;[\s\S]*?\}/u.test(
      css
    ),
    'styles/preview.css: expected injected A4 page to have stable margin reset + visible boundary outline'
  );
  assert.ok(/background-image\s*:\s*none/iu.test(css), 'styles/preview.css: expected background-image: none guards (no patterns outside A4)');
});

test('Single rules source (CLAUDE.md) must cover /preview navigation rules', async () => {
  const rules = await readText('CLAUDE.md');

  assert.ok(rules.includes('/preview'), 'CLAUDE.md: expected to mention /preview');
  assert.ok(
    rules.includes('הניווט נשאר גלוי'),
    'CLAUDE.md: missing the visible-navigation rule for the preview reader'
  );
  assert.ok(rules.includes('topic-link'), 'CLAUDE.md: missing the topic-link navigation contract');
});

test('Preview server must not serve rules.html', async () => {
  const serverCode = await readText(path.join('preview', 'server.mjs'));

  // Regression guard: rules.html is a repo-internal document and must not be exposed via preview.
  assert.ok(/rules\.html/u.test(serverCode), 'preview/server.mjs: expected to reference rules.html');
  assert.ok(
    /isForbiddenForServing\s*\([\s\S]*?rules\.html/u.test(serverCode) ||
      /relPath\s*===\s*['"]rules\.html['"]/u.test(serverCode) ||
      /pathname\s*===\s*['"]\/rules\.html['"]/u.test(serverCode),
    'preview/server.mjs: missing explicit deny rule for rules.html'
  );
  assert.ok(
    /rules\.html[\s\S]*statusCode\s*=\s*404/u.test(serverCode) ||
      /isForbiddenForServing\([\s\S]*?\)\s*\{[\s\S]*statusCode\s*=\s*404/u.test(serverCode),
    'preview/server.mjs: expected 404 response for rules.html'
  );
});

test('preview/index.html must not contain content after </html>', async () => {
  const html = await readText(path.join('preview', 'index.html'));
  const closeTag = '</html>';
  const lastIdx = html.lastIndexOf(closeTag);

  assert.ok(lastIdx !== -1, 'preview/index.html: missing </html> close tag');

  const tail = html.slice(lastIdx + closeTag.length);
  assert.ok(/^\s*$/u.test(tail), 'preview/index.html: found non-whitespace content after </html>');
});

test('Golden Preview: reader styles are external and viewer area scrolls cleanly', async () => {
  const html = await readText(path.join('preview', 'index.html'));
  const css = await readText(path.join('preview', 'reader.css'));

  assert.ok(/reader\.css/u.test(html), 'preview/index.html: must link the external reader.css (no inline styles)');
  assert.ok(!/<style>/u.test(html), 'preview/index.html: must not contain an inline <style> block');
  assert.ok(/\.viewer-wrap\s*\{[\s\S]*?overflow\s*:\s*auto/u.test(css), 'preview/reader.css: .viewer-wrap must scroll (overflow: auto)');
  assert.ok(/iframe\s*\{[\s\S]*?background\s*:\s*white/u.test(css), 'preview/reader.css: viewer iframe must keep a white page background');
  assert.ok(/aside\s*\{[\s\S]*?flex-direction\s*:\s*column/u.test(css), 'preview/reader.css: sidebar must remain a persistent column');
});
