import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text, 'utf8');
const remove = rel => {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) fs.rmSync(abs, { recursive: true, force: true });
};
const replaceOnce = (text, from, to, label) => {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return text.replace(from, to);
};
const replaceRegexOnce = (text, pattern, replacement, label) => {
  const matches = text.match(pattern) || [];
  if (matches.length !== 1) throw new Error(`${label}: expected one match, found ${matches.length}`);
  return text.replace(pattern, replacement);
};

// Keep installation inside the canonical mobile app only.
{
  const file = 'mobile-app.html';
  let text = read(file);
  text = replaceOnce(
    text,
    '      <div class="topbar-actions">\n        <button id="toggleTopicsBtn" type="button" aria-controls="topicsPanel" aria-expanded="true">נושאים ודפים</button>\n      </div>',
    '      <div class="topbar-actions">\n        <button id="installAppBtn" type="button" hidden>התקן במסך הבית</button>\n        <button id="toggleTopicsBtn" type="button" aria-controls="topicsPanel" aria-expanded="true">נושאים ודפים</button>\n      </div>',
    'mobile-app.html install button'
  );
  write(file, text);
}

{
  const file = 'mobile-app.js';
  let text = read(file);
  text = replaceOnce(
    text,
    "  toggleTopicsBtn: document.getElementById('toggleTopicsBtn'),\n",
    "  toggleTopicsBtn: document.getElementById('toggleTopicsBtn'),\n  installAppBtn: document.getElementById('installAppBtn'),\n",
    'mobile-app.js install element'
  );
  text = replaceOnce(
    text,
    "let frameMutationObserver = null;\n",
    "let frameMutationObserver = null;\nlet deferredInstallPrompt = null;\n",
    'mobile-app.js install state'
  );
  text = replaceOnce(
    text,
    "function norm(value){\n",
    "function isStandalone(){\n  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;\n}\n\nfunction syncInstallButton(){\n  if(!els.installAppBtn) return;\n  els.installAppBtn.hidden = isStandalone() || !deferredInstallPrompt;\n}\n\nasync function installCanonicalApp(){\n  if(!deferredInstallPrompt || isStandalone()){\n    syncInstallButton();\n    return;\n  }\n  const prompt = deferredInstallPrompt;\n  deferredInstallPrompt = null;\n  syncInstallButton();\n  await prompt.prompt();\n  await prompt.userChoice;\n}\n\nfunction norm(value){\n",
    'mobile-app.js install functions'
  );
  text = replaceOnce(
    text,
    "els.globalSearch.addEventListener('input', () => renderPages());\n",
    "els.installAppBtn?.addEventListener('click', installCanonicalApp);\nwindow.addEventListener('beforeinstallprompt', event => {\n  event.preventDefault();\n  if(isStandalone()) return;\n  deferredInstallPrompt = event;\n  syncInstallButton();\n});\nwindow.addEventListener('appinstalled', () => {\n  deferredInstallPrompt = null;\n  syncInstallButton();\n});\nwindow.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', syncInstallButton);\nsyncInstallButton();\n\nels.globalSearch.addEventListener('input', () => renderPages());\n",
    'mobile-app.js install listeners'
  );
  write(file, text);
}

// Make the requirement authoritative in the single rules source.
{
  const file = 'CLAUDE.md';
  let text = read(file);
  text = replaceOnce(
    text,
    '12. התאמה לנייד פירושה שימוש מלא ונוח, לא רק שהדף “נפתח”.\n',
    '12. התאמה לנייד פירושה שימוש מלא ונוח, לא רק שהדף “נפתח”.\n13. אפליקציית הנייד חייבת להיות ניתנת להתקנה כאייקון יחיד במסך הבית של הטלפון.\n14. הצעת ההתקנה תופיע רק כאשר הדפדפן מספק אירוע התקנה אמיתי והאפליקציה אינה פועלת במצב מותקן.\n15. אסור ליצור אייקון כפול, מסלול התקנה כפול, דף התקנה נפרד או מנגנון דמה.\n16. האייקון המותקן חייב לפתוח ישירות את `mobile-app.html` בתצוגת הנייד הקנונית והמהירה.\n17. מגבלות האבטחה של Android/Chrome מחייבות פעולת משתמש לאישור התקנה; אין להציג כאילו האתר התקין אייקון בלי אישור המשתמש.\n18. לאחר התקנה או פתיחה במצב standalone, כפתור ההתקנה חייב להיעלם ולא להיות מוצע שוב.\n',
    'CLAUDE.md installation requirements'
  );
  write(file, text);
}

// Remove the separate installer and unsafe/manual release machinery.
for (const rel of [
  'mobile-app-install.html',
  'mobile-app-install.js',
  'scripts/ship_mobile_release.sh'
]) remove(rel);

// Update active validators to require one mobile route only.
{
  const file = 'scripts/app-layer-check.mjs';
  let text = read(file);
  text = text.replace("  'mobile-app-install.html',\n  'mobile-app-install.js',\n", '');
  text = replaceOnce(
    text,
    "  'mobile-topics.json'\n",
    "  'mobile-topics.json',\n  'mobile-app-install.html',\n  'mobile-app-install.js',\n  'scripts/ship_mobile_release.sh'\n",
    'app-layer forbidden installer'
  );
  write(file, text);
}

{
  const file = 'scripts/validate-access-layer.mjs';
  let text = read(file);
  text = text.replace("  'mobile-app-install.html',\n", '');
  text = replaceOnce(
    text,
    "  'preview/install.html'\n",
    "  'preview/install.html',\n  'mobile-app-install.html',\n  'mobile-app-install.js',\n  'scripts/ship_mobile_release.sh'\n",
    'access-layer forbidden installer'
  );
  write(file, text);
}

{
  const file = 'scripts/validate-mobile-runtime.mjs';
  let text = read(file);
  text = text.replace("  'mobile-app-install.html',\n  'mobile-app-install.js',\n", '');
  text = replaceOnce(
    text,
    "  'scripts/one-time-clean-equations-mobile-css.mjs'\n",
    "  'scripts/one-time-clean-equations-mobile-css.mjs',\n  'mobile-app-install.html',\n  'mobile-app-install.js',\n  'scripts/ship_mobile_release.sh'\n",
    'mobile validator forbidden installer'
  );
  text = text.replace("const installHtml = files['mobile-app-install.html'];\nconst installJs = files['mobile-app-install.js'];\n", '');
  text = text.replace(
    "add('pwa-no-cache-update', js.includes(\"updateViaCache:'none'\") && installJs.includes(\"updateViaCache:'none'\"), 'service worker update bypasses stale HTTP cache');\n",
    "add('pwa-no-cache-update', js.includes(\"updateViaCache:'none'\"), 'service worker update bypasses stale HTTP cache');\n"
  );
  text = replaceOnce(
    text,
    "add('pwa-controller-refresh', js.includes('controllerchange') && js.includes('SKIP_WAITING'), 'installed app activates and reloads the new worker');\n",
    "add('pwa-controller-refresh', js.includes('controllerchange') && js.includes('SKIP_WAITING'), 'installed app activates and reloads the new worker');\nadd('single-real-install-flow', html.includes('id=\"installAppBtn\"') && js.includes('beforeinstallprompt') && js.includes('appinstalled') && js.includes('display-mode: standalone'), 'installation exists only inside the canonical mobile app');\nadd('install-button-hidden-unless-eligible', html.includes('id=\"installAppBtn\" type=\"button\" hidden') && js.includes('deferredInstallPrompt'), 'install action is hidden unless the browser exposes a real prompt');\n",
    'mobile validator install checks'
  );
  text = text.replace("  'mobile-app-install.html': installHtml,\n  'mobile-app-install.js': installJs,\n", '');
  write(file, text);
}

// Update current system state structurally.
{
  const file = 'meta/system-state.json';
  const state = JSON.parse(read(file));
  delete state.access_layer?.mobile?.canonical_install_html;
  state.access_layer.mobile.installation = 'single beforeinstallprompt flow inside mobile-app.html; hidden when unavailable or already installed';
  write(file, `${JSON.stringify(state, null, 2)}\n`);
}

if (fs.existsSync(path.join(root, 'preview/README.md'))) {
  const file = 'preview/README.md';
  const text = read(file)
    .split('\n')
    .filter(line => !line.includes('mobile-app-install.html') && !line.includes('mobile-app-install.js') && !line.includes('ship_mobile_release.sh'))
    .join('\n');
  write(file, text);
}

// Delete historical mobile/old-rules artifacts that are not runtime dependencies.
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
const historicalPatterns = [
  /^STATE\/(?:.*\/)?mobile[-_]?app/i,
  /^STATE\/MOBILE_(?:APP|RUNTIME)/i,
  /^STATE\/mobile_release/i,
  /^STATE\/mobile_book_fix/i,
  /^STATE\/runtime-fix-backups/i,
  /^STATE\/a4fit_backup/i,
  /^STATE\/ui_cleanup/i,
  /^STATE\/app_html_before_(?:topic_first|topics_redirect)/i,
  /^STATE\/(?:.*\/)?preview_+phone/i,
  /^STATE\/(?:.*\/)?PROJECT_(?:RULES|MEMORY)/i,
  /^STATE\/(?:.*\/)?rules\.(?:md|html)$/i,
  /^meta\/backup\/mobile_hardening/i,
  /^meta\/backup\/preview_polish/i
];
const keep = new Set(['STATE/PREVIEW_OVERLAP_AUDIT.md']);
let removedHistorical = 0;
for (const rel of tracked) {
  if (keep.has(rel)) continue;
  if (!historicalPatterns.some(pattern => pattern.test(rel))) continue;
  remove(rel);
  removedHistorical += 1;
}

// Remove the temporary cleanup job from the permanent workflow.
{
  const file = '.github/workflows/deploy-pages.yml';
  let text = read(file);
  text = replaceRegexOnce(
    text,
    /\n  # BEGIN ONE-TIME MOBILE CLEANUP[\s\S]*?  # END ONE-TIME MOBILE CLEANUP\n/,
    '\n',
    'remove temporary cleanup job'
  );
  write(file, text);
}

// Remove all one-time mechanism files. Final repository retains no cleanup layer.
for (const rel of [
  'scripts/one-time-clean-mobile-architecture.mjs',
  '.github/workflows/one-time-clean-mobile-architecture.yml',
  'STATE/mobile-app-cleanup-trigger.tmp'
]) remove(rel);

console.log(JSON.stringify({ removedHistorical, status: 'cleaned' }, null, 2));
