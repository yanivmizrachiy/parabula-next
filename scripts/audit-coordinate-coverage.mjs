#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const data = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));

const topicRows = Array.isArray(data.topics) ? data.topics : [];
const coordinateTopicNames = new Set([
  'מערכת צירים - רביע ראשון בלבד',
  'מערכת צירים - כל הרביעים'
]);

const candidatePages = new Map();
for (const topic of topicRows) {
  if (!coordinateTopicNames.has(topic.name)) continue;
  const pages = Array.isArray(topic.pages) ? topic.pages : [];
  for (const page of pages) {
    const file = typeof page === 'string' ? page : page?.file;
    if (!file) continue;
    const rec = candidatePages.get(file) ?? { file, topics: [] };
    rec.topics.push(topic.name);
    candidatePages.set(file, rec);
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMathText(text) {
  return text
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/\b-?\d+(?:\.\d+)?\b/g, '#')
    .replace(/\s+/g, ' ')
    .trim();
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

const rows = [];
const missing = [];
for (const rec of [...candidatePages.values()].sort((a, b) => a.file.localeCompare(b.file, 'he', { numeric: true }))) {
  const full = path.join(root, rec.file);
  if (!fs.existsSync(full)) {
    missing.push(rec.file);
    continue;
  }
  const html = fs.readFileSync(full, 'utf8');
  const text = stripHtml(html);
  const normalized = normalizeMathText(text);
  rows.push({
    file: rec.file,
    topics: rec.topics,
    textHash: hash(text),
    structuralHash: hash(normalized),
    chars: text.length
  });
}

const exact = new Map();
const structural = new Map();
for (const row of rows) {
  (exact.get(row.textHash) ?? exact.set(row.textHash, []).get(row.textHash)).push(row.file);
  (structural.get(row.structuralHash) ?? structural.set(row.structuralHash, []).get(row.structuralHash)).push(row.file);
}

const exactDuplicates = [...exact.entries()].filter(([, files]) => files.length > 1);
const structuralDuplicates = [...structural.entries()].filter(([, files]) => files.length > 1);

const report = {
  generatedAt: new Date().toISOString(),
  coordinatePages: rows.length,
  missing,
  exactDuplicates: exactDuplicates.map(([fingerprint, files]) => ({ fingerprint, files })),
  structuralDuplicates: structuralDuplicates.map(([fingerprint, files]) => ({ fingerprint, files })),
  pages: rows
};

console.log(JSON.stringify(report, null, 2));

if (missing.length || exactDuplicates.length) {
  process.exitCode = 1;
}
