import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = 'CLAUDE.md';
const errors = [];
const warnings = [];
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

function walk(rel, predicate = () => true) {
  const start = path.join(root, rel);
  if (!fs.existsSync(start)) return [];
  const result = [];
  const visit = (absolute, relative) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      const abs = path.join(absolute, entry.name);
      const next = path.join(relative, entry.name).replaceAll('\\', '/');
      if (entry.isDirectory()) visit(abs, next);
      else if (predicate(next)) result.push(next);
    }
  };
  visit(start, rel);
  return result;
}

if (!exists(canonical)) {
  errors.push(`Missing canonical rules file: ${canonical}`);
} else {
  const text = read(canonical);
  const requiredPhrases = [
    'מקור הכללים היחיד',
    'כל מה שקיים באתר ובריפו חייב להיות זמין, גלוי, מובן ושמיש גם בנייד',
    'VisualViewport',
    'ResizeObserver',
    'virtualization',
    '44×44px',
    'Service Worker',
    'controllerchange',
    'validate:mobile:interactions',
    'validate:mobile:all-pages',
    '360×800',
    '412×915',
    '915×412',
    'WebKit iPhone',
    'scripts/single-rules-source-check.mjs'
  ];
  for (const phrase of requiredPhrases) {
    if (!text.includes(phrase)) errors.push(`${canonical} missing required contract phrase: ${phrase}`);
  }
  for (const obsolete of [
    'mobile-topics.json', 'mobile-app-install.html', 'preview/phone.html',
    'PROJECT_RULES.md', 'PROJECT_MEMORY.md', 'STATE/', 'docs/next-session.md',
    '96/96', '98 הדפים', '95 דפים'
  ]) {
    if (text.includes(obsolete) && !text.includes(`\`${obsolete}\``)) {
      errors.push(`${canonical} contains obsolete active reference: ${obsolete}`);
    }
  }
}

const forbiddenFiles = [
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  'rules.md',
  'rules.html',
  'preview/APP_CONTRACT.md',
  'docs/WORKSHEET_CREATION_RULES.md',
  'docs/EQUATIONS_AUTOMATION_RULES.md',
  'STATE/EQUATIONS_DESIGN_PASS_RULES.md',
  'docs/next-session.md',
  'docs/RELEASE_CHECKLIST.md',
  'docs/DIGITAL_TEXTBOOK_ARCHITECTURE.md',
  'docs/PREMIUM_DESIGN_SYSTEM.md',
  'meta/system-state.json',
  'scripts/generate-system-state.mjs',
  'scripts/generate-system-state-auto.mjs',
  '.github/workflows/system-state-generation.yml',
  'tools/release_gate.py',
  '.claude/agents/print-a4-guardian.md'
];
for (const rel of forbiddenFiles) {
  if (exists(rel)) errors.push(`Obsolete or duplicate instruction/state source must not exist: ${rel}`);
}

const aiEntryFiles = [
  ...walk('.claude/agents', rel => rel.endsWith('.md')),
  ...walk('.claude/commands', rel => rel.endsWith('.md')),
  ...walk('.github/prompts', rel => rel.endsWith('.md')),
  ...walk('.github/instructions', rel => rel.endsWith('.md')),
  '.github/copilot-instructions.md'
].filter(exists);

const forbiddenAiPatterns = [
  [/\bHard rules\b/i, 'Hard rules'],
  [/\bHard requirements\b/i, 'Hard requirements'],
  [/עקרונות מחייבים/, 'independent mandatory principles'],
  [/\bCurrent state\b/i, 'stored current state'],
  [/מצב נוכחי/, 'stored current state'],
  [/\b(?:95|96|98)\s+(?:worksheet\s+)?pages\b/i, 'historical page count'],
  [/(?:95|96|98)\s+דפים/, 'historical page count'],
  [/\b96\/96\b/, 'historical test count'],
  [/mobile-topics\.json/, 'obsolete metadata mirror'],
  [/PROJECT_(?:RULES|MEMORY)\.md/, 'obsolete rules source'],
  [/\bSTATE\//, 'state document dependency'],
  [/[A-Z]:\\Users\\/i, 'local machine path'],
  [/\bnpm run\b/, 'duplicated command list'],
  [/\bgit (?:push|reset|rebase|add)\b/, 'duplicated Git policy']
];

for (const rel of aiEntryFiles) {
  const text = read(rel);
  if (!text.includes('CLAUDE.md')) errors.push(`${rel} must point to CLAUDE.md`);
  for (const [pattern, label] of forbiddenAiPatterns) {
    if (pattern.test(text)) errors.push(`${rel} contains ${label}; move it to CLAUDE.md or derive it at runtime`);
  }
  const bodyLines = text.split(/\r?\n/).filter(line => line.trim() && line.trim() !== '---');
  if (bodyLines.length > 16) warnings.push(`${rel} is longer than a thin AI entry pointer (${bodyLines.length} non-empty lines)`);
}

const docsFiles = walk('docs', rel => rel.endsWith('.md'));
const instructionPatterns = [
  /\bHard rules\b/i,
  /\bHard requirements\b/i,
  /עקרונות מחייבים/,
  /Use this checklist/i,
  /How to start every session/i,
  /What Copilot must not do/i,
  /מקור הכללים היחיד/,
  /You must read and obey/i
];
for (const rel of docsFiles) {
  const text = read(rel);
  for (const pattern of instructionPatterns) {
    if (pattern.test(text)) errors.push(`${rel} contains instruction-like rules; CLAUDE.md must be the only rules source`);
  }
}

for (const rel of ['README.md', 'preview/README.md']) {
  if (!exists(rel)) continue;
  const text = read(rel);
  if (!text.includes('CLAUDE.md')) errors.push(`${rel} must point to CLAUDE.md`);
  if (/(?:95|96|98|267)\s+דפים/.test(text)) errors.push(`${rel} must not store a page count`);
  if (/mobile-topics\.json|PROJECT_RULES\.md|PROJECT_MEMORY\.md/.test(text)) errors.push(`${rel} references obsolete architecture`);
}

if (!exists('scripts/validate-mobile-interactions.mjs')) errors.push('Missing permanent mobile interaction validator');
if (!exists('scripts/validate-mobile-all-pages.mjs')) errors.push('Missing permanent all-pages mobile geometry validator');
if (exists('package.json')) {
  const scripts = JSON.parse(read('package.json')).scripts || {};
  for (const name of ['validate:mobile', 'validate:mobile:browser', 'validate:mobile:interactions', 'validate:mobile:all-pages', 'rules:check']) {
    if (!scripts[name]) errors.push(`package.json missing script: ${name}`);
  }
}
if (exists('.github/workflows/deploy-pages.yml')) {
  const workflow = read('.github/workflows/deploy-pages.yml');
  if (!workflow.includes('mobile-interaction-gate')) errors.push('deploy workflow must include mobile-interaction-gate');
  if (!workflow.includes('validate:mobile:interactions')) errors.push('deploy workflow must run validate:mobile:interactions');
}

const mobileVersionFiles = ['index.html', 'index.js', 'mobile-app.html', 'mobile-app.js', 'mobile-app.webmanifest', 'sw.js'];
for (const rel of mobileVersionFiles) {
  if (!exists(rel)) continue;
  const text = read(rel);
  if (!text.includes('__MOBILE_VERSION__')) errors.push(`${rel} must use the single build version token`);
  if (/2026071\d{4}/.test(text)) errors.push(`${rel} contains a manual mobile release number`);
}

// ── סריקה רוחבית: כל קובץ Markdown בריפו, לא רק נקודות הכניסה ל-AI ──────
// כל מסמך שמנסח כללים מחייבים חייב להפנות ל-CLAUDE.md ולא לשכפל אותו.
const skipPrefixes = ['node_modules/', 'dist/', '.git/', 'sources/lovable/', 'meta/audit/'];
// לא רק Markdown: מסמך כללים יכול להיכתב גם כ-txt, yml, json או html,
// ורק סיומת אחת נסרקה עד כה.
const scanExtensions = ['.md', '.txt', '.rst', '.adoc'];
const allMarkdown = walk('.', rel => {
  const clean = rel.replace(/^\.\//, '');
  if (!scanExtensions.some(ext => clean.endsWith(ext))) return false;
  return !skipPrefixes.some(prefix => clean.includes(prefix));
}).map(rel => rel.replace(/^\.\//, ''));

const contractPatterns = [
  // כותרת חוזה, גם כשהיא ממוספרת ("## 2. חוזה תחזוקה").
  // אין להשתמש ב-\b סביב עברית: אותיות עבריות אינן \w ולכן הגבול לעולם אינו מתקיים.
  [/^#{1,6}[^\n]{0,14}?(?<![א-ת])חוזה(?![א-ת])/m, 'independent contract section'],
  [/^#{1,6}[^\n]{0,14}?(?<![א-ת])כללי עבודה(?![א-ת])/m, 'independent working rules section'],
  // §0 אוסר קובץ memory/contract/instructions נוסף ו-§9 אוסר system-state או
  // זיכרון סשן. עד כה הם נחסמו רק ברשימת שמות קבועה, וכל שם חדש חמק.
  [/(?<![א-ת])זיכרון (?:קבוע|סשן|מתמשך)(?![א-ת])/, 'persistent agent memory document'],
  [/(?<![א-ת])מצב נוכחי של (?:המערכת|הריפו|הפרויקט)(?![א-ת])/, 'stored system state'],
  [/\bpersistent (?:agent )?memory\b/i, 'persistent agent memory document'],
  [/\bsystem state\b/i, 'stored system state'],
  [/\bBINDING RULES\b/i, 'independent binding rules document'],
  [/\bעקרונות מחייבים\b/, 'independent mandatory principles'],
  [/\bמקור האמת הקנוני\b/, 'competing source-of-truth claim'],
  [/PROJECT_(?:RULES|MEMORY)\.md/, 'obsolete rules source'],
  [/\bSTATE\/[A-Z]/, 'state document dependency'],
  [/mobile-topics\.json/, 'obsolete metadata mirror'],
];
// שפה מחייבת: מסמך שמנסח דרישות חייב להפנות ל-CLAUDE.md, אחרת הוא מקור כללים מתחרה.
// הסף קיים כדי שאזכור בודד בתוך תיאור תוכן לא ייחשב חוזה.
const directivePattern = /(?:^|\s)(?:חייב(?:ים|ת)?|אסור|יש ל[א-ת]+|אין ל[א-ת]+|must not|must|never|always|required to)(?:\s|$)/gm;
const DIRECTIVE_THRESHOLD = 4;

const rulesScanned = [];
for (const rel of allMarkdown) {
  if (rel === canonical) continue;
  const text = read(rel);
  rulesScanned.push(rel);
  for (const [pattern, label] of contractPatterns) {
    if (pattern.test(text)) {
      errors.push(`${rel} contains ${label}; CLAUDE.md must be the only rules source`);
    }
  }
  const directives = (text.match(directivePattern) || []).length;
  if (directives >= DIRECTIVE_THRESHOLD && !text.includes(canonical)) {
    errors.push(
      `${rel} states ${directives} requirements but never points to ${canonical}; ` +
        'a document that defines rules must defer to the canonical file',
    );
  }
}

// ── אסור שסקריפט או workflow יכתוב מסמך אל STATE/ מחוץ ל-STATE/reports/ ──
// שני קבצי השמירה עצמם מונים נתיבים אסורים כדי לחסום אותם — זהו שימוש לגיטימי.
const guardScripts = new Set(['scripts/single-rules-source-check.mjs', 'scripts/app-layer-check.mjs']);
const codeFiles = [
  ...walk('scripts', rel => rel.endsWith('.mjs') || rel.endsWith('.js')),
  ...walk('.github/workflows', rel => rel.endsWith('.yml')),
];
for (const rel of codeFiles) {
  if (guardScripts.has(rel)) continue;
  const text = read(rel);
  const match = /STATE\/(?!reports\/)[A-Za-z0-9_.-]+/.exec(text);
  if (match) {
    errors.push(`${rel} depends on ${match[0]}; audit output belongs in meta/audit/ (CLAUDE.md §6)`);
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass',
  canonical,
  scannedAiEntries: aiEntryFiles.length,
  aiEntryFiles,
  scannedDocs: docsFiles.length,
  docsFiles,
  scannedMarkdown: rulesScanned.length,
  scannedCodeFiles: codeFiles.length,
  errors,
  warnings
};
fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', 'rules-source-validation.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
if (errors.length) process.exit(1);
