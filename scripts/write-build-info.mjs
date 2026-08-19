#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const outDir = process.argv[2] || 'dist';
const explicitSha = process.argv[3]?.trim();

function resolveSha() {
  if (explicitSha) return explicitSha;
  if (process.env.GITHUB_SHA?.trim()) return process.env.GITHUB_SHA.trim();
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const sha = resolveSha();
const info = {
  sha,
  shortSha: sha === 'unknown' ? sha : sha.slice(0, 12),
  builtAt: new Date().toISOString(),
};

fs.mkdirSync(outDir, { recursive: true });
const target = path.join(outDir, 'build-info.json');
fs.writeFileSync(target, `${JSON.stringify(info, null, 2)}\n`, 'utf8');
console.log(`[build-info] ${target} -> ${info.shortSha}`);
