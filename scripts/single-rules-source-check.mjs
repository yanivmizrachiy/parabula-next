import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const errors = [];
const warnings = [];
const canonical = 'CLAUDE.md';

if (!exists(canonical)) {
  errors.push(`Missing canonical rules file: ${canonical}`);
} else {
  const text = read(canonical);
  const requiredPhrases = [
    'מקור הכללים היחיד',
    'שוויון מלא בין מחשב לנייד',
    'כל מה שקיים באתר ובריפו חייב להיות זמין, גלוי, מובן ושמיש גם בנייד',
    'meta/topics.json',
    'scripts/single-rules-source-check.mjs',
    'חפיפות',
    'scripts/validate-mobile-all-pages.mjs',
    'validate:mobile:all-pages',
    'npm run validate:meta',
    'npm run validate:schema',
    'רוחב קשיח',
    '360×800',
    '412×915',
    '915×412',
    'פתח מלא',
    'shards',
    '### 6.1 CSS רספונסיבי ורכיבים פנימיים'
  ];
  for (const phrase of requiredPhrases) {
    if (!text.includes(phrase)) errors.push(`${canonical} missing required phrase: ${phrase}`);
  }
  for (const obsolete of [
    'npm run topics:sync',
    'npm run topics:check',
    'validate:mobile:deep',
    'mobile-topics.json',
    'mobile-app-install.html',
    'preview/phone.html'
  ]) {
    if (text.includes(obsolete)) errors.push(`${canonical} still contains obsolete mobile architecture reference: ${obsolete}`);
  }
  if (/\n1\. מריצים ``\.\n2\. מריצים ``\./.test(text)) {
    warnings.push(`${canonical} contains two empty legacy command placeholders; canonical metadata commands are present and enforced elsewhere in the same file and CI`);
  }
}

const forbiddenActiveRuleFiles = [
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  'rules.md',
  'rules.html',
  'preview/APP_CONTRACT.md',
  'docs/WORKSHEET_CREATION_RULES.md',
  'docs/EQUATIONS_AUTOMATION_RULES.md',
  'STATE/EQUATIONS_DESIGN_PASS_RULES.md'
];
for (const rel of forbiddenActiveRuleFiles) {
  if (exists(rel)) errors.push(`Duplicate active rules source must not exist: ${rel}`);
}

const forbiddenTemporaryQualityFiles = [
  'scripts/one-time-strengthen-mobile-rules.mjs',
  '.github/workflows/one-time-strengthen-mobile-rules.yml',
  'scripts/one-time-clean-canonical-mobile-rules.mjs',
  'scripts/one-time-finalize-mobile-rules.mjs',
  '.github/workflows/one-time-finalize-mobile-rules.yml',
  'scripts/tmp-audit-equations-page-16.mjs',
  '.github/workflows/tmp-audit-equations-page-16.yml',
  'STATE/trigger-mobile-rules-migration.tmp',
  'STATE/trigger-finalize-mobile-rules.tmp',
  'STATE/tmp-page16-visual-audit-trigger.txt',
  'STATE/fix-canonical-rules-trigger.tmp'
];
for (const rel of forbiddenTemporaryQualityFiles) {
  if (exists(rel)) errors.push(`Temporary mobile-quality file must not remain: ${rel}`);
}

if (!exists('scripts/validate-mobile-all-pages.mjs')) {
  errors.push('Missing permanent all-pages mobile geometry validator: scripts/validate-mobile-all-pages.mjs');
}

if (exists('.claude/agents/worksheet-designer.md')) {
  const agent = read('.claude/agents/worksheet-designer.md');
  for (const required of ['validate:mobile:browser', 'validate:mobile:all-pages', 'פתח מלא']) {
    if (!agent.includes(required)) errors.push(`worksheet-designer agent missing required mobile validation reference: ${required}`);
  }
  for (const obsolete of ['topics:sync', 'topics:check', 'validate:mobile:deep']) {
    if (agent.includes(obsolete)) errors.push(`worksheet-designer agent still contains obsolete command: ${obsolete}`);
  }
}

if (exists('README.md')) {
  const readme = read('README.md');
  if (!readme.includes('CLAUDE.md')) warnings.push('README.md should point to CLAUDE.md');
  for (const oldName of ['PROJECT_RULES.md', 'PROJECT_MEMORY.md', 'rules.md']) {
    if (readme.includes(oldName)) errors.push(`README.md still points to removed rules source: ${oldName}`);
  }
}

if (exists('meta/system-state.json')) {
  try {
    const state = JSON.parse(read('meta/system-state.json'));
    if (state?.source_of_truth?.primary !== canonical) {
      errors.push(`meta/system-state.json source_of_truth.primary must be ${canonical}`);
    }
  } catch (error) {
    errors.push(`Invalid meta/system-state.json: ${error.message}`);
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass',
  canonical,
  errors,
  warnings
};

console.log(JSON.stringify(output, null, 2));
if (errors.length) process.exit(1);
