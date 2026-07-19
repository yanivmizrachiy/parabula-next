import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const EXPECTED_MAIN_SHA = 'cafaa58e7959b3490c87c42b32205ccb4470ca25';
const OLD_FEATURE_SHA = '7f9c1a9cb9eee1c5aba437c9da7febcf3a0abc8e';
const FEATURE_BRANCH = 'feat/rectangle-self-study';
const BOOTSTRAP_BRANCH = 'automation/rectangle-bootstrap-20260719';
const OLD_AUTOMATION_BRANCH = 'automation/rectangle-sync-20260719';
const OLD_START = 395;
const PAGE_COUNT = 7;
const TOPIC_NAME = 'מלבן לכיתה ז׳';
const CURRICULUM_ID = 'g7.geo.quads.rectSquare';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = exec('git', ['rev-parse', '--show-toplevel'], { cwd: here }).trim();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rectangle-bootstrap-'));
const sourceDir = path.join(tempRoot, 'source');
const finalDir = path.join(tempRoot, 'final');
fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(finalDir, { recursive: true });

function exec(command, args, options = {}) {
  const cwd = options.cwd || repo || process.cwd();
  const text = execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, ...(options.env || {}) }
  });
  return typeof text === 'string' ? text : '';
}

function run(command, args, options = {}) {
  console.log(`>> ${command} ${args.join(' ')}`);
  execFileSync(command, args, {
    cwd: options.cwd || repo,
    stdio: 'inherit',
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, ...(options.env || {}) }
  });
}

function gitShow(ref, relPath) {
  return exec('git', ['show', `${ref}:${relPath}`]);
}

function write(relPath, content) {
  const absolute = path.join(repo, relPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content, 'utf8');
}

function copyToFinal(relPath) {
  const source = path.join(repo, relPath);
  const target = path.join(finalDir, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function restoreFromFinal(relPath) {
  const source = path.join(finalDir, relPath);
  const target = path.join(repo, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function extractContract(claude) {
  const pattern = /(?:^|\n)(### 4\.2\.1 חוזה חוברת „מלבן לכיתה ז׳” — למידה עצמית[\s\S]*?)(?=\n---\s*\n|\n## 4\.3\b)/m;
  const match = claude.match(pattern);
  if (!match) throw new Error('Rectangle contract was not found in the feature CLAUDE.md');
  return match[1].trim();
}

function mergeContract(mainClaude, contract) {
  const pattern = /(?:^|\n)### 4\.2\.1 חוזה חוברת „מלבן לכיתה ז׳” — למידה עצמית[\s\S]*?(?=\n---\s*\n|\n## 4\.3\b)/m;
  if (pattern.test(mainClaude)) {
    return mainClaude.replace(pattern, `\n${contract}\n`);
  }
  const section43 = mainClaude.search(/^## 4\.3\b/m);
  if (section43 < 0) throw new Error('Section 4.3 was not found in main CLAUDE.md');
  const separator = mainClaude.lastIndexOf('\n---', section43);
  const insertAt = separator >= 0 ? separator : section43;
  return `${mainClaude.slice(0, insertAt).trimEnd()}\n\n${contract}\n\n${mainClaude.slice(insertAt).trimStart()}`;
}

function replaceRequired(text, regex, replacement, label) {
  if (!regex.test(text)) throw new Error(`Could not locate ${label}`);
  regex.lastIndex = 0;
  return text.replace(regex, replacement);
}

function renumberPage(html, localNumber, newStart) {
  const globalNumber = newStart + localNumber - 1;
  for (let i = 0; i < PAGE_COUNT; i++) {
    const oldNumber = OLD_START + i;
    const newNumber = newStart + i;
    html = html.replaceAll(`עמוד-${oldNumber}`, `עמוד-${newNumber}`);
    html = html.replaceAll(`page-${oldNumber}`, `page-${newNumber}`);
  }

  const previous = localNumber === 1
    ? '<div class="nav-side"><span class="nav-link is-disabled" aria-disabled="true">הקודם</span></div>'
    : `<div class="nav-side"><a class="nav-link" href="עמוד-${globalNumber - 1}.html">הקודם</a></div>`;
  const next = localNumber === PAGE_COUNT
    ? '<div class="nav-side"><span class="nav-link is-disabled" aria-disabled="true">הבא</span></div>'
    : `<div class="nav-side"><a class="nav-link" href="עמוד-${globalNumber + 1}.html">הבא</a></div>`;

  html = replaceRequired(
    html,
    /<div class="nav-side">(?:<a class="nav-link" href="עמוד-\d+\.html">הקודם<\/a>|<span class="nav-link is-disabled" aria-disabled="true">הקודם<\/span>)<\/div>/,
    previous,
    `previous navigation on local page ${localNumber}`
  );
  html = replaceRequired(
    html,
    /<div class="nav-meta">.*?<\/div>/,
    `<div class="nav-meta">${TOPIC_NAME} — עמוד ${localNumber} / ${PAGE_COUNT}</div>`,
    `navigation metadata on local page ${localNumber}`
  );
  html = replaceRequired(
    html,
    /<div class="nav-side">(?:<a class="nav-link" href="עמוד-\d+\.html">הבא<\/a>|<span class="nav-link is-disabled" aria-disabled="true">הבא<\/span>)<\/div>/,
    next,
    `next navigation on local page ${localNumber}`
  );
  html = replaceRequired(
    html,
    /<a class="topic-link is-active" href="עמוד-\d+\.html" aria-current="page">מלבן לכיתה ז׳<\/a>/,
    `<a class="topic-link is-active" href="עמוד-${newStart}.html" aria-current="page">${TOPIC_NAME}</a>`,
    `topic navigation on local page ${localNumber}`
  );

  if (/<style(?:\s|>)|\sstyle\s*=/.test(html)) throw new Error(`Inline CSS found on local page ${localNumber}`);
  if (!html.includes(`styles/pages/עמוד-${globalNumber}.css`)) throw new Error(`CSS reference was not renumbered on local page ${localNumber}`);
  if (!html.includes(`page-${globalNumber} geo7-page`)) throw new Error(`Page class was not renumbered on local page ${localNumber}`);
  for (let i = 0; i < PAGE_COUNT; i++) {
    const oldNumber = OLD_START + i;
    if (html.includes(`עמוד-${oldNumber}`) || html.includes(`page-${oldNumber}`)) {
      throw new Error(`Old page reference ${oldNumber} remains on local page ${localNumber}`);
    }
  }
  return html;
}

function rebuildCurriculum(data) {
  const pageMap = new Map();
  for (const topic of data.topics) {
    topic.count = topic.pages.length;
    for (const page of topic.pages) {
      if (!page.curriculumId) throw new Error(`${page.file} is missing curriculumId`);
      const list = pageMap.get(page.curriculumId) || [];
      list.push(page.number);
      pageMap.set(page.curriculumId, list);
    }
  }

  let found = false;
  let totalNodes = 0;
  let leafNodes = 0;
  let emptyLeafNodes = 0;
  function rebuild(node) {
    totalNodes++;
    const directPages = [...new Set(pageMap.get(node.id) || [])].sort((a, b) => a - b);
    node.directCount = directPages.length;
    if (directPages.length) node.pages = directPages;
    else delete node.pages;
    if (node.id === CURRICULUM_ID) found = true;
    const children = node.children || [];
    if (!children.length) {
      leafNodes++;
      if (!directPages.length) emptyLeafNodes++;
    }
    const childPages = children.reduce((sum, child) => sum + rebuild(child), 0);
    node.pageCount = node.directCount + childPages;
    return node.pageCount;
  }
  for (const node of data.curriculum.nodes) rebuild(node);
  if (!found) throw new Error(`Curriculum node not found: ${CURRICULUM_ID}`);
  data.curriculum.totalNodes = totalNodes;
  data.curriculum.leafNodes = leafNodes;
  data.curriculum.emptyLeafNodes = emptyLeafNodes;
}

console.log('Rectangle bootstrap: locking remote refs');
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['fetch', '--prune', 'origin', 'main', FEATURE_BRANCH]);
const currentMain = exec('git', ['rev-parse', 'origin/main']).trim();
const currentFeature = exec('git', ['rev-parse', `origin/${FEATURE_BRANCH}`]).trim();
if (currentMain !== EXPECTED_MAIN_SHA) throw new Error(`main moved: expected=${EXPECTED_MAIN_SHA} current=${currentMain}`);
if (currentFeature !== OLD_FEATURE_SHA) throw new Error(`feature moved: expected=${OLD_FEATURE_SHA} current=${currentFeature}`);

console.log('Rectangle bootstrap: preserving source pages and contract');
for (let i = 0; i < PAGE_COUNT; i++) {
  fs.writeFileSync(path.join(sourceDir, `page-${i + 1}.html`), gitShow(`origin/${FEATURE_BRANCH}`, `עמוד-${OLD_START + i}.html`), 'utf8');
}
const contract = extractContract(gitShow(`origin/${FEATURE_BRANCH}`, 'CLAUDE.md'));
fs.writeFileSync(path.join(sourceDir, 'contract.md'), `${contract}\n`, 'utf8');

console.log('Rectangle bootstrap: resetting worktree to locked main');
run('git', ['reset', '--hard', EXPECTED_MAIN_SHA]);
run('git', ['clean', '-fdx']);

const rootPageNumbers = fs.readdirSync(repo)
  .map(file => file.match(/^עמוד-(\d+)\.html$/))
  .filter(Boolean)
  .map(match => Number(match[1]));
if (!rootPageNumbers.length) throw new Error('No canonical root pages found');
const newStart = Math.max(...rootPageNumbers) + 1;
const newEnd = newStart + PAGE_COUNT - 1;
console.log(`Rectangle bootstrap: new canonical range ${newStart}-${newEnd}`);

for (let local = 1; local <= PAGE_COUNT; local++) {
  const globalNumber = newStart + local - 1;
  const html = renumberPage(fs.readFileSync(path.join(sourceDir, `page-${local}.html`), 'utf8'), local, newStart);
  write(`עמוד-${globalNumber}.html`, html);
  write(`styles/pages/עמוד-${globalNumber}.css`, "@import url('../topics/geometry7.css');\n");
}

const mainClaude = fs.readFileSync(path.join(repo, 'CLAUDE.md'), 'utf8');
write('CLAUDE.md', `${mergeContract(mainClaude, contract).trimEnd()}\n`);

const topicsPath = path.join(repo, 'meta/topics.json');
const data = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
data.topics = data.topics.filter(topic => topic.name !== TOPIC_NAME);
const existingFiles = new Set(data.topics.flatMap(topic => topic.pages.map(page => page.file)));
const newPages = Array.from({ length: PAGE_COUNT }, (_, index) => {
  const number = newStart + index;
  const file = `עמוד-${number}.html`;
  if (existingFiles.has(file)) throw new Error(`Metadata already contains ${file}`);
  return {
    number,
    file,
    title: `עמוד ${index + 1} — ${TOPIC_NAME}`,
    h1: TOPIC_NAME,
    topic: TOPIC_NAME,
    previewPath: `/${file}`,
    siteUrl: `${data.siteUrl}${file}`,
    curriculumId: CURRICULUM_ID
  };
});
data.topics.push({ name: TOPIC_NAME, count: newPages.length, pages: newPages });
rebuildCurriculum(data);
data.totalPages = data.topics.reduce((sum, topic) => sum + topic.pages.length, 0);
data.generatedAt = new Date().toISOString();
const rootCount = fs.readdirSync(repo).filter(file => /^עמוד-\d+\.html$/.test(file)).length;
if (data.totalPages !== rootCount) throw new Error(`Metadata/root mismatch: metadata=${data.totalPages} root=${rootCount}`);
if (data.totalPages !== newEnd) throw new Error(`Expected contiguous total ${newEnd}, found ${data.totalPages}`);
write('meta/topics.json', `${JSON.stringify(data, null, 2)}\n`);
run('node', ['scripts/generate-pages-registry.mjs']);

const intended = ['CLAUDE.md', 'meta/topics.json', 'meta/pages.json'];
for (let number = newStart; number <= newEnd; number++) {
  intended.push(`עמוד-${number}.html`, `styles/pages/עמוד-${number}.css`);
}

console.log('Rectangle bootstrap: installing root dependencies and browser');
run('npm', ['ci']);
run('npx', ['playwright', 'install', 'chromium', '--with-deps']);
console.log('Rectangle bootstrap: running maximum validation');
run('npm', ['run', 'tech:max']);

for (const relPath of intended) copyToFinal(relPath);
console.log('Rectangle bootstrap: discarding every generated side effect');
run('git', ['reset', '--hard', EXPECTED_MAIN_SHA]);
run('git', ['clean', '-fdx']);
for (const relPath of intended) restoreFromFinal(relPath);

const statusLines = exec('git', ['status', '--porcelain=v1', '--untracked-files=all'])
  .split(/\r?\n/)
  .filter(Boolean);
const allowed = new Set(intended);
for (const line of statusLines) {
  const relPath = line.slice(3).split(' -> ').at(-1);
  if (!allowed.has(relPath)) throw new Error(`Unexpected final path: ${relPath}`);
}

run('git', ['add', '--', ...intended]);
run('git', ['diff', '--cached', '--check']);
run('git', ['commit', '-m', `feat(מלבן): אצווה ראשונה נקייה בעמודים ${newStart}–${newEnd}`]);
const finalSha = exec('git', ['rev-parse', 'HEAD']).trim();
const runId = process.env.GITHUB_RUN_ID || Date.now().toString();
const backupBranch = `backup/rectangle-self-study-${runId}`;
run('git', ['branch', backupBranch, OLD_FEATURE_SHA]);
run('git', ['push', 'origin', `${backupBranch}:refs/heads/${backupBranch}`]);
run('git', ['push', `--force-with-lease=refs/heads/${FEATURE_BRANCH}:${OLD_FEATURE_SHA}`, 'origin', `HEAD:refs/heads/${FEATURE_BRANCH}`]);

for (const branch of [BOOTSTRAP_BRANCH, OLD_AUTOMATION_BRANCH]) {
  try {
    run('git', ['push', 'origin', '--delete', branch]);
  } catch (error) {
    console.warn(`Cleanup warning for ${branch}: ${error.message}`);
  }
}

console.log(JSON.stringify({
  status: 'success',
  mainSha: EXPECTED_MAIN_SHA,
  previousFeatureSha: OLD_FEATURE_SHA,
  finalSha,
  backupBranch,
  newStart,
  newEnd,
  validation: 'npm run tech:max'
}, null, 2));
