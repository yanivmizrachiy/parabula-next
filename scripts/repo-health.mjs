import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = (rel) => fs.existsSync(join(rel));
const now = new Date().toISOString();

const errors = [];
const warnings = [];
const info = [];

function error(message) { errors.push(message); }
function warning(message) { warnings.push(message); }
function safeReadJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(join(rel), 'utf8'));
  } catch (err) {
    error(`${rel} could not be read as JSON: ${err.message}`);
    return null;
  }
}

const rootPages = fs.readdirSync(root)
  .filter((file) => /^עמוד-\d+\.html$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0));

const meta = safeReadJson('meta/topics.json');

if (meta) {
  const topics = Array.isArray(meta.topics) ? meta.topics : [];
  const metadataFiles = [];
  const topicNames = new Set();

  if (!topics.length) error('meta/topics.json has no topics');

  for (const topic of topics) {
    if (!topic?.name) error('metadata contains a topic without a name');
    if (topicNames.has(topic.name)) error(`duplicate topic name: ${topic.name}`);
    topicNames.add(topic.name);

    const pages = Array.isArray(topic.pages) ? topic.pages : [];
    if (!pages.length) warning(`empty topic: ${topic.name}`);
    if (Number(topic.count) !== pages.length) {
      warning(`topic count mismatch: ${topic.name}; count=${topic.count}; actual=${pages.length}`);
    }

    pages.forEach((page, index) => {
      if (!page?.file) {
        error(`page without file in topic: ${topic.name}`);
        return;
      }
      metadataFiles.push(page.file);

      if (!exists(page.file)) error(`metadata points to missing root page: ${page.file}`);

      const cssPath = `styles/pages/${page.file.replace(/\.html$/, '.css')}`;
      if (!exists(cssPath)) warning(`missing page css for ${page.file}: expected ${cssPath}`);

      const title = String(page.title || page.h1 || '');
      const localTitleMatch = title.match(/עמוד\s+(\d+)/);
      if (localTitleMatch) {
        const titleIndex = Number(localTitleMatch[1]);
        const metadataPosition = index + 1;
        if (titleIndex !== metadataPosition) {
          warning(`topic-local order mismatch: topic="${topic.name}" file="${page.file}" titlePage=${titleIndex} metadataPosition=${metadataPosition}`);
        }
      }

      if (page.previewPath && !String(page.previewPath).endsWith(page.file)) {
        warning(`previewPath mismatch for ${page.file}: ${page.previewPath}`);
      }
    });
  }

  const duplicateFiles = metadataFiles.filter((file, index) => metadataFiles.indexOf(file) !== index);
  [...new Set(duplicateFiles)].forEach((file) => error(`duplicate metadata file entry: ${file}`));

  const metadataSet = new Set(metadataFiles);
  rootPages.filter((file) => !metadataSet.has(file)).forEach((file) => error(`root page missing from metadata: ${file}`));
  metadataFiles.filter((file) => !rootPages.includes(file)).forEach((file) => error(`metadata page missing on disk: ${file}`));

  if (Number(meta.totalPages) !== metadataFiles.length) {
    warning(`meta.totalPages mismatch: totalPages=${meta.totalPages}; actual=${metadataFiles.length}`);
  }

  info.push(`root_pages=${rootPages.length}`);
  info.push(`metadata_pages=${metadataFiles.length}`);
  info.push(`topics=${topics.length}`);
}

let changedFiles = [];
try {
  changedFiles = childProcess.execSync('git diff --name-only', { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
} catch {}

const protectedChanged = changedFiles.filter((file) => (
  /^עמוד-\d+\.html$/.test(file)
  || file.startsWith('styles/pages/')
  || file === 'styles/a4-base.css'
));

if (protectedChanged.length) {
  error(`protected worksheet source files changed: ${protectedChanged.join(', ')}`);
}

const status = errors.length ? 'FAIL' : warnings.length ? 'WARN' : 'PASS';
fs.mkdirSync(join('STATE'), { recursive: true });

const md = [
  '# PROJECT_HEALTH',
  '',
  `Generated: ${now}`,
  '',
  `Status: ${status}`,
  '',
  '## Summary',
  '',
  ...info.map((item) => `- ${item}`),
  `- errors=${errors.length}`,
  `- warnings=${warnings.length}`,
  '',
  '## Errors',
  '',
  ...(errors.length ? errors.map((item) => `- ${item}`) : ['- none']),
  '',
  '## Warnings',
  '',
  ...(warnings.length ? warnings.map((item) => `- ${item}`) : ['- none']),
  '',
  '## Protected source safety',
  '',
  protectedChanged.length
    ? `- PROBLEM: protected files changed: ${protectedChanged.join(', ')}`
    : '- OK: no protected worksheet source file is changed in the working diff.',
  '',
  '## Current blocker',
  '',
  '- Final real-phone validation is still required before PR approval or merge.',
  '- `עמוד מלא` must show the full A4 width without right-side clipping.',
  '- `קריאה מוגדלת` may pan/scroll only when it is intentional and comfortable.',
  ''
].join('\n');

fs.writeFileSync(join('STATE/PROJECT_HEALTH.md'), md, 'utf8');
fs.writeFileSync(join('STATE/PROJECT_HEALTH.json'), JSON.stringify({ generatedAt: now, status, info, errors, warnings, protectedChanged }, null, 2) + '\n', 'utf8');

console.log(md);
if (process.argv.includes('--strict') && errors.length) process.exit(1);
