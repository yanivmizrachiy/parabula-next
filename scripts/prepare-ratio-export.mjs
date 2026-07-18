import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.argv[2] || '');
if (!projectRoot || !fs.existsSync(projectRoot)) {
  throw new Error('Usage: node scripts/prepare-ratio-export.mjs <lovable-project-root>');
}

const indexPath = path.join(projectRoot, 'src', 'pages', 'Index.tsx');
const cssPath = path.join(projectRoot, 'src', 'index.css');
const source = fs.readFileSync(indexPath, 'utf8');
const needle = "  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 25, 50)), []);\n\n  return (";
const replacement = `  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 25, 50)), []);

  const exportParams = new URLSearchParams(window.location.search);
  const exportMode = exportParams.get('export') === '1';
  const requestedPage = Number(exportParams.get('page') || '1');
  const exportPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), WORKSHEET_PAGES.length);

  if (exportMode) {
    return (
      <div id="ratio-export-root" dir="rtl">
        <WorksheetPage pageNumber={exportPage} totalPages={WORKSHEET_PAGES.length} />
      </div>
    );
  }

  return (`;

if (!source.includes(needle)) {
  throw new Error('Could not patch Index.tsx for deterministic page export');
}
fs.writeFileSync(indexPath, source.replace(needle, replacement), 'utf8');

fs.appendFileSync(cssPath, `

html:has(#ratio-export-root),
body:has(#ratio-export-root),
#root:has(#ratio-export-root) {
  width: 210mm;
  height: 297mm;
  min-width: 210mm;
  min-height: 297mm;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff !important;
}

#ratio-export-root {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #fff;
}

#ratio-export-root .worksheet-page {
  box-shadow: none !important;
  border: 0 !important;
  margin: 0 !important;
}
`, 'utf8');

console.log(`Prepared deterministic export build at ${projectRoot}`);
