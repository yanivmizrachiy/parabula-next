import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const browser = args.includes('--browser');
const attemptsArg = args.find((arg) => arg.startsWith('--attempts='));
const delayArg = args.find((arg) => arg.startsWith('--delay-ms='));
const attempts = Math.max(1, Number(attemptsArg?.slice('--attempts='.length)) || 20);
const delayMs = Math.max(0, Number(delayArg?.slice('--delay-ms='.length)) || 30000);
const evidenceDir = path.join(root, 'meta/audit/algebra-z-live');
const reportPath = path.join(evidenceDir, 'logo-free-live-verification.json');
const screenshotPath = path.join(evidenceDir, 'logo-free-live-verification.png');
const summaryPath = path.join(evidenceDir, 'logo-free-live-summary.json');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'meta/algebra-z-workbook.json'), 'utf8'));
const approved = {
  color: 'c2efa89f9e71384e60a29bfed96a0ffe55a56905a57ab42b273b06afd6deaff8',
  bw: '64658224a48acf9b682dcec4a8e00fa157910cbd01964a7ad92f00eae4535024'
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(message) {
  const summary = {
    checkedAt: new Date().toISOString(),
    ok: false,
    attempts,
    delayMs,
    error: message,
    expectedPresentation: manifest.presentation,
    expectedFiles: manifest.files,
    detailedReportPath: reportPath,
    screenshotPath: browser ? screenshotPath : null
  };
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

if (manifest.presentation?.logoRemoved !== true) {
  fail('manifest.presentation.logoRemoved must be true');
}
if (manifest.presentation?.logoRemovalScope !== 'all-15-pages-both-pdf-variants') {
  fail('manifest logoRemovalScope is not canonical');
}
if (manifest.presentation?.assetVersion !== 'logo-free-20260804') {
  fail('manifest assetVersion is not the approved logo-free release');
}
for (const mode of ['color', 'bw']) {
  const file = manifest.files?.[mode];
  if (!file?.path?.includes('/logo-free-20260804/')) {
    fail(`${mode}: PDF path is not uniquely logo-free versioned`);
  }
  if (file.sha256 !== approved[mode]) {
    fail(`${mode}: SHA-256 is not the approved logo-free release`);
  }
}

fs.mkdirSync(evidenceDir, { recursive: true });
let lastExitCode = null;
let succeededAtAttempt = null;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  console.log(`Algebra Z logo-free live verification — attempt ${attempt}/${attempts}`);

  const verifierArgs = [
    'scripts/verify-algebra-z-live.mjs',
    `--out=${reportPath}`
  ];
  if (browser) {
    verifierArgs.push('--browser', `--screenshot=${screenshotPath}`);
  }

  const result = spawnSync(process.execPath, verifierArgs, {
    cwd: root,
    env: process.env,
    encoding: 'utf8'
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  lastExitCode = result.status;

  if (result.error) {
    lastExitCode = null;
    console.error(`Verifier failed to start: ${result.error.message}`);
  }

  if (result.status === 0 && fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const livePresentation = report?.expected ? manifest.presentation : null;
    const livePathsMatch = ['color', 'bw'].every(
      (mode) => report.urls?.[mode]?.includes('/logo-free-20260804/') && report.evidence?.pdf?.[mode]?.sha256 === approved[mode]
    );

    if (report.ok === true && livePathsMatch) {
      succeededAtAttempt = attempt;
      const summary = {
        checkedAt: new Date().toISOString(),
        ok: true,
        succeededAtAttempt,
        attempts,
        delayMs,
        approvedHashes: approved,
        expectedPresentation: manifest.presentation,
        livePresentation,
        urls: report.urls,
        pdfEvidence: report.evidence.pdf,
        browserEvidence: report.evidence.browser || null,
        detailedReportPath: reportPath,
        screenshotPath: browser ? screenshotPath : null
      };
      fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
      console.log(JSON.stringify(summary, null, 2));
      process.exit(0);
    }
  }

  if (attempt < attempts) {
    console.log(`Live release is not ready yet; waiting ${Math.round(delayMs / 1000)} seconds…`);
    await sleep(delayMs);
  }
}

fail(`logo-free live verification did not pass after ${attempts} attempts; last exit code: ${lastExitCode}`);
