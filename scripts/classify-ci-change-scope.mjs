#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

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

export function isMobileRelevantPath(file) {
  return MOBILE_RELEVANT_PATTERNS.some((pattern) => pattern.test(file));
}

export function classifyChangeScope({ eventName, changedFiles }) {
  if (eventName !== 'pull_request') {
    return {
      mobile: true,
      reason: 'full validation is mandatory outside pull requests',
    };
  }

  const matched = changedFiles.filter(isMobileRelevantPath);
  return {
    mobile: matched.length > 0,
    reason: matched.length > 0
      ? `mobile-relevant files changed: ${matched.join(', ')}`
      : 'no mobile, reader, A4, style, asset, PWA or build files changed',
  };
}

function readChangedFiles(baseSha, headSha) {
  if (!baseSha || !headSha) {
    throw new Error('Pull-request scope classification requires BASE_SHA and HEAD_SHA');
  }

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
  const changedFiles = eventName === 'pull_request'
    ? readChangedFiles(process.env.BASE_SHA, process.env.HEAD_SHA)
    : [];
  const result = classifyChangeScope({ eventName, changedFiles });

  writeOutputs(process.env.GITHUB_OUTPUT, {
    mobile: result.mobile,
    changed_count: changedFiles.length,
    reason: result.reason,
  });

  console.log(`[ci-scope] mobile=${result.mobile} changed=${changedFiles.length} reason=${result.reason}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
