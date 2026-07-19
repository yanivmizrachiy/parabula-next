import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PAGE_ASSIGNMENTS,
  PAGE_CROSS_LISTINGS,
  buildPageIndex,
  buildRelatedPageIndex,
  expandPages,
} from '../scripts/curriculum-map.mjs';

const topics = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
const flatNodes = [];
(function walk(nodes) {
  for (const node of nodes) {
    flatNodes.push(node);
    if (node.children?.length) walk(node.children);
  }
})(topics.curriculum.nodes);
const nodeById = new Map(flatNodes.map((node) => [node.id, node]));
const pages = new Map(topics.topics.flatMap((topic) => topic.pages).map((page) => [page.number, page]));

test('ארבעת דפי הזווית נשארים בבית הראשי ומוצגים גם בחוברת הרביע הראשון', () => {
  const primary = buildPageIndex();
  const related = buildRelatedPageIndex();
  const relatedPages = expandPages(PAGE_CROSS_LISTINGS['g7.num.directed.axesFirst']);
  for (const number of relatedPages) {
    assert.equal(primary.get(number), 'g7.geo.angles.concept');
    assert.deepEqual(related.get(number), ['g7.num.directed.axesFirst']);
    assert.equal(pages.get(number).curriculumId, 'g7.geo.angles.concept');
    assert.deepEqual(pages.get(number).relatedCurriculumIds, ['g7.num.directed.axesFirst']);
  }
});

test('מונה הרביע הראשון נגזר מ-30 דפי הליבה ועוד ארבעת דפי ההמשך', () => {
  const primaryPages = expandPages(PAGE_ASSIGNMENTS['g7.num.directed.axesFirst']);
  const relatedPages = expandPages(PAGE_CROSS_LISTINGS['g7.num.directed.axesFirst']);
  const expected = new Set([...primaryPages, ...relatedPages]);
  const node = nodeById.get('g7.num.directed.axesFirst');
  assert.equal(node.directCount, expected.size);
  assert.equal(node.pageCount, expected.size);
  assert.deepEqual(new Set(node.pages), expected);
});

test('שני הקוראים מכירים relatedCurriculumIds ושומרים את הקשר הצומת הפעיל', () => {
  for (const file of ['catalog.js', 'mobile-app.js']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /relatedCurriculumIds/);
    assert.match(source, /pageBelongsToNode/);
    assert.match(source, /activeNodeOf/);
  }
});
