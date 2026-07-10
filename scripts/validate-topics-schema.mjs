import fs from 'node:fs';
import Ajv from 'ajv/dist/2020.js';

// Strict JSON-schema validation (ajv) of the metadata backbone, plus the
// cross-field invariants a schema alone cannot express. Complements the
// existing hand-rolled validate-meta-schema.mjs; this one guards the schema
// shape as the project scales toward thousands of pages.

const schema = JSON.parse(fs.readFileSync('schemas/topics.schema.json', 'utf8'));
const data = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const errors = [];

if (!validate(data)) {
  for (const err of validate.errors) {
    errors.push(`schema: ${err.instancePath || '/'} ${err.message}`);
  }
}

// Cross-field invariants.
const allPages = data.topics.flatMap((t) => t.pages);
if (data.totalPages !== allPages.length) {
  errors.push(`totalPages=${data.totalPages} but topics contain ${allPages.length} pages`);
}
for (const topic of data.topics) {
  if (topic.count !== topic.pages.length) {
    errors.push(`topic "${topic.name}": count=${topic.count} but has ${topic.pages.length} pages`);
  }
  for (const page of topic.pages) {
    if (page.topic !== topic.name) {
      errors.push(`${page.file}: page.topic "${page.topic}" != containing topic "${topic.name}"`);
    }
    if (!fs.existsSync(page.file)) {
      errors.push(`${page.file}: listed in topics.json but missing from repo root`);
    }
  }
}
const files = allPages.map((p) => p.file);
const dupes = files.filter((f, i) => files.indexOf(f) !== i);
if (dupes.length) errors.push(`duplicate page files across topics: ${[...new Set(dupes)].join(', ')}`);

const names = data.topics.map((t) => t.name);
const dupeNames = names.filter((n, i) => names.indexOf(n) !== i);
if (dupeNames.length) errors.push(`duplicate topic names: ${[...new Set(dupeNames)].join(', ')}`);

if (errors.length) {
  console.error('VALIDATE_TOPICS_SCHEMA_FAILED');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`VALIDATE_TOPICS_SCHEMA_OK (${data.topics.length} topics / ${data.totalPages} pages)`);
