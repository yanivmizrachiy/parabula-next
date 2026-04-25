import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'meta', 'topics.json');
const mobilePath = path.join(root, 'mobile-topics.json');

if (!fs.existsSync(sourcePath)) {
  console.error('FAIL: meta/topics.json is missing');
  process.exit(1);
}

const raw = fs.readFileSync(sourcePath, 'utf8');
let payload;

try {
  payload = JSON.parse(raw);
} catch (error) {
  console.error(`FAIL: meta/topics.json is invalid JSON: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(payload?.topics)) {
  console.error('FAIL: meta/topics.json must contain a topics array');
  process.exit(1);
}

const pages = payload.topics.flatMap((topic) => topic.pages || []);
const uniqueFiles = new Set(pages.map((page) => page?.file).filter(Boolean));

if (typeof payload.totalPages !== 'number') {
  console.error('FAIL: meta/topics.json must declare totalPages');
  process.exit(1);
}

if (payload.totalPages !== pages.length || uniqueFiles.size !== pages.length) {
  console.error('FAIL: meta/topics.json has inconsistent totalPages or duplicate page entries');
  process.exit(1);
}

fs.writeFileSync(mobilePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`Synced mobile-topics.json from meta/topics.json (${payload.topics.length} topics)`);
