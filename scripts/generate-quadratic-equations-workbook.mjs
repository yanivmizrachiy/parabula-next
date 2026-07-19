import fs from 'node:fs';
import path from 'node:path';
import {
  exerciseCount,
  pageCount,
  pages,
  sourceExerciseCount,
} from '../sources/quadratic-equations/workbook-data.mjs';

const root = process.cwd();
const topicName = 'משוואות ריבועיות';

const escapeHtml = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const stripMath = value => value
  .replaceAll('\\(', '')
  .replaceAll('\\)', '')
  .replaceAll('\\pm', '±')
  .replaceAll('\\ne', '≠')
  .replaceAll('^2', '²');

const renderTitle = (value, sectionNumber) => {
  const match = value.match(/^(.*)\\\((.*)\\\)$/u);
  if (!match) return `<h1 class="page-title"><span class="title-text">${escapeHtml(value)}</span></h1>`;
  const [, text, formula] = match;
  const longClass = sectionNumber >= 15 ? ' long-formula' : '';
  return `<h1 class="page-title has-formula${longClass}"><span class="title-text">${escapeHtml(text.trim())}</span><span class="title-formula" dir="ltr">\\(${formula}\\)</span></h1>`;
};

const responseKind = answer => {
  if (answer.includes('אין פתרון')) return 'phrase';
  if (answer.includes('x_1=') || answer.includes('x_{1,2}') || answer.includes('\\pm')) return 'pair';
  return 'single';
};

const responseFields = exercise => {
  const domain = exercise.restriction
    ? `<div class="domain-entry"><span>תחום הצבה:</span><span class="write-line domain-line"></span></div>`
    : '';
  const kind = responseKind(exercise.answer);
  if (kind === 'pair') {
    return `${domain}<div class="answer-entry pair-entry" dir="ltr"><span>\\(x_1=\\)</span><span class="root-box"></span><span>\\(x_2=\\)</span><span class="root-box"></span></div>`;
  }
  return `${domain}<div class="answer-entry"><span>פתרון:</span><span class="write-line ${kind === 'phrase' ? 'phrase-line' : ''}"></span></div>`;
};

const renderExercise = exercise => {
  const localIndex = exercise.id.split('-')[1];
  return `
          <article class="exercise-card" data-exercise-id="${exercise.id}" data-level="${exercise.level}">
            <div class="exercise-head">
              <span class="exercise-index" aria-label="תרגיל ${localIndex}">${localIndex}</span>
              <span class="method-chip">${escapeHtml(exercise.method)}</span>
            </div>
            <div class="equation" dir="ltr">\\(${exercise.equation}\\)</div>
            <div class="work-area" aria-label="אזור חישוב"></div>
            <div class="response-area${exercise.restriction ? ' has-domain' : ''}">${responseFields(exercise)}</div>
          </article>`;
};

const renderSolutions = exercises => exercises.map(exercise => {
  const localIndex = exercise.id.split('-')[1];
  const domain = exercise.restriction ? `<span class="solution-domain"><span>תחום:</span><span dir="ltr">\\(${exercise.restriction}\\)</span></span>` : '';
  return `<div class="solution-item"><span class="solution-index">${localIndex}</span><span dir="ltr">\\(${exercise.answer}\\)</span>${domain}</div>`;
}).join('\n');

const topicLinks = globalNumber => `
        <a class="topic-link" href="עמוד-1.html">חוקיות</a>
        <a class="topic-link" href="עמוד-3.html">פונקציה ריבועית</a>
        <a class="topic-link" href="עמוד-9.html">משפט פיתגורס</a>
        <a class="topic-link is-active" href="עמוד-${globalNumber}.html" aria-current="page">משוואות ריבועיות</a>
        <a class="topic-link" href="עמוד-37.html">פילוג מורחב</a>
        <a class="topic-link" href="עמוד-42.html">משוואות</a>`;

const renderPage = (page, index) => {
  const previousFile = index === 0 ? 'עמוד-41.html' : `עמוד-${pages[index - 1].globalNumber}.html`;
  const nextFile = index === pages.length - 1 ? 'עמוד-37.html' : `עמוד-${pages[index + 1].globalNumber}.html`;
  const pageTitle = `עמוד ${page.localNumber} — ${stripMath(page.title)}`;
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [["\\\\(", "\\\\)"]] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css" />
    <link rel="stylesheet" href="styles/topics/quadratic-equations.css" />
    <link rel="stylesheet" href="styles/pages/עמוד-${page.globalNumber}.css" />
  </head>
  <body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
      <div class="preview-nav-top">
        <div class="nav-side"><a class="nav-link" href="${previousFile}">הקודם</a></div>
        <div class="nav-meta">משוואות ריבועיות — עמוד ${page.localNumber} / ${pageCount}</div>
        <div class="nav-side"><a class="nav-link" href="${nextFile}">הבא</a></div>
      </div>
      <div class="preview-nav-topics" aria-label="מעבר בין נושאים">${topicLinks(page.globalNumber)}
      </div>
    </nav>

    <main class="a4-page page-${page.globalNumber} quadratic-page count-${page.exercises.length}" data-section="${page.number}" data-local-page="${page.localNumber}">
      <header class="header-container">
        <div class="title-wrap">
          <div class="eyebrow">תרגול מדורג לכיתה ט׳ · חלק ${page.sectionPage} מתוך ${page.sectionPageCount}</div>
          ${renderTitle(page.title, page.number)}
        </div>
        <div class="page-number">${page.localNumber}</div>
      </header>

      <section class="question-block">
        <div class="q-main">
          <div class="bullet-container"><div class="bullet-large"></div></div>
          <div class="q-text">${page.prompt}</div>
        </div>
        <div class="exercise-grid">${page.exercises.map(renderExercise).join('')}
        </div>
      </section>

      <section class="answers-panel" aria-label="תשובות לבדיקה עצמית">
        <div class="answers-heading"><span>תשובות לבדיקה עצמית</span><small>${page.exercises.length} תרגילים</small></div>
        <div class="solutions-grid">${renderSolutions(page.exercises)}</div>
      </section>

      <footer class="quadratic-footer">
        <span>יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</span>
        <span>משוואות ריבועיות · ${exerciseCount} תרגילים מקוריים · פי 2 מחוברת המקור (${sourceExerciseCount})</span>
      </footer>
    </main>
  </body>
</html>
`;
};

for (const [index, page] of pages.entries()) {
  fs.writeFileSync(path.join(root, `עמוד-${page.globalNumber}.html`), renderPage(page, index), 'utf8');
  fs.writeFileSync(
    path.join(root, 'styles', 'pages', `עמוד-${page.globalNumber}.css`),
    `/* עמוד ${page.globalNumber} — משתמש בשכבת הנושא styles/topics/quadratic-equations.css */\n`,
    'utf8',
  );
}

const topicsPath = path.join(root, 'meta', 'topics.json');
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const topic = topics.topics.find(candidate => candidate.name === topicName);
if (!topic) throw new Error(`topic not found: ${topicName}`);
topic.count = pageCount;
topic.pages = pages.map(page => ({
  number: page.globalNumber,
  file: `עמוד-${page.globalNumber}.html`,
  title: `עמוד ${page.localNumber} — ${stripMath(page.title)}`,
  h1: page.title,
  topic: topicName,
  curriculumId: page.curriculumId,
  previewPath: `/עמוד-${page.globalNumber}.html`,
  siteUrl: `https://yanivmizrachiy.github.io/parabula-next/עמוד-${page.globalNumber}.html`,
}));
topics.totalPages = Math.max(
  ...topics.topics.flatMap(candidate => candidate.pages.map(page => page.number)),
);
fs.writeFileSync(topicsPath, `${JSON.stringify(topics, null, 2)}\n`, 'utf8');

console.log(`נוצרו ${pageCount} עמודים עם ${exerciseCount} תרגילים מקוריים (${sourceExerciseCount} × 2).`);
