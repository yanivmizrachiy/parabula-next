// שלב סיום לאחר build.mjs: מחבר את כל יחידות התשובות,
// בונה מחדש את מפתח המורה ומסנכרן audit ו-SHA256SUMS.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { answers, glossary } from './all-answers.mjs';
import { buildTeacherKey } from './teacher-key.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const distDir = path.join(root, 'dist');
const auditPath = path.join(root, 'audit', 'generated-audit.json');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('finalize-expanded-build: dist/index.html is missing; run build.mjs first');
}
if (!fs.existsSync(auditPath)) {
  throw new Error('finalize-expanded-build: audit/generated-audit.json is missing');
}

const meta = JSON.parse(fs.readFileSync(path.join(root, 'project-metadata.json'), 'utf8'));
fs.writeFileSync(
  path.join(distDir, 'teacher-key.html'),
  buildTeacherKey({ meta, answers, glossary })
);

const hashFile = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
audit.answerRecords = answers.length;
audit.rightTriangleAnswerRecords = answers.filter(record => record.kind === 'triangle').length;
audit.triangleAreaAnswerRecords = answers.filter(record => record.kind === 'triangleArea').length;
audit.triangleAnswerRecords = audit.rightTriangleAnswerRecords + audit.triangleAreaAnswerRecords;
audit.pointTriangleAnswerRecords = answers.filter(record => record.kind === 'pointTriangle').length;
audit.kiteAnswerRecords = answers.filter(record => record.kind === 'kite').length;
audit.rectilinearAnswerRecords = answers.filter(record => record.kind === 'rectilinear').length;
audit.answerPages = [...new Set(answers.map(record => record.page))].sort((a, b) => a - b);
audit.files = audit.files
  .filter(item => fs.existsSync(path.join(root, item.path)))
  .map(item => {
    const absolute = path.join(root, item.path);
    return { path: item.path, bytes: fs.statSync(absolute).size, sha256: hashFile(absolute) };
  });

fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n');
const checksumLines = [
  ...audit.files,
  { path: 'audit/generated-audit.json', sha256: hashFile(auditPath) }
].map(item => `${item.sha256} *${item.path}`).join('\n') + '\n';
fs.writeFileSync(path.join(root, 'SHA256SUMS.txt'), checksumLines);

console.log(JSON.stringify({
  finalized: true,
  htmlPages: audit.htmlPages,
  answerRecords: audit.answerRecords,
  triangleAnswerRecords: audit.triangleAnswerRecords,
  pointTriangleAnswerRecords: audit.pointTriangleAnswerRecords,
  answerPages: audit.answerPages
}, null, 2));
