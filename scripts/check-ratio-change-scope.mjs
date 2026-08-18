import { execFileSync } from 'node:child_process';

const firstRatioPage = 272;
const lastRatioPage = 319;
const baseBranch = process.env.GITHUB_BASE_REF || 'main';
const eventBaseSha = process.env.RATIO_SCOPE_BASE_SHA?.trim();
const baseRef = process.argv[2] || eventBaseSha || `origin/${baseBranch}`;

function isRatioPagePath(path) {
  const match = path.match(/^עמוד-(\d+)\.html$/u);
  if (!match) return false;
  const page = Number(match[1]);
  return page >= firstRatioPage && page <= lastRatioPage;
}

function isRatioPageCss(path) {
  const match = path.match(/^styles\/pages\/עמוד-(\d+)\.css$/u);
  if (!match) return false;
  const page = Number(match[1]);
  return page >= firstRatioPage && page <= lastRatioPage;
}

function isAllowed(path) {
  return (
    path === '.github/workflows/ratio-workbook-v2.yml' ||
    path === '.github/workflows/ratio-preview-materialize.yml' ||
    path.startsWith('sources/lovable/ratio-workbook/') ||
    path.startsWith('assets/ratio/') ||
    path.startsWith('styles/topics/ratio-') ||
    path.startsWith('tests/contracts/ratio-') ||
    /^scripts\/[^/]*ratio[^/]*\.mjs$/u.test(path) ||
    isRatioPagePath(path) ||
    isRatioPageCss(path)
  );
}

let output;
try {
  output = execFileSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], { encoding: 'utf8' });
} catch (error) {
  console.error(`Could not compare ratio scope against ${baseRef}.`);
  throw error;
}

const changed = output.split(/\r?\n/u).map((value) => value.trim()).filter(Boolean);
const forbidden = changed.filter((path) => !isAllowed(path));

if (forbidden.length > 0) {
  console.error('Ratio scope violation: files outside the isolated ratio surface were changed:');
  for (const path of forbidden) console.error(`- ${path}`);
  process.exit(1);
}

const foreignRootPages = changed.filter((path) => /^עמוד-\d+\.html$/u.test(path) && !isRatioPagePath(path));
if (foreignRootPages.length > 0) {
  console.error(`Foreign canonical pages changed: ${foreignRootPages.join(', ')}`);
  process.exit(1);
}

console.log(`Ratio scope PASS: ${changed.length} changed files are confined to the ratio workbook surface (base ${baseRef}).`);
