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

if (meta && mobileMeta) {
  add(
    'mobile_topics_total_pages_match',
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

if (failed.length) {
  process.exit(1);
}
