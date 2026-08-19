import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';
import { PageNumberScope } from '@/components/worksheet/pages/PageLayout';

const forbiddenBrokenFragments = [
  'היחס בין מספר בקבוקי השתייה המוגזת והמספר הכולל של בקבוקי השתייה הוא 11 : 6',
  'אם יש 15 כדורים כחולים',
  'BG ליחס של CV',
  '12 שחורים, 17 לבנים',
  'כמה בנים צריך לצרף לכיתה כדי שהיחס בין מספר הבנים למספר הבנות יהיה 1 : 1',
];

const forbiddenVisibleLabels = [
  'בדיקת הבנה',
  'חשיבה והסבר',
  'שאלות אתגר',
  'תרגול מסכם',
];

function pageByKey(key: string) {
  const page = WORKSHEET_PAGES.find((candidate) => candidate.key === key);
  expect(page).toBeDefined();
  return page!;
}

function renderPage(page: (typeof WORKSHEET_PAGES)[number]) {
  return renderToStaticMarkup(
    <PageNumberScope pageNumber={page.id}>{page.component()}</PageNumberScope>,
  );
}

function renderKey(key: string) {
  return renderPage(pageByKey(key));
}

function count(markup: string, expression: RegExp) {
  return markup.match(expression)?.length ?? 0;
}

describe('ratio workbook structure', () => {
  it('contains exactly 55 student pages with stable keys and sequential display numbers', () => {
    expect(WORKSHEET_PAGES).toHaveLength(55);
    expect(WORKSHEET_PAGES.map((page) => page.id)).toEqual(
      Array.from({ length: WORKSHEET_PAGES.length }, (_, index) => index + 1),
    );
    expect(new Set(WORKSHEET_PAGES.map((page) => page.id)).size).toBe(WORKSHEET_PAGES.length);
    expect(new Set(WORKSHEET_PAGES.map((page) => page.key)).size).toBe(WORKSHEET_PAGES.length);
  });

  it('starts the public/student workbook at page 1 and excludes all teacher intro pages', () => {
    expect(WORKSHEET_PAGES[0].id).toBe(1);
    expect(WORKSHEET_PAGES[0].key).toBe('ratio-page-01');
    expect(WORKSHEET_PAGES[0].title).toBe('זיהוי יחס ושמירתו');

    for (const page of WORKSHEET_PAGES) {
      expect(page.credit).toBe('yaniv');
      expect(page.key).not.toContain('teacher');
      const markup = renderPage(page);
      expect(markup).not.toContain('teacher-intro-page');
      expect(markup).not.toContain('יחס · למורה');
      expect(markup).toContain(`<div class="page-number">${page.id}</div>`);
    }
  });

  it('uses meaningful navigation titles and chapter names without visible level labels', () => {
    for (const page of WORKSHEET_PAGES) {
      expect(page.title).not.toMatch(/^עמוד \d+$/);
      expect(page.title.length).toBeGreaterThan(8);
      expect(page.chapter).toMatch(/^\d · /);
      for (const label of forbiddenVisibleLabels) {
        expect(page.title).not.toContain(label);
        expect(page.chapter).not.toContain(label);
      }
    }
  });

  it('renders every page with one clean mathematical topic heading and no question headings', () => {
    for (const page of WORKSHEET_PAGES) {
      const markup = renderPage(page);
      expect(markup).toContain('worksheet-page');
      expect(markup).toMatch(/<span class="page-header-title page-title">[^<]+<\/span>/);
      expect(markup).not.toMatch(/<span class="page-header-title page-title">\s*נושא:/);
      expect(markup).not.toMatch(/<span class="page-header-title page-title">[^<]*פרק\s*\d+/);
      expect(markup).not.toMatch(/<span class="page-header-title page-title">[^<]*מבחנ/);
      expect(markup).not.toMatch(/<span class="page-header-title page-title">[^<]*\|/);
      expect(markup).not.toMatch(/<h[1-6](?:\s|>)/i);
      expect(markup).not.toContain('question-title');
      expect(markup).not.toContain('question-eyebrow');
      expect(markup).not.toContain('difficulty-badge');
      for (const fragment of forbiddenBrokenFragments) {
        expect(markup).not.toContain(fragment);
      }
      for (const label of forbiddenVisibleLabels) {
        expect(markup).not.toContain(label);
      }
    }
  });

  it('assigns a response policy to every question and sub-question', () => {
    for (const page of WORKSHEET_PAGES) {
      const markup = renderPage(page);
      const questionCount = count(markup, /class="question-block"/g);
      const subQuestionCount = count(markup, /class="sub-question"/g);
      const policyCount = count(
        markup,
        /data-auto-response="(?:none|short|ratio|calculation|explanation|drawing)"/g,
      );
      expect(policyCount).toBe(questionCount + subQuestionCount);
    }
  });

  it('renders 36 diamonds in the first ratio question', () => {
    const markup = renderKey('ratio-page-01');
    expect(markup).toContain('היחס בין מספר המעויינים השחורים לבין מספר המעויינים הלבנים הוא 2 : 1');
    expect(count(markup, /<polygon/g)).toBe(36);
  });

  it('uses the lower area of the first ratio page for meaningful ratio practice', () => {
    const markup = renderKey('ratio-page-01');
    expect(markup).toContain('הרחבת היחס 3 : 2');
    expect(markup).toContain('מספר העיגולים הכולל');
    expect(markup).toContain('גורם ההרחבה מן השורה הראשונה אל השורה הרביעית');
    expect(markup).toContain('לקבוצה המקורית הוסיפו 2 עיגולים מכל צבע');
  });

  it('provides structured ratio answers and real explanation space on the first ratio page', () => {
    const markup = renderKey('ratio-page-01');
    expect(count(markup, /ratio-answer-box/g)).toBeGreaterThanOrEqual(6);
    expect(markup).toContain('ratio-answer-colon');
    expect(count(markup, /ratio-page-1-inline-explanation/g)).toBe(2);
    expect(count(markup, /class="work-area-space"/g)).toBeGreaterThanOrEqual(3);
    expect(markup).toContain('אפשרות נוספת:');
  });

  it('gives original ratio page 11 substantial work and final-answer space', () => {
    const markup = renderKey('ratio-page-11');
    expect(markup).toContain('ratio-source-page-11');
    expect(count(markup, /class="work-area-space"/g)).toBeGreaterThanOrEqual(7);
    expect(count(markup, /final-answer/g)).toBeGreaterThanOrEqual(8);
    expect(count(markup, /ratio-answer-box/g)).toBeGreaterThanOrEqual(4);
    expect(markup).toContain('SpiceGraph'.replace('SpiceGraph', 'קינמון'));
  });

  it('keeps short answers inline on the original ratio page 18 while preserving calculation work', () => {
    const markup = renderKey('ratio-page-18');
    expect(markup).toContain('ratio-source-page-18');
    expect(count(markup, /ratio-answer-container is-inline/g)).toBeGreaterThanOrEqual(6);
    expect(count(markup, /auto-response--calculation/g)).toBe(1);
    expect(markup).toContain('באיזו מחרוזת נשמר אותו יחס?');
  });

  it('keeps ratio responses inline on the original ratio page 22', () => {
    const markup = renderKey('ratio-page-22');
    expect(markup).toContain('ratio-source-page-22');
    expect(count(markup, /ratio-answer-container is-inline/g)).toBe(5);
    expect(count(markup, /ratio-answer-box/g)).toBe(10);
  });

  it('provides work areas, structured answers and correct SVG direction on the original ratio page 29', () => {
    const markup = renderKey('ratio-page-29');
    expect(markup).not.toContain('שאלות אתגר');
    expect(count(markup, /class="work-area-space"/g)).toBeGreaterThanOrEqual(7);
    expect(count(markup, /class="ratio-answer-box"/g)).toBeGreaterThanOrEqual(12);
    for (const value of ['10a', '4a', '6p', '2p', '3p']) {
      expect(markup).toMatch(new RegExp(`<text[^>]*direction="ltr"[^>]*>${value}</text>`));
    }
  });

  it('provides genuine working and final-answer space on the original ratio page 35', () => {
    const markup = renderKey('ratio-page-35');
    expect(markup).toContain('ratio-source-page-35');
    expect(markup).toContain('calculation-response');
    expect(count(markup, /class="work-area-space"/g)).toBeGreaterThanOrEqual(8);
    expect(count(markup, /ratio-answer-box/g)).toBeGreaterThanOrEqual(6);
    expect(markup).toContain('שלוש דרכי פתרון והסבר:');
    expect(markup).toContain('אומדן למספר הדגים');
  });

  it('uses an ordered-pair response, calculation space and LTR coordinates on original ratio page 42', () => {
    const markup = renderKey('ratio-page-42');
    expect(markup).not.toContain('נושא: יחס — שאלות מבחנים');
    expect(count(markup, /ordered-pair-box/g)).toBe(2);
    expect(markup).toContain('ordered-pair-comma');
    expect(markup).toContain('calculation-response');
    expect(count(markup, /class="work-area-space"/g)).toBeGreaterThanOrEqual(1);
    for (const value of ['C(4,0)', 'D(0,6)', 'A(10,0)', 'B(0,15)']) {
      expect(markup).toMatch(new RegExp(`<text[^>]*direction="ltr"[^>]*>${value.replace(/[()]/g, '\\$&')}</text>`));
    }
  });

  it('provides precise SVG direction and structured calculation responses on original ratio page 48', () => {
    const markup = renderKey('ratio-page-48');
    expect(markup).not.toContain('נושא: יחס — שאלות מבחנים');
    expect(count(markup, /calculation-response/g)).toBe(2);
    expect(markup).toContain('הסבר:');
    expect(markup).toContain('ratio-answer-colon');
    expect(count(markup, /ratio-answer-box/g)).toBeGreaterThanOrEqual(2);
    for (const value of ['12', '6', '8', '10', 'AB=18', 'BC=15', 'DF=5']) {
      expect(markup).toMatch(new RegExp(`<text[^>]*direction="ltr"[^>]*>${value}</text>`));
    }
  });
});
