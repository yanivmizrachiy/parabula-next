import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const sourcePath = 'projects/coordinate-first-quadrant-workbook/src/build.mjs';
const previousBootstrap = '97bf6e6d46c93e47e554409d9a5bcbc85dcbd78b';
const diagnosticPath = '/tmp/rectangle-bootstrap-diagnostic.mjs';

let source = execFileSync('git', ['show', `${previousBootstrap}:${sourcePath}`], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});

source = source.replace(
  "const repo = exec('git', ['rev-parse', '--show-toplevel'], { cwd: here }).trim();",
  "const repo = process.env.RECTANGLE_REPO; if (!repo) throw new Error('RECTANGLE_REPO is not set');"
);
source = source.replaceAll(
  "run('git', ['clean', '-fdx']);",
  "run('git', ['clean', '-fdx', '-e', 'projects/coordinate-first-quadrant-workbook/audit/build.log']);"
);
source = source.replace(
  "run('npm', ['ci']);\nrun('npx', ['playwright', 'install', 'chromium', '--with-deps']);\nconsole.log('Rectangle bootstrap: running maximum validation');\nrun('npm', ['run', 'tech:max']);",
  "run('npm', ['ci']);\nrun('npm', ['install', '--no-save', '--package-lock=false', 'node@22']);\nprocess.env.PATH = `${path.join(repo, 'node_modules', '.bin')}:${process.env.PATH}`;\nrun('node', ['--version']);\nrun('npx', ['playwright', 'install', 'chromium', 'webkit', '--with-deps']);\nconsole.log('Rectangle bootstrap: running maximum validation under Node 22');\nrun('npm', ['run', 'tech:max']);"
);
source = source.replace(
  "}\n\nconst mainClaude = fs.readFileSync(path.join(repo, 'CLAUDE.md'), 'utf8');",
  `}

const previousTopicLast = 319;
const nextTopicFirst = 31;
const firstWorkbookFile = \`עמוד-\${newStart}.html\`;
const lastWorkbookFile = \`עמוד-\${newEnd}.html\`;
let firstWorkbookHtml = fs.readFileSync(path.join(repo, firstWorkbookFile), 'utf8');
firstWorkbookHtml = replaceRequired(
  firstWorkbookHtml,
  /<div class="nav-side"><span class="nav-link is-disabled" aria-disabled="true">הקודם<\\/span><\\/div>/,
  \`<div class="nav-side"><a class="nav-link" href="עמוד-\${previousTopicLast}.html">הקודם</a></div>\`,
  'global previous link on first rectangle page'
);
write(firstWorkbookFile, firstWorkbookHtml);

let lastWorkbookHtml = fs.readFileSync(path.join(repo, lastWorkbookFile), 'utf8');
lastWorkbookHtml = replaceRequired(
  lastWorkbookHtml,
  /<div class="nav-side"><span class="nav-link is-disabled" aria-disabled="true">הבא<\\/span><\\/div>/,
  \`<div class="nav-side"><a class="nav-link" href="עמוד-\${nextTopicFirst}.html">הבא</a></div>\`,
  'global next link on last rectangle page'
);
write(lastWorkbookFile, lastWorkbookHtml);

let previousTopicHtml = fs.readFileSync(path.join(repo, \`עמוד-\${previousTopicLast}.html\`), 'utf8');
previousTopicHtml = replaceRequired(
  previousTopicHtml,
  /<a class="nav-link" href="עמוד-31\\.html">הבא<\\/a>/,
  \`<a class="nav-link" href="עמוד-\${newStart}.html">הבא</a>\`,
  'next link on previous topic boundary'
);
write(\`עמוד-\${previousTopicLast}.html\`, previousTopicHtml);

let nextTopicHtml = fs.readFileSync(path.join(repo, \`עמוד-\${nextTopicFirst}.html\`), 'utf8');
nextTopicHtml = replaceRequired(
  nextTopicHtml,
  /<a class="nav-link" href="עמוד-319\\.html">הקודם<\\/a>/,
  \`<a class="nav-link" href="עמוד-\${newEnd}.html">הקודם</a>\`,
  'previous link on next topic boundary'
);
write(\`עמוד-\${nextTopicFirst}.html\`, nextTopicHtml);

const mainClaude = fs.readFileSync(path.join(repo, 'CLAUDE.md'), 'utf8');`
);
source = source.replace(
  "curriculumId: CURRICULUM_ID",
  "curriculumId: index === PAGE_COUNT - 1 ? 'g7.geo.quads.rectSquare.square' : 'g7.geo.quads.rectSquare.rectangle'"
);
source = source.replace(
  "data.topics.push({ name: TOPIC_NAME, count: newPages.length, pages: newPages });\nrebuildCurriculum(data);",
  `data.topics.push({ name: TOPIC_NAME, count: newPages.length, pages: newPages });
const curriculumMapPath = 'scripts/curriculum-map.mjs';
let curriculumMap = fs.readFileSync(path.join(repo, curriculumMapPath), 'utf8');
curriculumMap = replaceRequired(
  curriculumMap,
  /  'g7\\.geo\\.quads\\.rectSquare\\.square': \\[336\\],/,
  \`  'g7.geo.quads.rectSquare.rectangle': ['\${newStart}-\${newEnd - 1}'],\\n  'g7.geo.quads.rectSquare.square': [336, \${newEnd}],\`,
  'rectangle and square curriculum assignments'
);
write(curriculumMapPath, curriculumMap);`
);
source = source.replace(
  "write('meta/topics.json', `${JSON.stringify(data, null, 2)}\\n`);\nrun('node', ['scripts/generate-pages-registry.mjs']);",
  "write('meta/topics.json', `${JSON.stringify(data, null, 2)}\\n`);\nrun('node', ['scripts/build-curriculum.mjs']);\nrun('node', ['scripts/generate-pages-registry.mjs']);"
);
source = source.replace(
  "const intended = ['CLAUDE.md', 'meta/topics.json', 'meta/pages.json'];",
  "const intended = ['CLAUDE.md', 'meta/topics.json', 'meta/pages.json', 'scripts/curriculum-map.mjs', 'עמוד-319.html', 'עמוד-31.html'];"
);

fs.writeFileSync(diagnosticPath, source, 'utf8');
process.env.RECTANGLE_REPO = repo;

try {
  await import(`${pathToFileURL(diagnosticPath).href}?run=${Date.now()}`);
} catch (error) {
  const details = error?.stack || String(error);
  console.error('\nRECTANGLE_BOOTSTRAP_FAILED\n' + details);
  const logPath = path.join(repo, 'projects/coordinate-first-quadrant-workbook/audit/bootstrap-error.txt');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, details + '\n', 'utf8');
  throw error;
}
