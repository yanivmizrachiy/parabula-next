import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const pagePattern = /^\u05e2\u05de\u05d5\u05d3-\d+\.html$/;
const cssPattern = /^\u05e2\u05de\u05d5\u05d3-\d+\.css$/;

let errors = 0;
const fail = message => { errors += 1; console.error(`[FAIL] ${message}`); };
const ok = message => console.log(`[OK] ${message}`);

console.log('=== parabula-next health report ===');
console.log(`Root: ${root}`);

if (!fs.existsSync(topicsPath)) {
  fail('meta/topics.json is missing');
} else {
  const meta = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  const topics = Array.isArray(meta.topics) ? meta.topics : [];
  const pages = topics.flatMap(topic => (topic.pages || []).map(page => ({ ...page, topicName: topic.name })));
  const rootPages = fs.readdirSync(root).filter(file => pagePattern.test(file));
  const cssDir = path.join(root, 'styles', 'pages');
  const cssFiles = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter(file => cssPattern.test(file)) : [];

  console.log(`topics: ${topics.length}`);
  console.log(`totalPages: ${meta.totalPages}`);
  console.log(`pages in topics: ${pages.length}`);
  console.log(`root worksheet HTML files: ${rootPages.length}`);
  console.log(`page CSS files: ${cssFiles.length}`);

  if (meta.totalPages === pages.length) ok('totalPages matches topic entries');
  else fail(`totalPages mismatch: ${meta.totalPages} vs ${pages.length}`);

  if (rootPages.length === pages.length) ok('root HTML count matches topic entries');
  else fail(`root HTML mismatch: ${rootPages.length} vs ${pages.length}`);

  const nums = pages.map(page => page.number);
  const duplicateNums = [...new Set(nums.filter((num, index) => nums.indexOf(num) !== index))];
  if (duplicateNums.length === 0) ok('no duplicate page numbers');
  else fail(`duplicate page numbers: ${duplicateNums.join(', ')}`);

  const missingHtml = pages.filter(page => !page.file || !fs.existsSync(path.join(root, page.file)));
  if (missingHtml.length === 0) ok('all topic HTML files exist');
  else fail(`missing HTML files: ${missingHtml.map(page => page.file || page.number).join(', ')}`);

  const missingCss = pages.filter(page => !fs.existsSync(path.join(cssDir, `\u05e2\u05de\u05d5\u05d3-${page.number}.css`)));
  if (missingCss.length === 0) ok('all topic pages have page CSS');
  else fail(`missing page CSS for pages: ${missingCss.map(page => page.number).join(', ')}`);

  console.log('Topics:');
  for (const topic of topics) console.log(`- ${topic.name}: ${topic.count ?? (topic.pages || []).length}`);
}

if (errors > 0) {
  console.error(`[FAIL] repository health report found ${errors} issue(s)`);
  process.exit(1);
}

console.log('[SUCCESS] repository health report passed');
