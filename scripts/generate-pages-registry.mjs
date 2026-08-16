// scripts/generate-pages-registry.mjs
// מייצר meta/pages.json עם registry מלא של כל דפי העבודה
// הרצה: node scripts/generate-pages-registry.mjs

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const metaDir = path.join(root, 'meta');

// קרא topics.json לקבלת מיפוי נושא לדף
let pageTopicMap = {};
try {
  const topicsRaw = JSON.parse(fs.readFileSync(path.join(metaDir, 'topics.json'), 'utf-8'));
  for (const topic of topicsRaw.topics) {
    for (const page of topic.pages) {
      pageTopicMap[page.number] = {
        topic: topic.name,
        title: page.title,
        h1: page.h1 || '',
        file: page.file,
        previewPath: page.previewPath || `/${page.file}`,
        siteUrl: page.siteUrl || '',
      };
    }
  }
  console.log(`[OK] topics.json נקרא — ${Object.keys(pageTopicMap).length} דפים ממופים`);
} catch (e) {
  console.warn('[WARN] לא ניתן לקרוא topics.json:', e.message);
}

// מצא כל קבצי עמוד-N.html בשורש
const pagePattern = /^\u05e2\u05de\u05d5\u05d3-\d+\.html$/;
const pageFiles = fs.readdirSync(root)
  .filter(f => pagePattern.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0]);
    const nb = parseInt(b.match(/\d+/)[0]);
    return na - nb;
  });

console.log(`[OK] נמצאו ${pageFiles.length} קבצי HTML בשורש`);

const registry = pageFiles.map(file => {
  const num = parseInt(file.match(/\d+/)[0]);
  const meta = pageTopicMap[num] || {};
  const cssFile = `styles/pages/\u05e2\u05de\u05d5\u05d3-${num}.css`;
  const cssExists = fs.existsSync(path.join(root, cssFile));

  return {
    number: num,
    file,
    title: meta.title || `\u05e2\u05de\u05d5\u05d3 ${num}`,
    h1: meta.h1 || '',
    topic: meta.topic || '\u05dc\u05d0 \u05d9\u05d3\u05d5\u05e2',
    status: 'active',
    cssFile: cssExists ? cssFile : null,
    previewPath: meta.previewPath || `/${file}`,
    siteUrl: meta.siteUrl || `https://yanivmizrachiy.github.io/razpages/${file}`,
  };
});

// בדוק דפים חסרים ב-topics.json
const missingFromTopics = registry.filter(p => p.topic === '\u05dc\u05d0 \u05d9\u05d3\u05d5\u05e2');
if (missingFromTopics.length > 0) {
  console.warn(`[WARN] ${missingFromTopics.length} \u05d3\u05e4\u05d9\u05dd \u05d0\u05d9\u05e0\u05dd ב-topics.json:`,
    missingFromTopics.map(p => p.number).join(', '));
}

// בדוק CSS חסרים
const missingCss = registry.filter(p => !p.cssFile);
if (missingCss.length > 0) {
  console.warn(`[WARN] ${missingCss.length} \u05d3\u05e4\u05d9\u05dd \u05d7\u05e1\u05e8\u05d9 CSS:`,
    missingCss.map(p => p.number).join(', '));
}

const output = {
  generatedAt: new Date().toISOString(),
  generatedBy: 'scripts/generate-pages-registry.mjs',
  totalPages: registry.length,
  topics: [...new Set(registry.map(p => p.topic))],
  pages: registry,
};

fs.writeFileSync(
  path.join(metaDir, 'pages.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log(`\n[SUCCESS] meta/pages.json \u05e0\u05d5\u05e6\u05e8 \u05e2\u05dd ${registry.length} \u05d3\u05e4\u05d9\u05dd`);
console.log(`[INFO] \u05e0\u05d5\u05e9\u05d0\u05d9\u05dd: ${output.topics.join(', ')}`);
if (missingFromTopics.length === 0 && missingCss.length === 0) {
  console.log('[SUCCESS] \u05db\u05dc \u05d4\u05d3\u05e4\u05d9\u05dd \u05ea\u05e7\u05d9\u05e0\u05d9\u05dd — \u05d0\u05d9\u05df \u05d0\u05d9-\u05d4\u05ea\u05d0\u05de\u05d5\u05ea');
}
