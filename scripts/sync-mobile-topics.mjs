import fs from 'node:fs';

// mobile-topics.json is a legacy mirror of meta/topics.json. The runtime
// (mobile-app.js) reads meta/topics.json directly, but the deploy workflow
// and validate-mobile-runtime.mjs still ship/compare the mirror, so it must
// never diverge again (it was frozen at 6 topics / 95 pages until 2026-07-10).
//
// Usage:
//   node scripts/sync-mobile-topics.mjs          -> rewrite mirror from source
//   node scripts/sync-mobile-topics.mjs --check  -> exit 1 if diverged (CI gate)

const SOURCE = 'meta/topics.json';
const MIRROR = 'mobile-topics.json';

const checkOnly = process.argv.includes('--check');

const source = fs.readFileSync(SOURCE, 'utf8');
const mirror = fs.existsSync(MIRROR) ? fs.readFileSync(MIRROR, 'utf8') : '';
const inSync = source === mirror;

const summary = (raw) => {
  try {
    const data = JSON.parse(raw);
    return `${data.topics?.length ?? '?'} topics / ${data.totalPages ?? '?'} pages`;
  } catch {
    return 'unparseable';
  }
};

if (inSync) {
  console.log(`SYNC_MOBILE_TOPICS_OK (${summary(source)})`);
  process.exit(0);
}

if (checkOnly) {
  console.error('SYNC_MOBILE_TOPICS_DIVERGED');
  console.error(`- ${SOURCE}: ${summary(source)}`);
  console.error(`- ${MIRROR}: ${summary(mirror)}`);
  console.error('Run: npm run topics:sync');
  process.exit(1);
}

fs.writeFileSync(MIRROR, source);
console.log(`SYNC_MOBILE_TOPICS_SYNCED (${summary(source)})`);
