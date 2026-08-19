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
];

/*
 * Deep mobile validation scans the whole site and is intentionally narrower.
 * Local page/topic edits still get the fast browser + interaction gates, while
 * app/runtime/global-layout changes get the expensive all-pages shards too.
 */
export const MOBILE_DEEP_RELEVANT_PATTERNS = [
  /^(?:mobile-app|catalog)\.(?:html|css|js)$/,
  /^(?:mobile-deep-link|catalog-deep-link)\.js$/,
  /^reader-actions\.(?:css|js)$/,
  /^mobile-app\.webmanifest$/,
  /^sw\.js$/,
  /^styles\/a4-base\.css$/,
  /^scripts\/(?:copy-static-site|validate-mobile(?:-[^/]+)?|vendorize-cdn)\.mjs$/,
  /^scripts\/lib\//,
  /^vite\.config\.[cm]?[jt]s$/,
  /^package(?:-lock)?\.json$/,
];

export const PYTHAGORAS_SHARED_PATTERNS = [
  /^pythagoras-workbook(?:-model)?\.(?:html|js)$/,
  /^styles\/pythagoras-workbook\.css$/,
  /^styles\/topics\/pythagoras(?:-[^/]+)?\.css$/,
  /^meta\/topics\.json$/,
  /^scripts\/(?:validate-pythagoras-workbook(?:-browser)?|pythagoras-[^/]+)\.mjs$/,
  /^tests\/contracts\/pythagoras-[^/]+\.test\.mjs$/,
  /^CLAUDE\.md$/,
  /^\.github\/workflows\/pythagoras-quality\.yml$/,
];

/*
 * These files can change repository maintenance/CI behavior but cannot alter the
 * generated site itself. They get a lean validation path: repository health,
 * CI-scope contract and production build. Runtime/content files never match.
 * Generated coordinate-workbook dist files are explicitly included because the
 * dedicated build workflow recreates them and excludes dist/** from source triggers.
 */
export const MAINTENANCE_ONLY_PATTERNS = [
  /^\.gitignore$/,
  /^\.vscode\/(?:settings|launch|tasks)\.json$/,
  /^scripts\/(?:repo-health-report|edit-map|classify-ci-change-scope)\.mjs$/,
  /^\.github\/workflows\/deploy-pages\.yml$/,
  /^tests\/contracts\/(?:deploy-ci-scope|fast-pr-ci)\.test\.mjs$/,
  /^projects\/coordinate-first-quadrant-workbook\/dist\//,
];

export function isMobileRelevantPath(file) {
  return MOBILE_RELEVANT_PATTERNS.some((pattern) => pattern.test(file));
}

export function isMobileDeepRelevantPath(file) {
  return MOBILE_DEEP_RELEVANT_PATTERNS.some((pattern) => pattern.test(file));
}

export function isMaintenanceOnlyPath(file) {
  return MAINTENANCE_ONLY_PATTERNS.some((pattern) => pattern.test(file));
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
  const mobileDeepMatched = changedFiles.filter(isMobileDeepRelevantPath);
  const pythagorasMatched = changedFiles.filter((file) => isPythagorasRelevantPath(file, pythagorasPaths));

  if (eventName === 'workflow_dispatch') {
    return {
      mobile: true,
      mobileDeep: true,
      pythagoras: true,
      maintenanceOnly: false,
      reason: 'manual release requires full validation',
      mobileDeepReason: 'manual release requires full validation',
      pythagorasReason: 'manual release requires full validation',
      maintenanceReason: 'manual release never uses the maintenance-only shortcut',
    };
  }

  const mobile = mobileMatched.length > 0;
  const mobileDeep = mobileDeepMatched.length > 0;
  const pythagoras = pythagorasMatched.length > 0;
  const maintenanceOnly = changedFiles.length > 0 && changedFiles.every(isMaintenanceOnlyPath);

  return {
    mobile,
    mobileDeep,
    pythagoras,
    maintenanceOnly,
    reason: mobile
      ? `mobile-relevant files changed: ${mobileMatched.join(', ')}`
      : 'no mobile, reader, A4, style, asset, PWA or build files changed',
    mobileDeepReason: mobileDeep
      ? `global mobile/runtime files changed: ${mobileDeepMatched.join(', ')}`
      : 'no app-runtime or global-layout files changed; deep all-pages audit is unnecessary',
    pythagorasReason: pythagoras
      ? `Pythagoras-relevant files changed: ${pythagorasMatched.join(', ')}`
      : 'no canonical Pythagoras files changed',
    maintenanceReason: maintenanceOnly
      ? `repository-only maintenance files changed: ${changedFiles.join(', ')}`
      : 'change includes runtime/content or an unclassified file; use the full static validation path',
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
    mobile_deep: result.mobileDeep,
    pythagoras: result.pythagoras,
    maintenance_only: result.maintenanceOnly,
    changed_count: changedFiles.length,
    reason: result.reason,
    mobile_deep_reason: result.mobileDeepReason,
    pythagoras_reason: result.pythagorasReason,
    maintenance_reason: result.maintenanceReason,
  });

  console.log(`[ci-scope] mobile=${result.mobile} mobile-deep=${result.mobileDeep} pythagoras=${result.pythagoras} maintenance-only=${result.maintenanceOnly} changed=${changedFiles.length}`);
  console.log(`[ci-scope] mobile-reason=${result.reason}`);
  console.log(`[ci-scope] mobile-deep-reason=${result.mobileDeepReason}`);
  console.log(`[ci-scope] pythagoras-reason=${result.pythagorasReason}`);
  console.log(`[ci-scope] maintenance-reason=${result.maintenanceReason}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
