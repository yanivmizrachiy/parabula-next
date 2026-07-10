import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const master = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'equations-master-map.json'), 'utf8'));
const changed = [];
const failures = [];

const legacyScreenBlock = /\n@media screen and \(max-width: 900px\) \{[\s\S]*?\n\}\n\n@media screen and \(min-width: 481px\) and \(max-width: 900px\) \{[\s\S]*?\n\}\n/g;

for (const page of master.pages) {
  if (page.status !== 'LIVE') continue;
  const rel = `styles/pages/עמוד-${page.fileNum}.css`;
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${rel}`);
    continue;
  }

  const original = fs.readFileSync(file, 'utf8');
  let cleaned = original
    .replace(/חוזה עיצוב: STATE\/EQUATIONS_DESIGN_PASS_RULES\.md\./g, 'חוזה עיצוב: CLAUDE.md.')
    .replace(/מבנה v2 \+ מודל-זהב: ללא מספור תרגילים, משוואה ממורכזת בשטח האפור, אזור כתיבה, ואז ערך הנעלם\.\n\s*/g, 'מבנה HTML + MathJax חי. ')
    .replace(legacyScreenBlock, '\n');

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  if (/zoom:\s*0\./.test(cleaned)) failures.push(`${rel} still contains page-level zoom`);
  if (/STATE\/EQUATIONS_DESIGN_PASS_RULES\.md/.test(cleaned)) failures.push(`${rel} still references deleted rules`);

  if (cleaned !== original) {
    fs.writeFileSync(file, cleaned, 'utf8');
    changed.push(rel);
  }
}

console.log(JSON.stringify({ changed: changed.length, files: changed, failures }, null, 2));
if (failures.length) process.exit(1);
