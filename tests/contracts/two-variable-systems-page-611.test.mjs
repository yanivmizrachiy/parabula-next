import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'עמוד-611.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles/topics/two-variable-systems.css'), 'utf8');
const sync = JSON.parse(fs.readFileSync(path.join(root, 'meta/systems-drive-sync.json'), 'utf8'));

test('page 611 keeps five distinct application tasks', () => {
  const cards = html.match(/<section class="story-card\b/gu) ?? [];
  assert.equal(cards.length, 5, 'עמוד 611 חייב להכיל בדיוק חמישה כרטיסי משימה');
  assert.ok(html.includes('story-card-focus'), 'חסרה משימת חקר המלבן והריבוע');
  assert.ok(html.includes('story-card-parking'), 'חסרה משימת השוואת תעריפי החנייה');
});

test('page 611 preserves mathematical meaning prompts', () => {
  assert.ok(html.includes('משמעות השוויון'), 'חסר פירוש מתמטי לשוויון במשימת המלבן');
  assert.ok(html.includes('x\\ge 0'), 'חסר תחום הזמן x≥0 במשימת החנייה');
  assert.ok(html.includes('נקודת חיתוך ופירוש'), 'חסר פירוש נקודת החיתוך במשימת החנייה');
  assert.ok(html.includes('תחומי כדאיות'), 'חסרה השוואת תחומי הכדאיות');
});

test('page 611 uses compact scaffolds without shrinking primary text', () => {
  assert.ok(html.includes('model-grid-quick'), 'חסרה תבנית הפתרון הקומפקטית');
  assert.ok(css.includes('.systems2-page.systems-stories-five .story-text { margin-bottom: 2px; font-size: 13.4px;'), 'גופן המשימות חייב להישאר 13.4px');
  assert.ok(css.includes('.systems2-page.systems-stories-five .story-hint { margin-bottom: 4px; font-size: 11.2px;'), 'גופן הרמזים חייב להישאר 11.2px');
  assert.ok(css.includes('.model-grid-quick .model-wide-line { grid-column: 2 / -1; }'), 'שורת הפתרון הרחבה חסרה');
});

test('Drive provenance records canonical sources and duplicates', () => {
  const parking = sync.sources.find(source => source.role === 'summer-review-part-a-parking-comparison');
  assert.ok(parking, 'חסר תיעוד מקור משימת החנייה');
  assert.equal(parking.canonicalDriveId, '1NTT85p_RJculp4UqaOtnKHVrDhbyCChq');
  assert.deepEqual(parking.duplicateDriveIds, [
    '1BZnvM6zYFpa0geyp-rWekQu53U9Nf48_',
    '1Gg9JQ-OYlFUvyh_0d_lBH3D78d8x9bod',
  ]);
  assert.deepEqual(parking.importedToPages, [611]);
});
