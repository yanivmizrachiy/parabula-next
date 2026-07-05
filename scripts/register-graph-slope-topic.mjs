import { readFileSync, writeFileSync } from 'node:fs';

const metaPath = 'meta/topics.json';
const extensionPath = 'meta/topics.graph-slope.json';
const catalogPath = 'catalog.html';

const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
const extension = JSON.parse(readFileSync(extensionPath, 'utf8'));

if (!Array.isArray(meta.topics)) throw new Error('meta/topics.json missing topics array');
if (!Array.isArray(extension.topics)) throw new Error('meta/topics.graph-slope.json missing topics array');

const byName = new Map(meta.topics.map(topic => [topic.name, topic]));
for (const topic of extension.topics) {
  if (!topic?.name) throw new Error('extension topic missing name');
  byName.set(topic.name, topic);
}

meta.topics = [...byName.values()];
for (const topic of meta.topics) {
  topic.pages = Array.isArray(topic.pages) ? topic.pages : [];
  topic.count = topic.pages.length;
}
meta.totalPages = meta.topics.reduce((sum, topic) => sum + topic.pages.length, 0);
meta.generatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '');

writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

let catalog = readFileSync(catalogPath, 'utf8');
catalog = catalog.replace(/95 דפי עבודה A4 בעברית לפי נושאים/g, `${meta.totalPages} דפי עבודה A4 בעברית לפי נושאים`);
catalog = catalog.replace(/<span id="statPages" class="stat-chip">.*?<\/span>/, `<span id="statPages" class="stat-chip">${meta.totalPages} דפים</span>`);
catalog = catalog.replace(/<span id="statTopics" class="stat-chip soft">.*?<\/span>/, `<span id="statTopics" class="stat-chip soft">${meta.topics.length} נושאים</span>`);
writeFileSync(catalogPath, catalog, 'utf8');

console.log(`Registered graph-slope topic. totalPages=${meta.totalPages}; topics=${meta.topics.length}`);
