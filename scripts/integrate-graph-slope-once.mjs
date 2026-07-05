import { readFileSync, writeFileSync } from 'node:fs';

const metaPath = 'meta/topics.json';
const catalogPath = 'catalog.html';
const topicName = 'גרף עולה, יורד ושיפוע';

const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
const newTopic = {
  name: topicName,
  count: 3,
  pages: [
    { number: 96, file: 'עמוד-96.html', title: 'עמוד 1 — גרף עולה, יורד ושיפוע', h1: 'גרף עולה, יורד או קבוע', topic: topicName, previewPath: '/עמוד-96.html', siteUrl: 'https://yanivmizrachiy.github.io/parabula-next/עמוד-96.html' },
    { number: 97, file: 'עמוד-97.html', title: 'עמוד 2 — גרף עולה, יורד ושיפוע', h1: 'גרף עולה, יורד או קבוע', topic: topicName, previewPath: '/עמוד-97.html', siteUrl: 'https://yanivmizrachiy.github.io/parabula-next/עמוד-97.html' },
    { number: 98, file: 'עמוד-98.html', title: 'עמוד 3 — גרף עולה, יורד ושיפוע', h1: 'גרף עולה, יורד או קבוע', topic: topicName, previewPath: '/עמוד-98.html', siteUrl: 'https://yanivmizrachiy.github.io/parabula-next/עמוד-98.html' }
  ]
};

meta.topics = Array.isArray(meta.topics) ? meta.topics.filter(t => t.name !== topicName) : [];
const insertAt = meta.topics.findIndex(t => t.name === 'משוואות ריבועיות');
if (insertAt >= 0) meta.topics.splice(insertAt, 0, newTopic);
else meta.topics.push(newTopic);

for (const topic of meta.topics) {
  topic.pages = Array.isArray(topic.pages) ? topic.pages : [];
  topic.count = topic.pages.length;
}
meta.totalPages = meta.topics.reduce((sum, topic) => sum + topic.pages.length, 0);
writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');

let catalog = readFileSync(catalogPath, 'utf8');
catalog = catalog.replace(/95 דפי עבודה A4 בעברית לפי נושאים/g, `${meta.totalPages} דפי עבודה A4 בעברית לפי נושאים`);
catalog = catalog.replace(/<span id="statPages" class="stat-chip">.*?<\/span>/, `<span id="statPages" class="stat-chip">${meta.totalPages} דפים</span>`);
catalog = catalog.replace(/<span id="statTopics" class="stat-chip soft">.*?<\/span>/, `<span id="statTopics" class="stat-chip soft">${meta.topics.length} נושאים</span>`);
writeFileSync(catalogPath, catalog, 'utf8');

console.log(`integrated ${topicName}: totalPages=${meta.totalPages}, topics=${meta.topics.length}`);
