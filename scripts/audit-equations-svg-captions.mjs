import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const metaPath = path.join(root, 'meta/topics.json');
// פלט audit בלבד — נכתב ל־meta/audit/ ואינו נשמר בגיט (CLAUDE.md §6)
const reportPath = path.join(root, 'meta/audit/equations-svg-captions.md');
const topicName = 'משוואות';
const excludedTopic = 'משוואות ריבועיות';

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const topic = meta.topics.find((entry) => entry.name === topicName);

if (!topic) {
  throw new Error(`Missing topic: ${topicName}`);
}

function localIndex(page) {
  const match = String(page.title || '').match(/עמוד\s+(\d+)/);
  return match ? Number(match[1]) : Number(page.number || 0);
}

function svgPathFor(page) {
  return path.join(root, 'pages', topicName, 'assets', `page-${String(localIndex(page)).padStart(2, '0')}.svg`);
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const pages = topic.pages
  .filter((page) => page.topic === topicName && page.topic !== excludedTopic)
  .slice()
  .sort((a, b) => localIndex(a) - localIndex(b));

const rows = [];
let liveTextPages = 0;
let pathOnlyPages = 0;
let missingSvgPages = 0;
let styledSvgPages = 0;
let glyphDefsPages = 0;

for (const page of pages) {
  const svgPath = svgPathFor(page);
  const local = localIndex(page);
  if (!fs.existsSync(svgPath)) {
    missingSvgPages += 1;
    rows.push({ local, file: page.file, svg: path.relative(root, svgPath), status: 'missing', text: 0, tspan: 0, path: 0, use: 0, glyph: 0, style: false, decision: 'חסר SVG' });
    continue;
  }

  const svg = fs.readFileSync(svgPath, 'utf8');
  const textCount = (svg.match(/<text\b/g) || []).length;
  const tspanCount = (svg.match(/<tspan\b/g) || []).length;
  const pathCount = (svg.match(/<path\b/g) || []).length;
  const useCount = (svg.match(/<use\b/g) || []).length;
  const glyphCount = (svg.match(/id="glyph-/g) || []).length;
  const hasSvgFontStyle = svg.includes('EQUATIONS_SVG_FONT_UNIFY') || svg.includes('font-family: Rubik');
  const hasRawFontFamily = /font-family/i.test(svg);
  const hasInlineStyleAttrs = /\sstyle="/i.test(svg);

  if (hasSvgFontStyle) styledSvgPages += 1;
  if (glyphCount > 0) glyphDefsPages += 1;

  let decision = '';
  if (textCount > 0 || tspanCount > 0) {
    liveTextPages += 1;
    decision = 'יש טקסט חי — ניתן לעצב ולבדוק טיפוגרפיה ישירות';
  } else {
    pathOnlyPages += 1;
    decision = 'אין טקסט חי — הכיתובים כנראה גליפים/paths; נדרש טיפול SVG/וקטורי או בנייה מחדש';
  }

  rows.push({
    local,
    file: page.file,
    svg: path.relative(root, svgPath),
    status: 'found',
    text: textCount,
    tspan: tspanCount,
    path: pathCount,
    use: useCount,
    glyph: glyphCount,
    style: hasSvgFontStyle,
    rawFont: hasRawFontFamily,
    inlineStyle: hasInlineStyleAttrs,
    decision
  });
}

const table = rows.map((row) => `| ${row.local} | \`${row.file}\` | \`${row.svg}\` | ${row.status} | ${row.text} | ${row.tspan} | ${row.path} | ${row.use} | ${row.glyph} | ${row.style ? 'כן' : 'לא'} | ${row.inlineStyle ? 'כן' : 'לא'} | ${htmlEscape(row.decision)} |`).join('\n');

const report = `# EQUATIONS_SVG_CAPTION_AUDIT — ParabulaNext

_Last updated: 2026-04-30_

## Scope

This audit checks the actual SVG/content layer for the exact topic:

- \`${topicName}\`

Excluded topic:

- \`${excludedTopic}\`

The purpose is to determine whether worksheet captions/text are live editable SVG text or already converted into vector/glyph paths. This matters because page CSS can style the worksheet shell, but cannot reliably redesign text that exists only as vector outlines inside an external SVG image.

## Summary

- Pages in scope: ${pages.length}
- SVG files missing: ${missingSvgPages}
- Pages with live \`<text>\` / \`<tspan>\`: ${liveTextPages}
- Pages without live SVG text: ${pathOnlyPages}
- Pages with SVG font-unify style marker: ${styledSvgPages}
- Pages with glyph definitions: ${glyphDefsPages}

## Interpretation rule

A page is **not finally approved as fully redesigned** merely because its page CSS was improved.

Final approval requires one of these:

1. live text exists and is styled according to the project rules, or
2. the SVG/vector layer is explicitly redesigned, or
3. the page is rebuilt as structured HTML/CSS instead of relying on original SVG text outlines.

## Page-by-page SVG caption data

| Topic page | Root HTML | SVG | Status | text | tspan | path | use | glyph defs | SVG font style | inline style attrs | Decision |
|---:|---|---|---|---:|---:|---:|---:|---:|---|---|---|
${table}

## Current design conclusion

This report is an evidence layer only. It does not approve pages by itself,
and it is not a source of requirements. The only source of rules is \`CLAUDE.md\`.
`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, report, 'utf8');

console.log('AUDIT_EQUATIONS_SVG_CAPTIONS_OK');
console.log(`pages=${pages.length}`);
console.log(`live_text_pages=${liveTextPages}`);
console.log(`path_only_pages=${pathOnlyPages}`);
console.log(`missing_svg_pages=${missingSvgPages}`);
console.log(`report=${path.relative(root, reportPath)}`);
