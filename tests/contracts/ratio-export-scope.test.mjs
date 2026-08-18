import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const exporter = fs.readFileSync('scripts/export-ratio-workbook-live.mjs', 'utf8');

const forbiddenSharedTargets = [
  'meta/topics.json',
  'styles/a4-base.css',
  'catalog.html',
  'catalog.js',
  'catalog.css',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'reader-actions.js',
  'reader-actions.css',
];

test('canonical exporter is hard-bounded to global pages 272-319', () => {
  assert.match(exporter, /const firstGlobalPage = 272;/u);
  assert.match(exporter, /const pageCount = 48;/u);
  assert.match(exporter, /const globalPage = firstGlobalPage \+ localPage - 1;/u);
  assert.match(exporter, /for \(let localPage = 1; localPage <= pageCount; localPage \+= 1\)/u);
});

test('canonical exporter never writes shared metadata, readers, or shared A4 CSS', () => {
  for (const target of forbiddenSharedTargets) {
    const writeCandidatePattern = new RegExp(`writeCandidate\\([^)]*${target.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'u');
    assert.doesNotMatch(exporter, writeCandidatePattern, `exporter must not generate shared target ${target}`);
  }
});

test('repository write copies only files previously registered as ratio candidates', () => {
  const writerStart = exporter.indexOf('async function writeCandidateToRepository()');
  const writerEnd = exporter.indexOf('\n}\n', writerStart);
  assert.ok(writerStart >= 0 && writerEnd > writerStart, 'repository writer function was not found');
  const writer = exporter.slice(writerStart, writerEnd + 2);
  assert.match(writer, /for \(const rel of \[\.\.\.candidateFiles\]\.sort\(\)\)/u);
  assert.doesNotMatch(writer, /meta\/topics\.json|catalog|mobile-app|reader-actions/u);
});

test('legacy cleanup is limited to the ratio PNG-import stylesheet', () => {
  assert.match(exporter, /ratio-import\.css/u);
  const rmCalls = [...exporter.matchAll(/fs\.rm\(([^\n]+)\)/gu)].map((match) => match[1]);
  assert.equal(rmCalls.length, 2, 'unexpected number of exporter cleanup deletions');
  assert.ok(rmCalls.some((call) => call.includes("'ratio-import.css'")), 'ratio-import.css cleanup is missing');
  assert.ok(rmCalls.some((call) => call.includes('tempRoot')), 'temporary candidate directory cleanup is missing');
});
