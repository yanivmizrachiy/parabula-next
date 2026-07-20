import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOPIC = 'מערכת משוואות בשני נעלמים';
const SITE = 'https://yanivmizrachiy.github.io/parabula-next';
const TOTAL = 15;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return source.replace(from, to);
}

function systemMath(first, second) {
  return `$$\\begin{cases} ${first} \\\\ ${second} \\end{cases}$$`;
}

function workLines(count) {
  return Array.from({ length: count }, () => '<div class="work-line"></div>').join('\n                    ');
}

function answerPair() {
  return `<div class="final-answer">
                    <span>תשובה סופית:</span>
                    <span class="answer-pair" aria-label="זוג סדור">
                        <span>(</span><span class="answer-box" aria-hidden="true"></span><span>,</span><span class="answer-box" aria-hidden="true"></span><span>)</span>
                    </span>
                </div>`;
}

function systemCard([first, second], lines = 5) {
  return `            <section class="system-card">
                <span class="qdot" aria-hidden="true"></span>
                <div class="system-math">${systemMath(first, second)}</div>
                <div class="work-lines" aria-label="מקום לכתיבת דרך הפתרון">
                    ${workLines(lines)}
                </div>
                ${answerPair()}
            </section>`;
}

function commonPage({ number, local, prev, next, subtitle, modifier = '', body }) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${local} — ${TOPIC}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${number}.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side"><a class="nav-link" href="עמוד-${prev}.html">הקודם</a></div>
            <div class="nav-meta">${TOPIC} — עמוד ${local} / ${TOTAL}</div>
            <div class="nav-side"><a class="nav-link" href="עמוד-${next}.html">הבא</a></div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            <a class="topic-link" href="עמוד-125.html">אלגברה לכיתה ח'</a>
            <a class="topic-link is-active" href="עמוד-609.html" aria-current="page">${TOPIC}</a>
            <a class="topic-link" href="עמוד-320.html">גאומטריה ז</a>
        </div>
    </nav>

    <main class="a4-page page-${number} systems2-page${modifier}">
        <header class="header-container">
            <div class="title-wrap">
                <h1 class="page-title">${TOPIC}</h1>
                <p class="page-subtitle">${subtitle}</p>
            </div>
            <div class="page-number">${local}</div>
        </header>

${body}

        <footer class="gz-footer">
            <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
            <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
        </footer>
    </main>
</body>
</html>
`;
}

const introSystems = [
  ['x+y=12', 'x=8'],
  ['2x-5y=3', 'x=4'],
  ['x-y=5', 'y=2'],
  ['y=2', '4x-7y=6'],
];

const simplifySystems = [
  ['13+5y=7+4x', '5-x=3y-5'],
  ['8-y=2x-2', '2x+4=6-3y'],
  ['3(x-2y)=4(y+2)', '16=3x-2y'],
  ['2(y+3)-(2x-6)=-10', '3(y-2x)+42=8x+3y'],
  ['3(x+8)+5(3y-5)=90-x', '7(x-1)-11-y=-(10-3y)'],
  ['5(4x+6)-x=2-(3y+1)', '4(8-x)+3(2y+4)=100-10y'],
];

const fractionSystems = [
  ['\\frac{y-x}{4}=\\frac{y-1}{3}', '\\frac{y-x}{5}-y=x+4'],
  ['\\frac{2y}{3}-3=\\frac{3x-1}{5}', '\\frac{3y}{4}-\\frac{2x+6}{5}=\\frac{10}{4}'],
  ['\\frac{3x}{4}+\\frac{2y}{3}=2', '\\frac{7x}{8}+\\frac{5y}{6}=2'],
  ['\\frac{x}{2}-\\frac{y}{3}=\\frac{5}{6}', '\\frac{x}{4}+\\frac{y}{2}=\\frac{7}{4}'],
];

const classifySystems = [
  ['3x-y+5=3y-x+1', '3x-5y+3=2y-4x-4'],
  ['4(x-6)-6y=2y-2', '3(y+1)-7y=14-2x'],
  ['y-3x=-8', '2y-x=14'],
];

const mazeSystems = [
  { s: ['y=2x+1', 'x=3'], options: ['(3,7)', '(3,2)', '(1,3)'] },
  { s: ['y+3x=-10', 'y=x+2'], options: ['(-3,-1)', '(-3,5)', '(1,-3)'] },
  { s: ['x-7y=-20', '-10x+7y=11'], options: ['(1,3)', '(1,-1)', '(3,1)'] },
  { s: ['y-x=3', '6x+4y=72'], options: ['(6,9)', '(6,10)', '(8,7)'] },
  { s: ['6x-10y=42', 'y=-3'], options: ['(2,-3)', '(3,-4)', '(5,-3)'] },
  { s: ['7x+6y=-4', '6x-y=58'], options: ['(8,-10)', '(8,2)', '(7,-9)'] },
  { s: ['x+2y=5', '3x-y=1'], options: ['(1,2)', '(1,4)', '(2,1)'] },
  { s: ['2x-3y=6', 'y=-2-4x'], options: ['(0,-2)', '(1,-6)', '(-1,2)'] },
  { s: ['x+y=15', 'y=2x'], options: ['(5,10)', '(5,4)', '(6,9)'] },
  { s: ['x+2y=7', '2x-2y=-4'], options: ['(1,3)', '(3,1)', '(1,7)'] },
  { s: ['6x-5y=7', 'y=x+1'], options: ['(12,13)', '(3,8)', '(8,7)'] },
  { s: ['y=x+4', '2x+2y=32'], options: ['(6,10)', '(5,10)', '(4,8)'] },
  { s: ['x+3y=7', '3x-2y=10'], options: ['(4,1)', '(1,4)', '(7,1)'] },
  { s: ['x-3y=4', '3x-y=20'], options: ['(7,1)', '(7,3)', '(4,1)'] },
  { s: ['6x+y=-4', '4x+6y=24'], options: ['(-1.5,5)', '(-2,-1)', '(1,2)'] },
];

const stories = [
  {
    text: 'במגרש חנייה היו מכוניות ואופנועים. בסך הכול היו 34 כלי רכב, ומספר הגלגלים הכולל היה 118. כמה מכוניות וכמה אופנועים היו במגרש?',
    vars: 'הגדירו שני נעלמים למספר המכוניות ולמספר האופנועים.',
  },
  {
    text: 'בשני חדרים היו יחד 72 ילדים. לחדר אחד הצטרפו 7 ילדים, ומן החדר השני יצא ילד אחד. לאחר השינוי היה בשני החדרים מספר שווה של ילדים. כמה ילדים היו בתחילה בכל חדר?',
    vars: 'הגדירו שני נעלמים למספר הילדים ההתחלתי בכל חדר.',
  },
  {
    text: 'מחיר שולחן ו-4 כיסאות הוא 1,500 שקלים. מחיר שני שולחנות ו-6 כיסאות הוא 2,500 שקלים. מה מחיר שולחן ומה מחיר כיסא?',
    vars: 'הגדירו שני נעלמים למחיר שולחן ולמחיר כיסא.',
  },
  {
    text: 'היקף מלבן הוא 144 ס"מ. מקטינים את אורך אחת מצלעותיו פי 3 ומגדילים את הצלע הסמוכה ב-8 ס"מ, ומתקבל ריבוע. מצאו את אורכי צלעות המלבן ואת צלע הריבוע.',
    vars: 'הגדירו שני נעלמים לאורכי שתי צלעות המלבן.',
  },
];

const page609 = commonPage({
  number: 609,
  local: 1,
  prev: 573,
  next: 601,
  subtitle: 'פתיחה מדורגת · נעלם אחד כבר מבודד',
  modifier: ' systems-intro',
  body: `        <div class="question-block">
            <div class="instruction">פתרו את המערכות. התחילו בהצבה ישירה של הערך הנתון.</div>
            <div class="systems-list">
${introSystems.map((system) => systemCard(system, 5)).join('\n')}
            </div>
        </div>`,
});

const page610 = commonPage({
  number: 610,
  local: 10,
  prev: 608,
  next: 611,
  subtitle: 'פישוט, פתיחת סוגריים וסידור המשוואות',
  modifier: ' systems-dense',
  body: `        <div class="question-block">
            <div class="instruction">הביאו תחילה כל משוואה לצורה מסודרת, ולאחר מכן פתרו את המערכת.</div>
            <div class="systems-list">
${simplifySystems.map((system) => systemCard(system, 4)).join('\n')}
            </div>
        </div>`,
});

const page611 = commonPage({
  number: 611,
  local: 11,
  prev: 610,
  next: 612,
  subtitle: 'בניית מערכת מתוך מצב מילולי',
  modifier: ' systems-stories',
  body: `        <div class="question-block">
            <div class="instruction">בכל מצב: הגדירו נעלמים, כתבו שתי משוואות, פתרו ונסחו תשובה מילולית.</div>
            <div class="story-list">
${stories.map((story) => `                <section class="story-card">
                    <span class="qdot" aria-hidden="true"></span>
                    <div class="story-content">
                        <p class="story-text">${story.text}</p>
                        <p class="story-hint">${story.vars}</p>
                        <div class="model-grid">
                            <span>הגדרת נעלמים:</span><span class="model-line"></span>
                            <span>מערכת משוואות:</span><span class="model-line"></span>
                            <span>פתרון ותשובה:</span><span class="model-line"></span>
                        </div>
                    </div>
                </section>`).join('\n')}
            </div>
        </div>`,
});

const page612 = commonPage({
  number: 612,
  local: 12,
  prev: 611,
  next: 613,
  subtitle: 'מערכות משוואות עם שברים',
  modifier: ' systems-wide systems-fractions',
  body: `        <div class="question-block">
            <div class="instruction">כפלו במכנה משותף מתאים, פשטו ופתרו בשיטה הנוחה לכם.</div>
            <div class="systems-list">
${fractionSystems.map((system) => systemCard(system, 6)).join('\n')}
            </div>
        </div>`,
});

const page613 = commonPage({
  number: 613,
  local: 13,
  prev: 612,
  next: 614,
  subtitle: 'פתרון יחיד, אין פתרון או אינסוף פתרונות',
  modifier: ' systems-classify',
  body: `        <div class="question-block">
            <div class="instruction">סדרו את המשוואות, השוו בין הישרים וקבעו את מספר הפתרונות. פתרו רק כאשר יש פתרון יחיד.</div>
            <div class="classification-list">
${classifySystems.map((system) => `                <section class="classification-card">
                    <span class="qdot" aria-hidden="true"></span>
                    <div class="classification-math">${systemMath(system[0], system[1])}</div>
                    <div class="choice-row" aria-label="בחירת מספר פתרונות">
                        <span class="choice-chip">פתרון יחיד</span>
                        <span class="choice-chip">אין פתרון</span>
                        <span class="choice-chip">אינסוף פתרונות</span>
                    </div>
                    <div class="classification-reason">נימוק: <span class="reason-line"></span></div>
                </section>`).join('\n')}
            </div>
        </div>`,
});

function challengeCard(item) {
  return `                <section class="challenge-card">
                    <span class="qdot" aria-hidden="true"></span>
                    <div class="challenge-math">${systemMath(item.s[0], item.s[1])}</div>
                    <div class="option-row">
                        ${item.options.map((option) => `<span class="option-chip">${option}</span>`).join('')}
                    </div>
                </section>`;
}

const page614 = commonPage({
  number: 614,
  local: 14,
  prev: 613,
  next: 615,
  subtitle: 'אתגר מסלול · חלק א',
  modifier: ' systems-challenge',
  body: `        <div class="question-block">
            <div class="instruction">פתרו כל מערכת והקיפו את הזוג הסדור המתאים. רשמו את אות התחנה לפי הסדר במחברת.</div>
            <div class="challenge-grid">
${mazeSystems.slice(0, 8).map(challengeCard).join('\n')}
            </div>
        </div>`,
});

const page615 = commonPage({
  number: 615,
  local: 15,
  prev: 614,
  next: 531,
  subtitle: 'אתגר מסלול · חלק ב',
  modifier: ' systems-challenge',
  body: `        <div class="question-block">
            <div class="instruction">השלימו את האתגר: פתרו והקיפו בכל תחנה את הזוג הסדור הנכון.</div>
            <div class="challenge-grid challenge-grid-seven">
${mazeSystems.slice(8).map(challengeCard).join('\n')}
            </div>
            <div class="challenge-finish">סיימתם? בדקו כל פתרון באמצעות הצבה בשתי המשוואות.</div>
        </div>`,
});

for (const [number, html] of [[609, page609], [610, page610], [611, page611], [612, page612], [613, page613], [614, page614], [615, page615]]) {
  write(`עמוד-${number}.html`, html);
  write(`styles/pages/עמוד-${number}.css`, "@import url('../topics/two-variable-systems.css');\n");
}

const existingOrder = [601, 602, 603, 604, 605, 606, 607, 608];
for (let i = 0; i < existingOrder.length; i++) {
  const number = existingOrder[i];
  const local = i + 2;
  const prev = i === 0 ? 609 : existingOrder[i - 1];
  const next = i === existingOrder.length - 1 ? 610 : existingOrder[i + 1];
  const file = `עמוד-${number}.html`;
  let html = read(file);
  html = html.replace(/<title>עמוד \d+ — מערכת משוואות בשני נעלמים<\/title>/u, `<title>עמוד ${local} — ${TOPIC}</title>`);
  html = html.replace(/מערכת משוואות בשני נעלמים — עמוד \d+ \/ \d+/u, `${TOPIC} — עמוד ${local} / ${TOTAL}`);
  html = html.replace(/<div class="page-number">\d+<\/div>/u, `<div class="page-number">${local}</div>`);
  html = html.replace(/<div class="nav-side"><a class="nav-link" href="עמוד-\d+\.html">הקודם<\/a><\/div>/u, `<div class="nav-side"><a class="nav-link" href="עמוד-${prev}.html">הקודם</a></div>`);
  html = html.replace(/<div class="nav-side"><a class="nav-link" href="עמוד-\d+\.html">הבא<\/a><\/div>/u, `<div class="nav-side"><a class="nav-link" href="עמוד-${next}.html">הבא</a></div>`);
  write(file, html);
}

let page573 = read('עמוד-573.html');
page573 = replaceOnce(
  page573,
  '<div class="nav-side"><a class="nav-link" href="עמוד-601.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-609.html">הבא</a></div>',
  'עמוד-573.html',
);
write('עמוד-573.html', page573);

let page531 = read('עמוד-531.html');
page531 = replaceOnce(
  page531,
  '<div class="nav-side"><a class="nav-link" href="עמוד-608.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-615.html">הקודם</a></div>',
  'עמוד-531.html',
);
write('עמוד-531.html', page531);

const cssPath = 'styles/topics/two-variable-systems.css';
let css = read(cssPath);
const extensionMarker = '/* Drive sync extension: basic, stories, classification and challenge pages */';
if (!css.includes(extensionMarker)) {
  css += `\n${extensionMarker}
.systems2-page.systems-intro .system-card { min-height: 132px; }
.systems2-page.systems-intro .system-math { font-size: 20px; }
.systems2-page.systems-stories .question-block { gap: 6px; }
.systems2-page .story-list { display: grid; grid-template-columns: 1fr; gap: 7px; flex: 1 1 auto; min-height: 0; }
.systems2-page .story-card { display: grid; grid-template-columns: 12px 1fr; gap: 9px; padding: 8px 11px; border: 1px solid var(--systems-border); border-radius: 8px; background: #fff; break-inside: avoid; }
.systems2-page .story-card .qdot { margin-top: 7px; }
.systems2-page .story-content { min-width: 0; }
.systems2-page .story-text { margin: 0 0 3px; color: #111827; font-size: 14.5px; line-height: 1.45; }
.systems2-page .story-hint { margin: 0 0 5px; color: #475569; font-size: 12px; line-height: 1.35; }
.systems2-page .model-grid { display: grid; grid-template-columns: 112px 1fr; gap: 4px 8px; align-items: end; color: #334155; font-size: 11.5px; }
.systems2-page .model-line { height: 18px; border-bottom: 1px solid var(--systems-line); }
.systems2-page.systems-fractions .system-math { font-size: 17px; }
.systems2-page .classification-list { display: grid; gap: 9px; flex: 1 1 auto; }
.systems2-page .classification-card { display: grid; grid-template-columns: 12px 1fr; grid-template-areas: "dot math" ". choices" ". reason"; gap: 7px 10px; padding: 12px; border: 1px solid var(--systems-border); border-radius: 9px; background: #fff; }
.systems2-page .classification-card .qdot { grid-area: dot; margin-top: 14px; }
.systems2-page .classification-math { grid-area: math; direction: ltr; unicode-bidi: isolate; font-size: 19px; text-align: center; }
.systems2-page .classification-math mjx-container[display="true"] { margin: 0.15em 0 !important; }
.systems2-page .choice-row { grid-area: choices; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.systems2-page .choice-chip, .systems2-page .option-chip { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 3px 11px; border: 1px solid #94a3b8; border-radius: 999px; background: #fff; color: #0f172a; font-size: 12.5px; }
.systems2-page .choice-chip::before, .systems2-page .option-chip::before { content: ""; width: 10px; height: 10px; margin-left: 6px; border: 1px solid #64748b; border-radius: 50%; }
.systems2-page .classification-reason { grid-area: reason; display: flex; align-items: end; gap: 7px; color: #475569; font-size: 12px; }
.systems2-page .reason-line { flex: 1; height: 18px; border-bottom: 1px solid var(--systems-line); }
.systems2-page .challenge-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; flex: 1 1 auto; min-height: 0; }
.systems2-page .challenge-card { display: grid; grid-template-columns: 10px 1fr; grid-template-areas: "dot math" ". options"; gap: 4px 7px; align-items: center; padding: 6px 8px; border: 1px solid var(--systems-border); border-radius: 8px; background: #fff; break-inside: avoid; }
.systems2-page .challenge-card .qdot { grid-area: dot; width: 7px; height: 7px; margin-top: 9px; }
.systems2-page .challenge-math { grid-area: math; direction: ltr; unicode-bidi: isolate; text-align: center; font-size: 15.5px; }
.systems2-page .challenge-math mjx-container[display="true"] { margin: 0.08em 0 !important; }
.systems2-page .option-row { grid-area: options; display: flex; justify-content: center; gap: 4px; direction: ltr; }
.systems2-page .option-chip { min-height: 23px; padding: 1px 6px; font-size: 10.5px; }
.systems2-page .option-chip::before { width: 7px; height: 7px; margin-left: 3px; }
.systems2-page .challenge-finish { margin-top: 4px; padding: 6px 10px; border: 1px dashed var(--systems-blue); border-radius: 7px; text-align: center; color: #1e3a8a; font-size: 12px; font-weight: 550; }
`;
  write(cssPath, css);
}

const curriculumPath = 'scripts/curriculum-map.mjs';
let curriculum = read(curriculumPath);
curriculum = curriculum.replace(
  /'g8\.alg\.systems\.graphic': \[[^\]]*\],/u,
  "'g8.alg.systems.graphic': ['190-194', 613],",
);
curriculum = curriculum.replace(
  /'g8\.alg\.systems\.substitution': \[[^\]]*\],/u,
  "'g8.alg.systems.substitution': ['601-612', '614-615'],",
);
write(curriculumPath, curriculum);

const topicOrder = [609, 601, 602, 603, 604, 605, 606, 607, 608, 610, 611, 612, 613, 614, 615];
const topicsPath = 'meta/topics.json';
const topics = JSON.parse(read(topicsPath));
const topicIndex = topics.topics.findIndex((topic) => topic.name === TOPIC);
if (topicIndex < 0) throw new Error(`Topic not found: ${TOPIC}`);
const topicEntry = {
  name: TOPIC,
  count: TOTAL,
  pages: topicOrder.map((number, index) => ({
    number,
    file: `עמוד-${number}.html`,
    title: `עמוד ${index + 1} — ${TOPIC}`,
    h1: TOPIC,
    topic: TOPIC,
    previewPath: `/עמוד-${number}.html`,
    siteUrl: `${SITE}/עמוד-${number}.html`,
    curriculumId: number === 613 ? 'g8.alg.systems.graphic' : 'g8.alg.systems.substitution',
  })),
};
topics.topics.splice(topicIndex, 1, topicEntry);
topics.totalPages = topics.topics.reduce((sum, topic) => sum + topic.pages.length, 0);
topics.generatedAt = new Date().toISOString();
write(topicsPath, `${JSON.stringify(topics, null, 2)}\n`);

const syncManifest = {
  generatedAt: new Date().toISOString(),
  topic: TOPIC,
  repositoryPages: topicOrder,
  policy: {
    canonicalRule: 'Import unique mathematical tasks once, order from easy to hard, and map duplicate or out-of-scope Drive files without copying them again.',
    existingCoverage: {
      graphicalLinearSystems: [190, 191, 192, 193, 194],
      eliminationAndApplication: [195],
    },
  },
  sources: [
    {
      role: 'primary-graded-workbook',
      canonicalDriveId: '10XCu6l4sot6C8R62J7caSZXfaftMf_By',
      duplicateDriveIds: ['1N5pVGpokCTflHKT5DAVsHMkVb3XmIPQm'],
      importedToPages: [601, 602, 603, 604, 605, 606, 607, 608],
    },
    {
      role: 'basic-entry-sheet',
      canonicalDriveId: '1URy_irCAY_uZvmMMHsilMIlLvLMnYrgY',
      duplicateDriveIds: ['1hZokImMxwrNCTLW-yn2pBPYpdNbKIl01'],
      importedToPages: [609],
    },
    {
      role: 'summer-review-part-b',
      canonicalDriveId: '1ld5FTXE7vnRSrX4LO8YEu4iPKsMQjHHH',
      importedToPages: [610, 611, 612, 613],
      mappedWithoutDuplication: {
        graphMatchingExercise: [190, 191, 192, 193, 194],
      },
      skipped: [{ exercise: 13, reason: 'The embedded system and ordered pairs are absent/unreadable in the source PDF render.' }],
    },
    {
      role: 'maze-practice',
      canonicalDriveId: '1W2OfNGTGkKe2-pnYbRv-0TlBC6uz3mz-',
      duplicateDriveIds: ['1Gq8W1I_nPqkejg7aC7c4fdizikf1XMav', '1kv4wYSiEyA8ioYLSgfgJOUr9GRieqdhm', '1B5E-ho2Njsh3SG62ayId-LrxNRepgagP'],
      importedToPages: [614, 615],
      transformation: 'The 15 systems were retained, but the third-party maze layout was replaced by an original multiple-choice challenge layout.',
    },
    {
      role: 'grade-9-nonlinear-graphical-systems',
      canonicalDriveId: '16JOy5u5VAFwKHp_2XElb_jEHtllh5Zqn',
      duplicateDriveIds: ['1YGOEGdDsDjF4UDE_yCM_lAyUcve6vUEv'],
      importedToPages: [],
      reason: 'Quadratic-function intersections belong to a separate grade-9 nonlinear systems topic and are intentionally not mixed into the grade-8 linear workbook.',
    },
  ],
};
write('meta/systems-drive-sync.json', `${JSON.stringify(syncManifest, null, 2)}\n`);

console.log(`[OK] Drive sync generated ${TOTAL} ordered pages for ${TOPIC}.`);
