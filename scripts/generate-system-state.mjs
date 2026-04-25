import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = (rel) => fs.existsSync(join(rel));

const state = {
  generated_at: new Date().toISOString(),
  repo: 'yanivmizrachiy/parabula-next',
  source_of_truth: {
    primary: 'PROJECT_RULES.md',
    continuity_index: 'STATE/README.md',
    continuity_docs: [
      'STATE/PROJECT_CONTINUITY.md',
      'STATE/CHANGELOG_2026_04_14.md',
      'STATE/CHANGELOG_2026_04_14_PRINT_UPDATE.md'
    ],
    notes: 'If PROJECT_RULES.md and STATE docs differ, treat it as an open sync task.'
  },
  canonical_content: {
    root_pages_pattern: 'עמוד-N.html',
    page_css_dir: 'styles/pages',
    shared_a4_css: 'styles/a4-base.css',
    metadata: 'meta/topics.json'
  },
  app_layer: {
    hub: exists('preview/app.html') ? 'preview/app.html' : null,
    desktop_preview: exists('preview/index.html') ? 'preview/index.html' : null,
    phone: {
      html: exists('preview/phone.html') ? 'preview/phone.html' : null,
      js: exists('preview/phone.js') ? 'preview/phone.js' : null,
      css: exists('preview/mobile.css') ? 'preview/mobile.css' : null,
      manifest: exists('preview/manifest.webmanifest') ? 'preview/manifest.webmanifest' : null,
      icon: exists('preview/icon.svg') ? 'preview/icon.svg' : null,
      service_worker: exists('preview/sw.js') ? 'preview/sw.js' : null,
      install_guide: exists('preview/install.html') ? 'preview/install.html' : null
    },
    print: {
      html: exists('preview/print.html') ? 'preview/print.html' : null,
      entry_js: exists('preview/print.js') ? 'preview/print.js' : null,
      legacy_duplicate_js: exists('preview/print-center.js') ? 'preview/print-center.js' : null,
      status: exists('preview/print.js') && exists('preview/print-center.js') ? 'active_with_known_duplication' : 'active'
    },
    preview_readme: exists('preview/README.md') ? 'preview/README.md' : null,
    app_contract: exists('preview/APP_CONTRACT.md') ? 'preview/APP_CONTRACT.md' : null
  },
  safety_layer: {
    audit_script: exists('scripts/recovery-audit.mjs') ? 'scripts/recovery-audit.mjs' : null,
    audit_workflow: exists('.github/workflows/recovery-audit.yml') ? '.github/workflows/recovery-audit.yml' : null,
    audit_output: exists('meta/audit/recovery-audit.json') ? 'meta/audit/recovery-audit.json' : null,
    restore_status: exists('STATE/RESTORE_PLAN.md') ? 'plan_defined_not_implemented' : 'not_implemented_yet'
  },
  automation_layer: {
    doctor_script: exists('scripts/doctor.mjs') ? 'scripts/doctor.mjs' : null,
    rules_sync_check: exists('scripts/rules-sync-check.mjs') ? 'scripts/rules-sync-check.mjs' : null,
    app_layer_check: exists('scripts/app-layer-check.mjs') ? 'scripts/app-layer-check.mjs' : null,
    duplicate_audit: exists('scripts/duplicate-audit.mjs') ? 'scripts/duplicate-audit.mjs' : null,
    repository_health_workflow: exists('.github/workflows/repository-health.yml') ? '.github/workflows/repository-health.yml' : null
  },
  known_open_tasks: [
    'Sync PROJECT_RULES.md with active mobile, print, and recovery additions',
    'Resolve duplication between preview/print.js and preview/print-center.js',
    'Strengthen phone installability and caching',
    'Add safe restore workflow beyond audit-only detection'
  ],
  hard_rules: [
    'Do not modify canonical worksheet pages during tooling/documentation work unless explicitly requested',
    'Do not mix worksheet topics',
    'Do not claim a capability is complete if it is not complete',
    'Keep repository changes documented for future AI sessions'
  ]
};

fs.mkdirSync(join('meta'), { recursive: true });
fs.writeFileSync(join('meta', 'system-state.json'), JSON.stringify(state, null, 2) + '\n', 'utf8');
console.log('Generated meta/system-state.json');
