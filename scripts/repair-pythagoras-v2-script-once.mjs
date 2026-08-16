import fs from 'node:fs';

const target = 'scripts/extend-pythagoras-foundations-v2-once.mjs';
let text = fs.readFileSync(target, 'utf8');
const startToken = 'const newSection = String.raw`';
const endToken = '`;\nclaude = claude.replace(sectionRe,newSection);';
const start = text.indexOf(startToken);
const end = text.indexOf(endToken, start + startToken.length);
if (start < 0 || end < 0) throw new Error('לא נמצא מקטע newSection לתיקון');
const bodyStart = start + startToken.length;
const body = text.slice(bodyStart, end).replaceAll('`', "'");
text = text.slice(0, bodyStart) + body + text.slice(end);
fs.writeFileSync(target, text, 'utf8');
fs.rmSync('scripts/repair-pythagoras-v2-script-once.mjs');
console.log('[OK] Repaired markdown backticks inside source-truth payload.');
