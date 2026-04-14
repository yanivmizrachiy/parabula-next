import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const now = new Date().toISOString();

function listRootPages() {
  return fs.readdirSync(root)
    .filter((name) => /^עמוד-\d+\.html$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0));
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function statDir(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) return [];
  return fs.readdirSync(full);
}

const pages = listRootPages();
const missingPageCss = [];
const missingA4BaseLink = [];
const missingPageClass = [];
const inlineCssViolations = [];

for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const n = file.match(/^עמוד-(\d+)\.html$/)?.[1];
  const cssRel = `styles/pages/עמוד-${n}.css`;

  if (!exists(cssRel)) missingPageCss.push({ file, css: cssRel });
  if (!html.includes('styles/a4-base.css')) missingA4BaseLink.push(file);
  if (!html.includes(`page-${n}`)) missingPageClass.push(file);
  if (/\sstyle\s*=\s*["']/.test(html) || /<style[\s>]/i.test(html)) {
    inlineCssViolations.push(file);
  }
}

const report = {
  generatedAt: now,
  repo: 'yanivmizrachiy/parabula-next',
  summary: {
    totalRootPages: pages.length,
    missingPageCss: missingPageCss.length,
    missingA4BaseLink: missingA4BaseLink.length,
    missingPageClass: missingPageClass.length,
    inlineCssViolations: inlineCssViolations.length,
    hasProjectRules: exists('PROJECT_RULES.md'),
    hasPreview: exists('preview/index.html'),
    hasPhoneViewer: exists('preview/phone.html'),
    hasMetaTopics: exists('meta/topics.json'),
    hasLegacy: exists('sources/legacy'),
    hasBackups: exists('sources/backups')
  },
  pages,
  missingPageCss,
  missingA4BaseLink,
  missingPageClass,
  inlineCssViolations,
  recoverySources: {
    legacyEntries: statDir('sources/legacy'),
    backupEntries: statDir('sources/backups')
  },
  requiredFiles: {
    projectRules: exists('PROJECT_RULES.md'),
    packageJson: exists('package.json'),
    a4Base: exists('styles/a4-base.css'),
    previewIndex: exists('preview/index.html'),
    previewPhone: exists('preview/phone.html'),
    metaTopics: exists('meta/topics.json'),
    deployWorkflow: exists('.github/workflows/deploy-pages.yml')
  }
};

const outDir = path.join(root, 'meta', 'audit');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'recovery-audit.json');
fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(`Recovery audit written to ${path.relative(root, outFile)}`);
console.log(JSON.stringify(report.summary, null, 2));

if (missingPageCss.length || missingA4BaseLink.length || missingPageClass.length) {
  process.exitCode = 1;
}
