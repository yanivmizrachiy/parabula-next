import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'עמוד-616.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles/topics/two-variable-systems.css'), 'utf8');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
const sync = JSON.parse(fs.readFileSync(path.join(root, 'meta/systems-drive-sync.json'), 'utf8'));

test('page 616 is the canonical sixteenth systems page', () => {
  assert.ok(html.includes('עמוד 16 / 16'));
  assert.ok(html.includes('href="עמוד-615.html">הקודם'));
  assert.ok(html.includes('href="עמוד-531.html">הבא'));
  const topic = topics.topics.find((entry) => entry.name === 'מערכת משוואות בשני נעלמים');
  assert.equal(topic.count, 16);
  assert.equal(topic.pages.at(-1)?.number, 616);
  assert.equal(topic.pages.at(-1)?.curriculumId, 'g8.alg.systems.substitution');
});

test('page 616 preserves three distinct reasoning moves', () => {
  assert.equal((html.match(/<section class="reasoning-card/g) ?? []).length, 3);
  assert.ok(html.includes('אין חובה למצוא תחילה כל נעלם בנפרד'));
  assert.ok(html.includes('חישוב אחד בלבד'));
  assert.ok(html.includes('כתבו אי־שוויון מתאים'));
  assert.ok(html.includes('reasoning-card-structure'));
  assert.ok(html.includes('reasoning-card-one-calc'));
  assert.ok(html.includes('reasoning-card-conditions'));
});

test('reasoning layout remains print-readable', () => {
  assert.ok(css.includes('.systems2-page.systems-reasoning .reasoning-card'));
  assert.ok(css.includes('font-size: 14px'));
  assert.ok(css.includes('break-inside: avoid'));
});

test('Drive provenance maps new and duplicate-only sources', () => {
  const mitsav = sync.sources.find((source) => source.role === 'mitsav-2025-reasoning-applications');
  assert.equal(mitsav?.canonicalDriveId, '1SSym_YW1EaafAYqy4KuNw66KwkLxldFk');
  assert.deepEqual(mitsav?.importedToPages, [616]);
  const intersection = sync.sources.find((source) => source.role === 'linear-functions-intersection-worksheet');
  assert.deepEqual(intersection?.importedToPages, []);
  assert.deepEqual(intersection?.mappedWithoutDuplication?.existingCoverage, [190, 191, 192, 193, 194, 195]);
});
