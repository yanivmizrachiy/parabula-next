import fs from 'node:fs';

const jsPath = 'algebra-z-workbook.js';
const htmlPath = 'algebra-z-workbook.html';
const testPath = 'tests/contracts/algebra-z-workbook.test.mjs';

let js = fs.readFileSync(jsPath, 'utf8');
let html = fs.readFileSync(htmlPath, 'utf8');
let test = fs.readFileSync(testPath, 'utf8');

const functionAnchor = `  function fragmentUrl(base) {\n`;
const versionFunction = `  function versionedAssetUrl(file) {\n    const separator = file.path.includes('?') ? '&' : '?';\n    return \`${'${file.path}'}\${separator}v=${'${file.sha256.slice(0, 12)}'}\`;\n  }\n\n`;

if (!js.includes('function versionedAssetUrl(file)')) {
  if (!js.includes(functionAnchor)) throw new Error('JavaScript insertion anchor not found');
  js = js.replace(functionAnchor, `${versionFunction}${functionAnchor}`);
}

if (js.includes('    const localUrl = file.path;')) {
  js = js.replace('    const localUrl = file.path;', '    const localUrl = versionedAssetUrl(file);');
}
if (!js.includes('const localUrl = versionedAssetUrl(file);')) {
  throw new Error('PDF URL was not changed to the SHA-versioned URL');
}

const oldScriptTag = '  <script src="algebra-z-workbook.js"></script>';
const newScriptTag = '  <script src="algebra-z-workbook.js?v=logo-free-20260804"></script>';
if (html.includes(oldScriptTag)) html = html.replace(oldScriptTag, newScriptTag);
if (!html.includes(newScriptTag)) throw new Error('HTML JavaScript cache-bust tag is missing');

const startMarker = '// BEGIN ALGEBRA-Z LOGO-FREE CACHE CONTRACT';
const endMarker = '// END ALGEBRA-Z LOGO-FREE CACHE CONTRACT';
const testBlock = `${startMarker}\ntest('algebra-z viewer cache-busts the logo-free PDFs by their release hashes', () => {\n  assert.match(js, /function versionedAssetUrl\\(file\\)/);\n  assert.match(js, /file\\.sha256\\.slice\\(0, 12\\)/);\n  assert.match(js, /const localUrl = versionedAssetUrl\\(file\\)/);\n  assert.match(html, /algebra-z-workbook\\.js\\?v=logo-free-20260804/);\n});\n${endMarker}`;
const markerPattern = new RegExp(`${startMarker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`);
if (markerPattern.test(test)) test = test.replace(markerPattern, testBlock);
else test = `${test.trimEnd()}\n\n${testBlock}\n`;

fs.writeFileSync(jsPath, js, 'utf8');
fs.writeFileSync(htmlPath, html, 'utf8');
fs.writeFileSync(testPath, test, 'utf8');

console.log(JSON.stringify({
  ok: true,
  files: [jsPath, htmlPath, testPath],
  pdfVersionSource: 'manifest.files.<mode>.sha256.slice(0, 12)',
  scriptVersion: 'logo-free-20260804'
}, null, 2));
