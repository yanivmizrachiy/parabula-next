import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rulesPath = path.join(root, 'PROJECT_RULES.md');
const sectionTitle = '## 28) Dedicated equations route and scoped design pass';
const marker = '<!-- EQUATIONS_ROUTE_AND_DESIGN_PASS_RULES -->';

const section = `${marker}
${sectionTitle}

- ` + '`preview/equations.html`' + ` is the dedicated live access route for the exact non-quadratic equations topic: ` + '`משוואות`' + `.
- The dedicated equations route must read worksheet structure from ` + '`meta/topics.json`' + ` and must not create an alternate worksheet source.
- The route must not include, merge, rename, or blur the separate topic ` + '`משוואות ריבועיות`' + `.
- Current verified non-quadratic equations topic size: 54 pages.
- The scoped design pass for the 54 non-quadratic equations pages is real repository work, not a demo.
- Design-pass execution report: ` + '`STATE/EQUATIONS_DESIGN_PASS_APPLIED.md`' + `.
- Design-pass operating rules: ` + '`STATE/EQUATIONS_DESIGN_PASS_RULES.md`' + `.
- Design-pass script: ` + '`scripts/apply-equations-design-pass.mjs`' + `.
- Strict design guard: ` + '`scripts/validate-equations-design-pass-strict.mjs`' + `.
- Required validation command for this family: ` + '`npm run validate:equations:strict`' + `.
- The design pass may change only page-specific CSS under ` + '`styles/pages/עמוד-N.css`' + ` for pages in the exact ` + '`משוואות`' + ` topic.
- The design pass must not change worksheet learning content, root worksheet HTML, ` + '`styles/a4-base.css`' + `, or any quadratic-equation page.
- Equations CSS must remain page-scoped. Forbidden regressions include global selectors such as ` + '`.header-container`' + `, ` + '`.page-title`' + `, ` + '`body,html,.a4-page`' + `, and the legacy marker ` + '`EQUATIONS_STRICT_UNIFY`' + `.
- The equations print/PDF route is browser-driven through ` + '`preview/print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic`' + `.
- Do not mark this family fully complete unless real preview, phone viewing, and browser print / Save as PDF have been checked.
`;

let content = fs.readFileSync(rulesPath, 'utf8');

if (content.includes(marker)) {
  const before = content.slice(0, content.indexOf(marker)).trimEnd();
  content = `${before}\n\n${section}\n`;
} else {
  content = `${content.trimEnd()}\n\n${section}\n`;
}

fs.writeFileSync(rulesPath, content, 'utf8');
console.log('SYNC_EQUATIONS_RULES_SECTION_OK');
