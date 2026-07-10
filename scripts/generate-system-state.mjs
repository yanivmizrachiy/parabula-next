import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = rel => fs.existsSync(path.join(root, rel));

const state = {
  generated_at: new Date().toISOString(),
  repo: 'yanivmizrachiy/parabula-next',
  source_of_truth: {
    primary: 'CLAUDE.md',
    notes: 'CLAUDE.md is the only authoritative rules, requirements, memory, and AI-entry document.'
  },
  canonical_content: {
    root_pages_pattern: 'עמוד-N.html',
    page_css_dir: 'styles/pages',
    shared_a4_css: 'styles/a4-base.css',
    metadata: 'meta/topics.json'
  },
  access_layer: {
    entry: exists('index.html') ? 'index.html' : null,
    desktop: exists('catalog.html') ? 'catalog.html' : null,
    mobile: exists('mobile-app.html') ? 'mobile-app.html' : null,
    preview: exists('preview/index.html') ? 'preview/index.html' : null,
    print: exists('preview/print.html') ? 'preview/print.html' : null,
    mobile_desktop_parity_required: true
  },
  automation_layer: {
    doctor_script: exists('scripts/doctor.mjs') ? 'scripts/doctor.mjs' : null,
    single_rules_source_check: exists('scripts/single-rules-source-check.mjs') ? 'scripts/single-rules-source-check.mjs' : null,
    access_check: exists('scripts/validate-access-layer.mjs') ? 'scripts/validate-access-layer.mjs' : null,
    recovery_audit: exists('scripts/recovery-audit.mjs') ? 'scripts/recovery-audit.mjs' : null
  }
};

fs.mkdirSync(path.join(root, 'meta'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'system-state.json'), JSON.stringify(state, null, 2) + '\n', 'utf8');
console.log('Generated meta/system-state.json');
