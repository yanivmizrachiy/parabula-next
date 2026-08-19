#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const DEFAULT_BASE_URL = 'https://yanivmizrachiy.github.io/razpages/';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function localSha() {
  if (process.env.GITHUB_SHA?.trim()) return process.env.GITHUB_SHA.trim();
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const baseUrl = process.argv[2]?.trim() || process.env.PAGE_URL?.trim() || DEFAULT_BASE_URL;
const expectedSha = process.argv[3]?.trim() || process.env.EXPECTED_SHA?.trim() || localSha();
const attempts = Number(process.env.LIVE_VERIFY_ATTEMPTS || 18);
const delayMs = Number(process.env.LIVE_VERIFY_DELAY_MS || 5000);

if (!expectedSha) throw new Error('Missing expected commit SHA for live deployment verification.');

const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
let lastError = null;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const url = new URL('build-info.json', normalizedBase);
    url.searchParams.set('expected', expectedSha.slice(0, 12));
    url.searchParams.set('attempt', String(attempt));
    url.searchParams.set('t', String(Date.now()));

    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache, no-store, max-age=0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const info = await response.json();
    if (info.sha !== expectedSha) {
      throw new Error(`live SHA ${info.sha || 'missing'} != expected ${expectedSha}`);
    }

    console.log(`[live-build] verified ${expectedSha.slice(0, 12)} at ${normalizedBase}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.log(`[live-build] attempt ${attempt}/${attempts}: ${error.message}`);
    if (attempt < attempts) await sleep(delayMs);
  }
}

throw new Error(`Live deployment did not reach ${expectedSha.slice(0, 12)}: ${lastError?.message || 'unknown error'}`);
