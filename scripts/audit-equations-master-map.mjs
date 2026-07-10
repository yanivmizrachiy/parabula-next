#!/usr/bin/env node
/**
 * audit-equations-master-map.mjs
 *
 * Builds and verifies the canonical master map for the non-quadratic
 * equations topic (משוואות — single-unknown equations).
 *
 * It scans every root worksheet page `עמוד-N.html`, isolates the pages whose
 * topic is exactly `משוואות` (NOT `משוואה ריבועית` / quadratic), and derives a
 * deterministic mapping:
 *
 *     logical page  ->  file (עמוד-N.html)  ->  source SVG / PDF page  ->  status
 *
 * The map is written to meta/equations-master-map.json and a human report is
 * printed. Exit code is non-zero if the map is inconsistent (gaps, duplicate
 * logical numbers, or a logical/total mismatch), so it is safe to wire into CI.
 *
 * Read-only against worksheet content. Never invents content.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const TOPIC = 'משוואות';
const OUT = path.join(root, 'meta', 'equations-master-map.json');

// Canonical content source: the 52-page user-provided PDF (NOT the superseded
// 54-page sources/legacy/parabula-old/sources/משוואות.pdf). The sha256 is
// computed at runtime so the recorded provenance always matches the file.
const SOURCE_PDF = 'sources/equations/משוואות-52.pdf';
const sourcePdfAbs = path.join(root, SOURCE_PDF);
const sourcePdfSha256 = fs.existsSync(sourcePdfAbs)
  ? crypto.createHash('sha256').update(fs.readFileSync(sourcePdfAbs)).digest('hex')
  : null;

const files = fs.readdirSync(root).filter((f) => /^עמוד-\d+\.html$/.test(f));

const pages = [];
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const titleMatch = html.match(/<title>\s*עמוד\s+(\d+)\s+—\s+(.+?)\s*<\/title>/);
  if (!titleMatch) continue;
  const topic = titleMatch[2].trim();
  // Exact topic match — must not capture the separate quadratic topic.
  if (topic !== TOPIC) continue;

  const fileNum = Number(file.match(/(\d+)/)[1]);
  const logical = Number(titleMatch[1]);
  const svgMatch = html.match(/page-(\d+)\.svg/);
  const isWrapper = /class="pdf-page"/.test(html);
  const hasLiveBody = /class="(?:eq-body|worksheet-card)"/.test(html);
  const sourcePageAttr = html.match(/data-source-page="(\d+)"/);

  pages.push({
    logical,
    file,
    fileNum,
    svg: svgMatch ? Number(svgMatch[1]) : null,
    pdfPage: sourcePageAttr ? Number(sourcePageAttr[1]) : logical,
    status: isWrapper ? 'WRAP' : hasLiveBody ? 'LIVE' : 'UNKNOWN',
  });
}

pages.sort((a, b) => a.logical - b.logical);

// Consistency checks
const problems = [];
const seen = new Map();
for (const p of pages) {
  if (seen.has(p.logical)) {
    problems.push(`duplicate logical page ${p.logical}: ${seen.get(p.logical)} and ${p.file}`);
  }
  seen.set(p.logical, p.file);
}
for (let i = 0; i < pages.length; i++) {
  const expected = i + 1;
  if (pages[i].logical !== expected) {
    problems.push(`gap/disorder: position ${expected} holds logical ${pages[i].logical} (${pages[i].file})`);
    break;
  }
}

const counts = pages.reduce(
  (acc, p) => ((acc[p.status] = (acc[p.status] || 0) + 1), acc),
  {}
);

const map = {
  topic: TOPIC,
  generatedAt: new Date().toISOString(),
  total: pages.length,
  counts,
  contentSource: SOURCE_PDF,
  sourcePdf: SOURCE_PDF,
  sourcePdfSha256,
  note:
    'logical page === source PDF page. file column is the canonical on-disk worksheet. ' +
    'LIVE = converted HTML+MathJax, WRAP = still SVG wrapper. ' +
    'Source of truth = sources/equations/משוואות-52.pdf (52 pages); the 54-page ' +
    'sources/legacy/parabula-old/sources/משוואות.pdf is superseded.',
  pages,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n', 'utf8');

console.log('EQUATIONS_MASTER_MAP');
console.log(`topic=${TOPIC}`);
console.log(`total=${pages.length}`);
console.log(`status: LIVE=${counts.LIVE || 0} WRAP=${counts.WRAP || 0} UNKNOWN=${counts.UNKNOWN || 0}`);
console.log(`written: ${path.relative(root, OUT)}`);
console.log('--- logical -> file (status) ---');
for (const p of pages) {
  console.log(`  ${String(p.logical).padStart(2)} -> ${p.file}  [${p.status}]`);
}

if (problems.length) {
  console.error('\nMASTER_MAP_INCONSISTENT:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\nMASTER_MAP_OK');
