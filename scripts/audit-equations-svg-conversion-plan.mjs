import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicName = 'משוואות';
const maxPages = Number(process.env.EQUATIONS_SVG_PLAN_LIMIT || 10);

function readText(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf8');
}

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

function localIndex(page) {
  const match = String(page.title || '').match(/עמוד\s+(\d+)/);
  return match ? Number(match[1]) : Number(page.number || 0);
}

function relPath(...parts) {
  return path.join(...parts).replaceAll('\\', '/');
}

function svgPathFor(local) {
  return relPath('pages', topicName, 'assets', `page-${String(local).padStart(2, '0')}.svg`);
}

function classify(row) {
  if (!row.svgExists && row.svgRefs === 0) return 'html-or-non-svg';
  if (row.textNodes > 0 || row.tspanNodes > 0) return 'svg-has-text-evidence';
  if (row.titleNodes > 0 || row.descNodes > 0) return 'svg-has-metadata-evidence';
  if (row.glyphDefs > 0 || row.pathNodes > 50) return 'svg-outline-only-needs-source';
  return 'svg-inspect-manually';
}

function nextAction(classification) {
  if (classification === 'html-or-non-svg') return 'skip: page is not SVG-only';
  if (classification === 'svg-has-text-evidence') return 'candidate: extract text evidence before HTML conversion';
  if (classification === 'svg-has-metadata-evidence') return 'inspect metadata and compare with PDF/source';
  if (classification === 'svg-outline-only-needs-source') return 'do not convert from SVG alone; verify with PDF/source first';
  return 'manual inspection required';
}

const metaPath = path.join(root, 'meta', 'topics.json');
if (!fs.existsSync(metaPath)) {
  throw new Error('Missing meta/topics.json');
}

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const topic = meta.topics.find((entry) => entry.name === topicName);
if (!topic) {
  throw new Error(`Missing topic: ${topicName}`);
}

const rows = topic.pages
  .slice()
  .sort((a, b) => localIndex(a) - localIndex(b))
  .slice(0, maxPages)
  .map((page) => {
    const local = localIndex(page);
    const html = readText(page.file);
    const svgFile = svgPathFor(local);
    const svg = readText(svgFile);
    const svgRefs = count(html, /page-\d+\.svg/g);
    const row = {
      local,
      file: page.file,
      svgFile,
      svgExists: Boolean(svg),
      svgRefs,
      htmlExercises: count(html, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g),
      htmlAnswers: count(html, /class\s*=\s*"[^"]*\banswer-line\b[^"]*"/g),
      textNodes: count(svg, /<text\b/g),
      tspanNodes: count(svg, /<tspan\b/g),
      titleNodes: count(svg, /<title\b/g),
      descNodes: count(svg, /<desc\b/g),
      pathNodes: count(svg, /<path\b/g),
      glyphDefs: count(svg, /id="glyph-/g),
      imageNodes: count(svg, /<image\b/g),
      hebrewChars: count(svg, /[\u0590-\u05FF]/g),
      digitChars: count(svg, /\d/g)
    };
    row.classification = classify(row);
    row.nextAction = nextAction(row.classification);
    return row;
  });

const svgRows = rows.filter((row) => row.svgExists || row.svgRefs > 0);
const outlineOnly = svgRows.filter((row) => row.classification === 'svg-outline-only-needs-source');

console.log('EQUATIONS_SVG_CONVERSION_PLAN_OK');
console.log(`pages_checked=${rows.length}`);
console.log(`svg_pages=${svgRows.length}`);
console.log(`outline_only_needs_source=${outlineOnly.length}`);
console.log('--- EQUATIONS_SVG_CONVERSION_PLAN_START ---');
console.log('| page | html | svg | text | tspan | paths | glyphs | hebrew | digits | classification | next action |');
console.log('|---:|---|---|---:|---:|---:|---:|---:|---:|---|---|');
for (const row of rows) {
  console.log(`| ${row.local} | \`${row.file}\` | \`${row.svgFile}\` | ${row.textNodes} | ${row.tspanNodes} | ${row.pathNodes} | ${row.glyphDefs} | ${row.hebrewChars} | ${row.digitChars} | ${row.classification} | ${row.nextAction} |`);
}
console.log('--- EQUATIONS_SVG_CONVERSION_PLAN_END ---');
