import fs from 'node:fs';

const svgPath = 'pages/משוואות/assets/page-01.svg';
const svg = fs.readFileSync(svgPath, 'utf8');

const counts = {
  text: (svg.match(/<text\b/g) || []).length,
  tspan: (svg.match(/<tspan\b/g) || []).length,
  path: (svg.match(/<path\b/g) || []).length,
  glyph: (svg.match(/glyph-/g) || []).length
};

console.log('AUDIT_EQUATIONS_SVG_REALITY');
console.log(`file=${svgPath}`);
console.log(`text_tags=${counts.text}`);
console.log(`tspan_tags=${counts.tspan}`);
console.log(`path_tags=${counts.path}`);
console.log(`glyph_refs=${counts.glyph}`);

if (counts.path > 100 && counts.text < 20) {
  console.log('conclusion=closed_svg_path_based_not_good_editable_source');
} else {
  console.log('conclusion=svg_may_contain_some_live_text_but_requires_manual_inspection');
}
