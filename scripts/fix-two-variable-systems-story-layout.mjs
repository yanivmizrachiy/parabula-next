import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.join(process.cwd(), 'styles', 'topics', 'two-variable-systems.css');
let css = fs.readFileSync(cssPath, 'utf8');
const marker = '/* RTL story-card grid correction */';

if (!css.includes(marker)) {
  css += `
${marker}
.systems2-page .story-card {
    grid-template-areas: "dot content";
    direction: ltr;
}
.systems2-page .story-card .qdot {
    grid-area: dot;
}
.systems2-page .story-content {
    grid-area: content;
    direction: rtl;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
}

console.log('[OK] RTL story-card grid corrected.');
