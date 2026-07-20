import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOPIC = 'מערכת משוואות בשני נעלמים';
const SITE = 'https://yanivmizrachiy.github.io/parabula-next';
const pages = [
  {
    "number": 601,
    "local": 1,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטת ההצבה.",
    "lines": 3,
    "systems": [["x+4y=14","y=x-4"],["2x+y=10","x=y+2"],["x+3y=13","y=x-1"],["x+3y=17","y=x-1"],["2x+3y=22","x=y+1"]]
  },
  {
    "number": 602,
    "local": 2,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטת ההצבה.",
    "lines": 4,
    "systems": [["x+3y=7","2x+y=4"],["y+2x=9","2y+x=12"],["y+3x=15","2y+x=10"],["x+2y=4","-4x-3y=4"],["5x-2y=4","y-x=1"]]
  },
  {
    "number": 603,
    "local": 3,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטת ההצבה.",
    "lines": 4,
    "systems": [["3x-5=4-2y","x-y=13"],["4x-5y+4=1","2x+6=y+5x-6"],["2y+3=4x-1","x+3y=1"],["4x-8=5y","18+6y+x=3y+3"],["3x-6=-5-y","2y-2x=3y-2"]]
  },
  {
    "number": 604,
    "local": 4,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטת ההצבה.",
    "lines": 6,
    "systems": [["x+3y-4=2y+4","4x-3(y+10)=12x-84"],["9x-8y=84","2(x+y)=2+y"],["2(2x-1)+3(y+5)=24","x-4y=17"],["6(3x-1)-5(x-1)=y-2","3(x+y)-6(x-7)=2y+63"]]
  },
  {
    "number": 605,
    "local": 5,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטה הנוחה לכם.",
    "lines": 7,
    "systems": [["2x+y=4","-2x+6y=3"],["4x-3y=-5","5y-6x=8"],["3x+7y=10","8y+x=9"]]
  },
  {
    "number": 606,
    "local": 6,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטה הנוחה לכם.",
    "lines": 8,
    "systems": [["3(x+y)+4(y-x)=6","5(x-2y)+6(x+3y)=19"],["\\frac{x}{7}+\\frac{y}{2}=2","x+2y=11"],["\\frac{x-3}{2}+\\frac{y}{4}=-3","\\frac{y-2}{3}+x=-5"]]
  },
  {
    "number": 607,
    "local": 7,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטה הנוחה לכם.",
    "lines": 11,
    "systems": [["\\frac{x+y}{5}+\\frac{2x-1}{3}=5","\\frac{x-y}{3}+10=\\frac{3x+y}{2}"],["\\frac{2x-y}{2}-\\frac{3x-2y}{3}=\\frac{x}{6}-\\frac{y+6}{12}","\\frac{y-3x}{5}+1=\\frac{11-y}{10}-\\frac{y-x}{2}"]]
  },
  {
    "number": 608,
    "local": 8,
    "instruction": "פתרו את מערכות המשוואות הבאות בשיטה הנוחה לכם.",
    "lines": 11,
    "systems": [["\\frac{x+y}{3}+\\frac{3x-1}{2}=\\frac{y+5}{6}","\\frac{2x-y}{5}-\\frac{3-y}{10}=\\frac{4-x-y}{15}"],["(2-x)(y+3)=-(x+4)(y+5)","(x+2)(y+5)=x(y+3)"]]
  }
];

const topicCss = `/* מערכת משוואות בשני נעלמים — שכבת נושא */
.systems2-page {
    --systems-ink: #17213a;
    --systems-blue: #1d4ed8;
    --systems-soft: #f7f9fc;
    --systems-line: #cbd5e1;
    --systems-border: #d7dfec;
    padding: 10mm 15mm 9mm;
}
.systems2-page .header-container { align-items: center; margin-bottom: 7px; padding-bottom: 7px; border-bottom: 1px solid var(--systems-blue); }
.systems2-page .title-wrap { display: flex; flex-direction: column; gap: 3px; }
.systems2-page .page-title { color: var(--systems-ink); font-size: 25px; font-weight: 650; line-height: 1.15; }
.systems2-page .page-subtitle { color: #475569; font-size: 13.5px; line-height: 1.35; }
.systems2-page .page-number { color: var(--systems-blue); border-color: var(--systems-blue); font-weight: 650; }
.systems2-page .question-block { justify-content: flex-start; gap: 7px; min-height: 0; }
.systems2-page .instruction { display: flex; align-items: center; gap: 9px; min-height: 34px; padding: 7px 11px; border-right: 4px solid var(--systems-blue); background: var(--systems-soft); color: var(--systems-ink); font-size: 15.5px; font-weight: 550; line-height: 1.35; }
.systems2-page .instruction::before { content: ""; width: 8px; height: 8px; flex: 0 0 8px; border-radius: 50%; background: #000; }
.systems2-page .systems-list { display: grid; grid-template-columns: 1fr; gap: 7px; min-height: 0; flex: 1 1 auto; }
.systems2-page .system-card { display: grid; grid-template-columns: 12px minmax(210px, 0.78fr) minmax(0, 1.22fr); grid-template-areas: "dot system work" ". answer work"; column-gap: 10px; row-gap: 4px; align-items: center; min-height: 0; padding: 7px 10px 7px 8px; border: 1px solid var(--systems-border); border-radius: 8px; background: #fff; break-inside: avoid; }
.systems2-page .qdot { grid-area: dot; width: 8px; height: 8px; border-radius: 50%; background: #000; align-self: start; margin-top: 13px; }
.systems2-page .system-math { grid-area: system; direction: ltr; unicode-bidi: isolate; text-align: center; color: #000; font-size: 18px; min-width: 0; }
.systems2-page .system-math mjx-container[display="true"] { margin: 0.15em 0 !important; }
.systems2-page .work-lines { grid-area: work; align-self: stretch; display: flex; flex-direction: column; justify-content: space-evenly; min-width: 0; border-right: 1px dashed var(--systems-line); padding-right: 10px; }
.systems2-page .work-line { height: 15px; border-bottom: 1px solid var(--systems-line); }
.systems2-page .final-answer { grid-area: answer; display: flex; justify-content: center; align-items: center; gap: 7px; direction: rtl; color: #334155; font-size: 12.5px; white-space: nowrap; }
.systems2-page .answer-pair { display: inline-flex; align-items: center; gap: 5px; direction: ltr; unicode-bidi: isolate; color: #000; font-size: 17px; }
.systems2-page .answer-box { width: 42px; height: 23px; margin: 0; transform: none; border: 1px solid #94a3b8; border-radius: 4px; background: #fff; }
.systems2-page .answer-box::before { left: 5px; right: 5px; bottom: 4px; border-bottom-color: #cbd5e1; }
.systems2-page > .gz-footer { margin-top: 5px; border-top-color: var(--systems-blue); }
.systems2-page.systems-dense .system-card { padding-top: 5px; padding-bottom: 5px; }
.systems2-page.systems-wide .system-card { grid-template-columns: 12px minmax(295px, 1fr); grid-template-areas: "dot system" ". work" ". answer"; align-items: start; padding: 10px 12px 8px; }
.systems2-page.systems-wide .qdot { margin-top: 15px; }
.systems2-page.systems-wide .system-math { text-align: right; font-size: 18px; }
.systems2-page.systems-wide .work-lines { border-right: 0; padding-right: 0; width: 100%; }
.systems2-page.systems-wide .final-answer { justify-content: flex-start; }
@media print { .systems2-page { padding: 10mm 15mm 9mm; } }
`;

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function card(system, lineCount) {
  const [first, second] = system;
  const lines = Array.from({ length: lineCount }, () => '<div class="work-line"></div>').join('\n                    ');
  return `            <section class="system-card">
                <span class="qdot" aria-hidden="true"></span>
                <div class="system-math">$$\\begin{cases} ${first} \\\\ ${second} \\end{cases}$$</div>
                <div class="work-lines" aria-label="מקום לכתיבת דרך הפתרון">
                    ${lines}
                </div>
                <div class="final-answer">
                    <span>תשובה סופית:</span>
                    <span class="answer-pair" aria-label="זוג סדור">
                        <span>(</span><span class="answer-box" aria-hidden="true"></span><span>,</span><span class="answer-box" aria-hidden="true"></span><span>)</span>
                    </span>
                </div>
            </section>`;
}

function pageHtml(page) {
  const prev = page.number === 601 ? 195 : page.number - 1;
  const next = page.number === 608 ? 320 : page.number + 1;
  const modifier = page.systems.length <= 3 ? ' systems-wide' : page.systems.length === 5 ? ' systems-dense' : '';
  const cards = page.systems.map((system) => card(system, page.lines)).join('\n');
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${page.local} — ${TOPIC}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${page.number}.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side"><a class="nav-link" href="עמוד-${prev}.html">הקודם</a></div>
            <div class="nav-meta">${TOPIC} — עמוד ${page.local} / ${pages.length}</div>
            <div class="nav-side"><a class="nav-link" href="עמוד-${next}.html">הבא</a></div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            <a class="topic-link" href="עמוד-125.html">אלגברה לכיתה ח'</a>
            <a class="topic-link is-active" href="עמוד-601.html" aria-current="page">${TOPIC}</a>
            <a class="topic-link" href="עמוד-320.html">גאומטריה ז</a>
        </div>
    </nav>

    <main class="a4-page page-${page.number} systems2-page${modifier}">
        <header class="header-container">
            <div class="title-wrap">
                <h1 class="page-title">${TOPIC}</h1>
                <p class="page-subtitle">דף עבודה · פתרון מלא ומסודר</p>
            </div>
            <div class="page-number">${page.local}</div>
        </header>

        <div class="question-block">
            <div class="instruction">${page.instruction}</div>
            <div class="systems-list">
${cards}
            </div>
        </div>

        <footer class="gz-footer">
            <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
            <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
        </footer>
    </main>
</body>
</html>
`;
}

for (const page of pages) {
  write(`עמוד-${page.number}.html`, pageHtml(page));
  write(`styles/pages/עמוד-${page.number}.css`, "@import url('../topics/two-variable-systems.css');\n");
}
write('styles/topics/two-variable-systems.css', topicCss);

const page195Path = path.join(ROOT, 'עמוד-195.html');
let page195 = fs.readFileSync(page195Path, 'utf8');
page195 = page195.replace(
  '<div class="nav-side"><a class="nav-link" href="עמוד-320.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-601.html">הבא</a></div>',
);
fs.writeFileSync(page195Path, page195, 'utf8');

const page320Path = path.join(ROOT, 'עמוד-320.html');
let page320 = fs.readFileSync(page320Path, 'utf8');
page320 = page320.replace(
  '<div class="nav-side"><a class="nav-link" href="עמוד-195.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-608.html">הקודם</a></div>',
);
fs.writeFileSync(page320Path, page320, 'utf8');

const curriculumPath = path.join(ROOT, 'scripts', 'curriculum-map.mjs');
let curriculum = fs.readFileSync(curriculumPath, 'utf8');
if (!curriculum.includes("'g8.alg.systems.substitution': ['601-608']")) {
  const anchor = "  'g8.alg.systems.graphic': ['190-194'],\n  'g8.alg.systems.elimination': [195],";
  const replacement = "  'g8.alg.systems.graphic': ['190-194'],\n  'g8.alg.systems.substitution': ['601-608'],\n  'g8.alg.systems.elimination': [195],";
  if (!curriculum.includes(anchor)) throw new Error('Curriculum insertion anchor not found');
  curriculum = curriculum.replace(anchor, replacement);
  fs.writeFileSync(curriculumPath, curriculum, 'utf8');
}

const topicsPath = path.join(ROOT, 'meta', 'topics.json');
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
topics.topics = topics.topics.filter((topic) => topic.name !== TOPIC);
const afterIndex = topics.topics.findIndex((topic) => topic.name === "אלגברה לכיתה ח'");
if (afterIndex < 0) throw new Error('Algebra 8 topic not found in meta/topics.json');
const topicEntry = {
  name: TOPIC,
  count: pages.length,
  pages: pages.map((page) => ({
    number: page.number,
    file: `עמוד-${page.number}.html`,
    title: `עמוד ${page.local} — ${TOPIC}`,
    h1: TOPIC,
    topic: TOPIC,
    previewPath: `/עמוד-${page.number}.html`,
    siteUrl: `${SITE}/עמוד-${page.number}.html`,
    curriculumId: 'g8.alg.systems.substitution',
  })),
};
topics.topics.splice(afterIndex + 1, 0, topicEntry);
topics.totalPages = topics.topics.reduce((sum, topic) => sum + topic.pages.length, 0);
topics.generatedAt = new Date().toISOString();
fs.writeFileSync(topicsPath, `${JSON.stringify(topics, null, 2)}\n`, 'utf8');

console.log(`[OK] נוצרו ${pages.length} דפי מערכת משוואות מהמקור בדרייב, בסדר מדורג.`);
