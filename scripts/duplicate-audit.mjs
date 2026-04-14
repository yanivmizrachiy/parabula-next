import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const ignoreDirs = new Set(['.git', 'node_modules', 'dist']);
const ignoreFiles = new Set(['package-lock.json']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      walk(full);
    } else {
      if (ignoreFiles.has(entry.name)) continue;
      files.push(rel);
    }
  }
}

walk(root);

const hashGroups = new Map();
for (const rel of files) {
  const buf = fs.readFileSync(path.join(root, rel));
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (!hashGroups.has(hash)) hashGroups.set(hash, []);
  hashGroups.get(hash).push(rel);
}

const exactDuplicates = [...hashGroups.values()].filter((group) => group.length > 1);

const namedRisks = [];
const printCandidates = files.filter((rel) => rel.includes('print') && rel.endsWith('.js'));
if (printCandidates.length > 1) {
  namedRisks.push({
    type: 'name-family-duplication',
    family: 'print-js',
    files: printCandidates
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  scannedFiles: files.length,
  exactDuplicateGroups: exactDuplicates,
  namedRisks
};

fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', 'duplicate-audit.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(output, null, 2));
