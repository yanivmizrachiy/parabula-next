import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'PROJECT_RULES.md');
const target = path.join(root, 'rules.md');

const full = fs.readFileSync(source, 'utf8');

const short = `# rules.md

## Short rules
- Root A4 pages: \`עמוד-N.html\`
- Exact wrapper: \`main.a4-page.page-N\`
- No inline CSS
- Do not patch local layout problems inside \`styles/a4-base.css\`
- Use \`npm run preview\` as canonical preview
- Rules must stay synchronized with \`PROJECT_RULES.md\`
- Old content is first imported into \`sources/legacy/\`
- Nothing is promoted directly into canonical pages without review
- Use small safe commits
`;

fs.writeFileSync(target, short, 'utf8');
console.log('rules.md synced from PROJECT_RULES.md');