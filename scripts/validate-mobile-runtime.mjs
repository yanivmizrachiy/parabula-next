import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const now = new Date().toISOString();

const checks = [];
const add = (name, ok, details) => checks.push({ name, ok, details });

let meta = null;
let mobileMeta = null;
let mobileJs = '';
let mobileHtml = '';
let printJs = '';
let installHtml = '';
let installJs = '';

try {
  meta = JSON.parse(read('meta/topics.json'));
  add('meta_topics_exists', true, `totalPages=${meta.totalPages}`);
} catch (err) {
  add('meta_topics_exists', false, String(err.message || err));
}

try {
  mobileMeta = JSON.parse(read('mobile-topics.json'));
  add('mobile_topics_exists', true, `totalPages=${mobileMeta.totalPages}`);
} catch (err) {
  add('mobile_topics_exists', false, String(err.message || err));
}

try {
  mobileJs = read('mobile-app.js');
  add('mobile_app_js_exists', true, 'mobile-app.js loaded');
} catch (err) {
  add('mobile_app_js_exists', false, String(err.message || err));
}

try {
  mobileHtml = read('mobile-app.html');
  add('mobile_app_html_exists', true, 'mobile-app.html loaded');
} catch (err) {
  add('mobile_app_html_exists', false, String(err.message || err));
}

try {
  printJs = read('preview/print.js');
  add('print_js_exists', true, 'preview/print.js loaded');
} catch (err) {
  add('print_js_exists', false, String(err.message || err));
}

try {
  installHtml = read('mobile-app-install.html');
  add('mobile_install_html_exists', true, 'mobile-app-install.html loaded');
} catch (err) {
  add('mobile_install_html_exists', false, String(err.message || err));
}

try {
  installJs = read('mobile-app-install.js');
  add('mobile_install_js_exists', true, 'mobile-app-install.js loaded');
} catch (err) {
  add('mobile_install_js_exists', false, String(err.message || err));
}

add(
  'mobile_app_uses_canonical_meta_topics',
  mobileJs.includes("./meta/topics.json"),
  mobileJs.includes("./meta/topics.json")
    ? 'mobile-app.js fetches ./meta/topics.json'
    : 'mobile-app.js is not fetching ./meta/topics.json'
);

add(
  'mobile_app_not_using_mobile_topics_json',
  !mobileJs.includes('mobile-topics.json'),
  !mobileJs.includes('mobile-topics.json')
    ? 'mobile-app.js no longer depends on mobile-topics.json'
    : 'mobile-app.js still references mobile-topics.json'
);

add(
  'mobile_html_uses_mobile_app_js',
  mobileHtml.includes('./mobile-app.js'),
  mobileHtml.includes('./mobile-app.js')
    ? 'mobile-app.html loads mobile-app.js'
    : 'mobile-app.html does not load mobile-app.js as expected'
);

add(
  'mobile_reader_uses_current_origin_pages',
  mobileJs.includes('new URL(relativeFile, window.location.href).href') && !mobileJs.includes('page?.siteUrl ||'),
  mobileJs.includes('new URL(relativeFile, window.location.href).href') && !mobileJs.includes('page?.siteUrl ||')
    ? 'mobile-app.js resolves worksheet pages against the current origin'
    : 'mobile-app.js is not resolving worksheet pages against the current origin'
);

add(
  'mobile_print_handoff_uses_print_center',
  mobileJs.includes('./preview/print.html') && mobileJs.includes('autopreview'),
  mobileJs.includes('./preview/print.html') && mobileJs.includes('autopreview')
    ? 'mobile-app.js deep-links into preview/print.html for preview-before-print'
    : 'mobile-app.js is not deep-linking into preview/print.html preview-before-print flow'
);

add(
  'mobile_print_handoff_marks_source_and_topic',
  mobileJs.includes("url.searchParams.set('source', 'mobile-app')") && mobileJs.includes("url.searchParams.set('topic'"),
  mobileJs.includes("url.searchParams.set('source', 'mobile-app')") && mobileJs.includes("url.searchParams.set('topic'")
    ? 'mobile-app.js annotates print handoff with source and topic'
    : 'mobile-app.js is not annotating print handoff with source/topic'
);

add(
  'mobile_book_navigation_present',
  mobileJs.includes('goBookRelative('),
  mobileJs.includes('goBookRelative(')
    ? 'mobile-app.js includes global book navigation helper'
    : 'mobile-app.js is missing global book navigation helper'
);

add(
  'mobile_reader_notice_present',
  mobileHtml.includes('readerNotice') && mobileJs.includes('setReaderNotice('),
  mobileHtml.includes('readerNotice') && mobileJs.includes('setReaderNotice(')
    ? 'mobile reader exposes notice feedback for reading mode/navigation'
    : 'mobile reader is missing notice feedback wiring'
);

add(
  'mobile_reader_mode_toggle_present',
  mobileHtml.includes('readerModeFullBtn') && mobileHtml.includes('readerModeZoomBtn') && mobileJs.includes('READER_MODES'),
  mobileHtml.includes('readerModeFullBtn') && mobileHtml.includes('readerModeZoomBtn') && mobileJs.includes('READER_MODES')
    ? 'mobile reader exposes explicit full-page and enlarged reading modes'
    : 'mobile reader is missing explicit reading-mode controls'
);

add(
  'mobile_reader_stage_prevents_right_edge_clipping',
  mobileJs.includes('mobile-reader-stage') && mobileJs.includes('mobile-reader-canvas') && mobileJs.includes("stage.style.overflowX = allowHorizontalPan ? 'auto' : 'hidden'"),
  mobileJs.includes('mobile-reader-stage') && mobileJs.includes('mobile-reader-canvas') && mobileJs.includes("stage.style.overflowX = allowHorizontalPan ? 'auto' : 'hidden'")
    ? 'mobile reader uses a dedicated stage/canvas wrapper to avoid right-edge clipping'
    : 'mobile reader is missing the dedicated stage/canvas anti-clipping wrapper'
);

add(
  'print_center_accepts_url_selection',
  printJs.includes("searchParams.get('files')") && printJs.includes("searchParams.getAll('file')"),
  printJs.includes("searchParams.get('files')") && printJs.includes("searchParams.getAll('file')")
    ? 'preview/print.js supports URL-driven page selection'
    : 'preview/print.js does not support URL-driven page selection'
);

add(
  'print_center_explains_mobile_handoff',
  printJs.includes("searchParams.get('source')") && printJs.includes('preview-before-print'),
  printJs.includes("searchParams.get('source')") && printJs.includes('preview-before-print')
    ? 'preview/print.js explains mobile preview-before-print handoff'
    : 'preview/print.js is missing explicit mobile handoff explanation'
);

add(
  'mobile_install_flow_wired',
  installHtml.includes('mobile-app.webmanifest') && installHtml.includes('mobile-app-install.js') && installJs.includes('beforeinstallprompt'),
  installHtml.includes('mobile-app.webmanifest') && installHtml.includes('mobile-app-install.js') && installJs.includes('beforeinstallprompt')
    ? 'mobile install page loads manifest and install handler'
    : 'mobile install page is missing manifest/install handler wiring'
);

add(
  'mobile_install_supports_standalone_feedback',
  installJs.includes('display-mode: standalone') && installJs.includes('appinstalled'),
  installJs.includes('display-mode: standalone') && installJs.includes('appinstalled')
    ? 'mobile install flow reports standalone/appinstalled state'
    : 'mobile install flow is missing standalone/appinstalled feedback'
);

if (meta && mobileMeta) {
  add(
    'mobile_topics_divergence_detected',
    meta.totalPages === mobileMeta.totalPages,
    `meta/topics.json totalPages=${meta.totalPages}; mobile-topics.json totalPages=${mobileMeta.totalPages}`
  );

  const metaTopicNames = new Set((meta.topics || []).map(t => t.name));
  const mobileTopicNames = new Set((mobileMeta.topics || []).map(t => t.name));
  const missingInMobile = [...metaTopicNames].filter(name => !mobileTopicNames.has(name));
  const missingInMeta = [...mobileTopicNames].filter(name => !metaTopicNames.has(name));

  add(
    'topic_name_sets_match',
    missingInMobile.length === 0 && missingInMeta.length === 0,
    `missingInMobile=${missingInMobile.length}; missingInMeta=${missingInMeta.length}`
  );
}

add(
  'compat_phone_runtime_still_exists',
  exists('preview/phone.js') && exists('preview/phone.html'),
  exists('preview/phone.js') && exists('preview/phone.html')
    ? 'preview/phone.* still exists as compat/legacy layer'
    : 'preview/phone.* is missing'
);

const failed = checks.filter(c => !c.ok);
const reportMd = path.join(root, 'STATE', 'MOBILE_RUNTIME_VALIDATION.md');
const reportJson = path.join(root, 'STATE', 'MOBILE_RUNTIME_VALIDATION.json');

const lines = [
  '# MOBILE_RUNTIME_VALIDATION',
  '',
  `Generated: ${now}`,
  '',
  '## Summary',
  '',
  `- total_checks: ${checks.length}`,
  `- passed: ${checks.length - failed.length}`,
  `- failed: ${failed.length}`,
  '',
  '## Checks',
  ''
];

for (const check of checks) {
  lines.push(`- ${check.ok ? 'PASS' : 'FAIL'} — ${check.name} — ${check.details}`);
}

if (failed.length) {
  lines.push('', '## Failures', '');
  for (const check of failed) {
    lines.push(`- ${check.name}: ${check.details}`);
  }
}

fs.writeFileSync(reportMd, lines.join('\n'));
fs.writeFileSync(reportJson, JSON.stringify({ generatedAt: now, checks }, null, 2));

console.log('MOBILE RUNTIME VALIDATION COMPLETE');
console.log(`REPORT=${reportMd}`);
console.log(`JSON=${reportJson}`);
console.log(`TOTAL_CHECKS=${checks.length}`);
console.log(`PASSED=${checks.length - failed.length}`);
console.log(`FAILED=${failed.length}`);
// Exit non-zero intentionally so CI fails when mobile runtime drift is detected.
if (failed.length) process.exit(1);
