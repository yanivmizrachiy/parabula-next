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
    'scripts/single-rules-source-check.mjs'
  ];
  for (const phrase of requiredPhrases) {
    if (!text.includes(phrase)) errors.push(`${canonical} missing required phrase: ${phrase}`);
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
