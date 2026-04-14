import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = (rel) => fs.existsSync(join(rel));
const read = (rel) => fs.readFileSync(join(rel), 'utf8');

const errors = [];
const warnings = [];

function requireFile(rel) {
  if (!exists(rel)) errors.push(`Missing required file: ${rel}`);
}

requireFile('PROJECT_RULES.md');
requireFile('STATE/README.md');
requireFile('STATE/PROJECT_CONTINUITY.md');
requireFile('meta/system-state.json');
requireFile('preview/README.md');

let systemState = null;
if (exists('meta/system-state.json')) {
  try {
    systemState = JSON.parse(read('meta/system-state.json'));
  } catch (error) {
    errors.push(`Invalid JSON in meta/system-state.json: ${error.message}`);
  }
}

if (systemState) {
  const primary = systemState?.source_of_truth?.primary;
  if (primary !== 'PROJECT_RULES.md') {
    errors.push('meta/system-state.json must declare PROJECT_RULES.md as primary source_of_truth');
  }

  const continuityIndex = systemState?.source_of_truth?.continuity_index;
  if (continuityIndex !== 'STATE/README.md') {
    errors.push('meta/system-state.json must declare STATE/README.md as continuity_index');
  }

  const filesToCheck = [
    primary,
    continuityIndex,
    ...(systemState?.source_of_truth?.continuity_docs || []),
    systemState?.canonical_content?.metadata,
    systemState?.app_layer?.hub,
    systemState?.app_layer?.desktop_preview,
    systemState?.app_layer?.phone?.html,
    systemState?.app_layer?.phone?.js,
    systemState?.app_layer?.phone?.css,
    systemState?.app_layer?.phone?.manifest,
    systemState?.app_layer?.phone?.icon,
    systemState?.app_layer?.phone?.service_worker,
    systemState?.app_layer?.phone?.install_guide,
    systemState?.app_layer?.print?.html,
    systemState?.app_layer?.print?.entry_js,
    systemState?.app_layer?.legacy_duplicate_js,
    systemState?.app_layer?.preview_readme,
    systemState?.safety_layer?.audit_script,
    systemState?.safety_layer?.audit_workflow,
    systemState?.safety_layer?.audit_output
  ].filter(Boolean);

  for (const rel of filesToCheck) {
    if (!exists(rel)) errors.push(`meta/system-state.json points to missing file: ${rel}`);
  }
}

const rules = exists('PROJECT_RULES.md') ? read('PROJECT_RULES.md') : '';
const continuity = exists('STATE/PROJECT_CONTINUITY.md') ? read('STATE/PROJECT_CONTINUITY.md') : '';
const previewReadme = exists('preview/README.md') ? read('preview/README.md') : '';
const stateReadme = exists('STATE/README.md') ? read('STATE/README.md') : '';

const requiredRulesPhrases = [
  'PROJECT_RULES.md is the continuity anchor',
  'Current active additions in this repository (2026-04-14)',
  'preview/phone.html',
  'scripts/recovery-audit.mjs'
];
for (const phrase of requiredRulesPhrases) {
  if (!rules.includes(phrase)) {
    warnings.push(`PROJECT_RULES.md missing expected phrase: ${phrase}`);
  }
}

const continuityRequired = [
  'preview/phone.html',
  'scripts/recovery-audit.mjs',
  'PROJECT_RULES.md'
];
for (const phrase of continuityRequired) {
  if (!continuity.includes(phrase)) {
    warnings.push(`STATE/PROJECT_CONTINUITY.md missing expected phrase: ${phrase}`);
  }
}

if (!previewReadme.includes('print.js') || !previewReadme.includes('print-center.js')) {
  warnings.push('preview/README.md should document both print.js and print-center.js while duplication exists');
}

if (!stateReadme.includes('PROJECT_RULES.md') || !stateReadme.includes('PROJECT_CONTINUITY.md')) {
  warnings.push('STATE/README.md should point to PROJECT_RULES.md and PROJECT_CONTINUITY.md');
}

const output = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass',
  errors,
  warnings
};

fs.mkdirSync(join('meta', 'audit'), { recursive: true });
fs.writeFileSync(join('meta', 'audit', 'rules-sync-check.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');

console.log(JSON.stringify(output, null, 2));
if (errors.length) process.exit(1);
