#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildPythagorasWorkbook } from '../pythagoras-workbook-model.js';

export const MOBILE_RELEVANT_PATTERNS = [
  /^(?:mobile-app|catalog)\.(?:html|css|js)$/,
  /^(?:mobile-deep-link|catalog-deep-link)\.js$/,
  /^reader-actions\.(?:css|js)$/,
  /^mobile-app\.webmanifest$/,
  /^sw\.js$/,
  /^עמוד-\d+\.html$/u,
  /^styles\//,
  /^assets\//,
  /^vendor\//,
  /^meta\/topics\.json$/,
  /^scripts\/(?:copy-static-site|validate-mobile(?:-[^/]+)?|vendorize-cdn)\.mjs$/,
  /^scripts\/lib\//,
  /^vite\.config\.[cm]?[jt]s$/,
  /^package(?:-lock)?\.json$/,
  /^\.github\/workflows\/deploy-pages\.yml$/,
];

export const PYTHAGORAS_SHARED_PATTERNS = [
  /^pythagoras-workbook(?:-model)?\.(?:html|js)$/,
  /^styles\/pythagoras-workbook\.css$/,
  /^styles\/topics\/pythagoras(?:-[^/]+)?\.css$/,
  /^meta\/topics\.json$/,
  /^scripts\/(?:validate-pythagoras-workbook(?:-browser)?|pythagoras-[^/]+)\.mjs$/,
  /^tests\/contracts\/pythagoras-[^/]+\.test\.mjs$/,
  /^CLAUDE\.md$/,
  /^\.github\/workflows\/(?:pythagoras-quality|deploy-pages)\.yml$/,
];

export function isMobileRelevantPath(file) {
  return MOBILE_RELEVANT_PATTERNS.some((pattern) => pattern.test(file));
}

export function buildCanonicalPythagorasPaths(meta) {
  const workbook = buildPythagorasWorkbook(meta);
  const paths = new Set();
  for (const page of workbook.pages) {
    const file = page.file || `עמוד-${page.sourceNumber}.html`;
    paths.add(file);
    paths.add(`styles/pages/עמוד-${page.sourceNumber}.css`);
  }
  return paths;
}

export function isPythagorasRelevantPath(file, canonicalPaths = new Set()) {
  return canonicalPaths.has(file) || PYTHAGORAS_SHARED_PATTERNS.some((pattern) => pattern.test(file));
}

export function classifyChangeScope({ eventName, changedFiles, pythagorasPaths = new Set() }) {
  const mobileMatched = changedFiles.filter(isMobileRelevantPath);
  const pythagorasMatched = changedFiles.filter((file) => isPythagorasRelevantPath(file, pythagorasPaths));

  if (eventName === 'workflow_dispatch') {
    return {
      mobile: true,
      pythagoras: true,
      reason: 'manual release requires full validation',
      pythagorasReason: 'manual release requires full validation',
    };
  }

  if (eventName === 'push') {
    return {
      mobile: true,
      pythagoras: pythagorasMatched.length > 0,
      reason: 'full mobile validation is mandatory on main pushes',
      pythagorasReason: pythagorasMatched.length > 0
        ? `Pythagoras-relevant files changed: ${pythagorasMatched.join(', ')}`
        : 'no canonical Pythagoras files changed',
    };
  }

  const mobile = mobileMatched.length > 0;
  const pythagoras = pythagorasMatched.length > 0;
  return {
    mobile,
    pythagoras,
    reason: mobile
      ? `mobile-relevant files changed: ${mobileMatched.join(', ')}`
      : 'no mobile, reader, A4, style, asset, PWA or build files changed',
    pythagorasReason: pythagoras
      ? `Pythagoras-relevant files changed: ${pythagorasMatched.join(', ')}`
      : 'no canonical Pythagoras files changed',
  };
}

function readChangedFiles(baseSha, headSha) {
  if (!baseSha || !headSha || /^0+$/u.test(baseSha)) return [];

  const output = execFileSync(
    'git',
    ['diff', '--name-only', `${baseSha}...${headSha}`],
    { encoding: 'utf8' },
  );

  return output
    .split(/\r?\n/u)
    .map((file) => file.trim())
    .filter(Boolean);
}

function writeOutputs(outputPath, values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${String(value).replace(/\r?\n/gu, ' ')}`);
  if (outputPath) {
    fs.appendFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  } else {
    console.log(lines.join('\n'));
  }
}

function main() {
  const eventName = process.env.GITHUB_EVENT_NAME || '';
  const changedFiles = eventName === 'workflow_dispatch'
    ? []
    : readChangedFiles(process.env.BASE_SHA, process.env.HEAD_SHA);
  const meta = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
  const pythagorasPaths = buildCanonicalPythagorasPaths(meta);
  const result = classifyChangeScope({ eventName, changedFiles, pythagorasPaths });

  writeOutputs(process.env.GITHUB_OUTPUT, {
    mobile: result.mobile,
    pythagoras: result.pythagoras,
    changed_count: changedFiles.length,
    reason: result.reason,
    pythagoras_reason: result.pythagorasReason,
  });

  console.log(`[ci-scope] mobile=${result.mobile} pythagoras=${result.pythagoras} changed=${changedFiles.length}`);
  console.log(`[ci-scope] mobile-reason=${result.reason}`);
  console.log(`[ci-scope] pythagoras-reason=${result.pythagorasReason}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
