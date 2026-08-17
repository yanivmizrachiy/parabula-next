import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const curriculumPath = path.join(root, 'scripts', 'curriculum-map.mjs');
const topicName = 'משפט פיתגורס';
const newPageNumber = 654;

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const topic = topics.topics.find((item) => item.name === topicName);
if (!topic) throw new Error(`Missing topic: ${topicName}`);

if (!topic.pages.some((page) => page.number === newPageNumber)) {
  const afterIndex = topic.pages.findIndex((page) => page.number === 21);
  if (afterIndex < 0) throw new Error('Cannot find page 21 insertion point');
  topic.pages.splice(afterIndex + 1, 0, {
    number: newPageNumber,
    file: `עמוד-${newPageNumber}.html`,
    title: 'עמוד 34 — משפט פיתגורס',
    h1: 'משפט פיתגורס',
    topic: topicName,
    previewPath: `/עמוד-${newPageNumber}.html`,
    siteUrl: `https://yanivmizrachiy.github.io/razpages/עמוד-${newPageNumber}.html`,
    curriculumId: 'g7.geo.pythagoras',
  });
}

topic.count = topic.pages.length;
const total = topic.pages.length;

const replaceNavLink = (html, label, href) => html.replace(
  new RegExp(`(<a\\s+class="nav-link"\\s+href=")[^"]+("[^>]*>\\s*${label}\\s*</a>)`, 'u'),
  `$1${href}$2`,
);

for (let index = 0; index < topic.pages.length; index += 1) {
  const page = topic.pages[index];
  const filePath = path.join(root, page.file);
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${page.file}`);
  let html = fs.readFileSync(filePath, 'utf8');
  const h1Match = html.match(/<h1\s+class="page-title">([^<]+)<\/h1>/u);
  if (!h1Match) throw new Error(`Missing page-title in ${page.file}`);
  const h1 = h1Match[1].trim();
  const local = index + 1;

  html = html.replace(/<title>[^<]*<\/title>/u, `<title>עמוד ${local} — ${h1}</title>`);
  html = html.replace(/משפט פיתגורס — עמוד \d+ \/ \d+/u, `משפט פיתגורס — עמוד ${local} / ${total}`);
  html = html.replace(/<div class="page-number">\d+<\/div>/u, `<div class="page-number">${local}</div>`);

  if (index > 0) html = replaceNavLink(html, 'הקודם', topic.pages[index - 1].file);
  if (index < topic.pages.length - 1) html = replaceNavLink(html, 'הבא', topic.pages[index + 1].file);

  fs.writeFileSync(filePath, html, 'utf8');

  page.title = `עמוד ${local} — ${h1}`;
  page.h1 = h1;
  page.topic = topicName;
  page.previewPath = `/${page.file}`;
  page.siteUrl = `https://yanivmizrachiy.github.io/razpages/${page.file}`;
}

topics.totalPages = new Set(topics.topics.flatMap((item) => item.pages.map((page) => page.number))).size;
topics.generatedAt = new Date().toISOString();
fs.writeFileSync(topicsPath, `${JSON.stringify(topics, null, 2)}\n`, 'utf8');

let curriculum = fs.readFileSync(curriculumPath, 'utf8');
const oldAssignment = "'g7.geo.pythagoras': ['634-653', '9-30', 41, '375-380'],";
const newAssignment = "'g7.geo.pythagoras': ['634-654', '9-30', 41, '375-380'],";
if (curriculum.includes(oldAssignment)) {
  curriculum = curriculum.replace(oldAssignment, newAssignment);
} else if (!curriculum.includes(newAssignment)) {
  throw new Error('Cannot locate canonical Pythagoras curriculum assignment');
}
fs.writeFileSync(curriculumPath, curriculum, 'utf8');

console.log(`[OK] Synced ${topicName}: ${total} pages, inserted ${newPageNumber}.`);
