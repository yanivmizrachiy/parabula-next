import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const previewDir = path.join(root, 'preview');
const outputDir = path.join(root, 'meta', 'audit');
fs.mkdirSync(outputDir, { recursive: true });

const htmlFiles = fs.existsSync(previewDir)
  ? fs.readdirSync(previewDir).filter((name) => name.endsWith('.html')).sort()
  : [];

const report = {
  generatedAt: new Date().toISOString(),
  previewHtmlFiles: htmlFiles,
  embeddedStyleBlocks: [],
  inlineStyleAttributes: [],
  notes: []
};

for (const file of htmlFiles) {
  const full = path.join(previewDir, file);
  const text = fs.readFileSync(full, 'utf8');
  const hasStyleBlock = /<style[\s>]/i.test(text);
  const hasInlineStyle = /\sstyle\s*=\s*["']/.test(text);
  if (hasStyleBlock) report.embeddedStyleBlocks.push(file);
  if (hasInlineStyle) report.inlineStyleAttributes.push(file);
}

if (report.embeddedStyleBlocks.length || report.inlineStyleAttributes.length) {
  report.notes.push('Preview layer still contains embedded or inline styles. This is allowed temporarily for utility pages, but should be reduced to keep the repository cleaner and more consistent.');
}

fs.writeFileSync(path.join(outputDir, 'preview-style-audit.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
