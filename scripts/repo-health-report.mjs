import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const pagePattern = /^\u05e2\u05de\u05d5\u05d3-\d+\.html$/;
const cssPattern = /^\u05e2\u05de\u05d5\u05d3-\d+\.css$/;

let errors = 0;
const fail = (message) => { errors += 1; console.error(`[FAIL] ${message}`); };
const ok = (message) => console.log(`[OK] ${message}`);

console.log('=== parabula-next health report ===');
console.log(`Root: ${root}`);

if (!fs.existsSync(topicsPath)) {
  fail('meta/topics.json is missing');
} else {
  const meta = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  const topics = Array.isArray(meta.topics) ? meta.topics : [];
  const pages = topics.flatMap((topic) => (topic.pages || []).map((page) => ({ ...page, topicName: topic.name })));
  const rootPages = fs.readdirSync(root).filter((file) => pagePattern.test(file)).sort();
  const cssDir = path.join(root, 'styles', 'pages');
  const cssFiles = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter((file) => cssPattern.test(file)).sort() : [];

  console.log(`topics: ${topics.length}`);
  console.log(`totalPages: ${meta.totalPages}`);
  console.log(`pages in topics: ${pages.length}`);
  console.log(`root worksheet HTML files: ${rootPages.length}`);
  console.log(`page CSS files: ${cssFiles.length}`);

  if (meta.totalPages === pages.length) ok('totalPages matches topic entries');
  else fail(`totalPages mismatch: ${meta.totalPages} vs ${pages.length}`);

  if (rootPages.length === pages.length) ok('root HTML count matches topic entries');
  else fail(`root HTML mismatch: ${rootPages.length} vs ${pages.length}`);

  const nums = pages.map((page) => page.number);
  const duplicateNums = [...new Set(nums.filter((num, index) => nums.indexOf(num) !== index))];
  if (duplicateNums.length === 0) ok('no duplicate page numbers');
  else fail(`duplicate page numbers: ${duplicateNums.join(', ')}`);

  const files = pages.map((page) => page.file).filter(Boolean);
  const duplicateFiles = [...new Set(files.filter((file, index) => files.indexOf(file) !== index))];
  if (duplicateFiles.length === 0) ok('no duplicate page file paths');
  else fail(`duplicate page files: ${duplicateFiles.join(', ')}`);

  const inconsistentNames = pages.filter((page) => page.file !== `עמוד-${page.number}.html`);
  if (inconsistentNames.length === 0) ok('page numbers and canonical filenames agree');
  else fail(`page number/file mismatch: ${inconsistentNames.map((page) => `${page.number}:${page.file}`).join(', ')}`);

  const missingHtml = pages.filter((page) => !page.file || !fs.existsSync(path.join(root, page.file)));
  if (missingHtml.length === 0) ok('all topic HTML files exist');
  else fail(`missing HTML files: ${missingHtml.map((page) => page.file || page.number).join(', ')}`);

  const expectedHtml = new Set(files);
  const orphanHtml = rootPages.filter((file) => !expectedHtml.has(file));
  if (orphanHtml.length === 0) ok('no orphan root worksheet HTML files');
  else fail(`orphan worksheet HTML files: ${orphanHtml.join(', ')}`);

  const expectedCss = new Set(pages.map((page) => `עמוד-${page.number}.css`));
  const missingCss = pages.filter((page) => !fs.existsSync(path.join(cssDir, `עמוד-${page.number}.css`)));
  if (missingCss.length === 0) ok('all topic pages have page CSS');
  else fail(`missing page CSS for pages: ${missingCss.map((page) => page.number).join(', ')}`);

  const orphanCss = cssFiles.filter((file) => !expectedCss.has(file));
  if (orphanCss.length === 0) ok('no orphan page CSS files');
  else fail(`orphan page CSS files: ${orphanCss.join(', ')}`);

  const topicCountMismatches = topics.filter((topic) => topic.count != null && topic.count !== (topic.pages || []).length);
  if (topicCountMismatches.length === 0) ok('topic counts match their page arrays');
  else fail(`topic count mismatch: ${topicCountMismatches.map((topic) => `${topic.name}:${topic.count}/${(topic.pages || []).length}`).join(', ')}`);

  console.log('Topics:');
  for (const topic of topics) console.log(`- ${topic.name}: ${topic.count ?? (topic.pages || []).length}`);
}

if (errors > 0) {
  console.error(`[FAIL] repository health report found ${errors} issue(s)`);
  process.exit(1);
}

console.log('[SUCCESS] repository health report passed');
