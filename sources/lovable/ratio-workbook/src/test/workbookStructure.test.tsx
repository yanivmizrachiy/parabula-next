import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';

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

function renderPage(pageId: number) {
  const page = WORKSHEET_PAGES.find((candidate) => candidate.id === pageId);
  expect(page).toBeDefined();
  return renderToStaticMarkup(<>{page?.component()}</>);
}

describe('ratio workbook structure', () => {
  it('contains exactly 48 unique, sequential pages', () => {
    expect(WORKSHEET_PAGES).toHaveLength(48);
    expect(WORKSHEET_PAGES.map((page) => page.id)).toEqual(Array.from({ length: 48 }, (_, index) => index + 1));
    expect(new Set(WORKSHEET_PAGES.map((page) => page.id)).size).toBe(48);
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
      const markup = renderToStaticMarkup(<>{page.component()}</>);
      expect(markup).toContain('worksheet-page');
      expect(markup).toContain(`>${page.id}<`);
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

  it('assigns an explicit response policy to every question and sub-question', () => {
    for (const page of WORKSHEET_PAGES) {
      const markup = renderToStaticMarkup(<>{page.component()}</>);
      const questionCount = markup.match(/class="question-block"/g)?.length ?? 0;
      const subQuestionCount = markup.match(/class="sub-question"/g)?.length ?? 0;
      const policyCount = markup.match(/data-auto-response="(?:none|short|ratio|calculation|explanation|drawing)"/g)?.length ?? 0;
      expect(policyCount).toBe(questionCount + subQuestionCount);
    }
  });

  it('renders 36 diamonds in the first ratio question', () => {
    const markup = renderPage(1);
    expect(markup).toContain('היחס בין מספר המעויינים השחורים לבין מספר המעויינים הלבנים הוא 2 : 1');
    expect(markup.match(/<polygon/g)).toHaveLength(36);
  });

  it('uses the lower area of page 1 for meaningful ratio practice', () => {
    const markup = renderPage(1);
    expect(markup).toContain('הרחבת היחס 3 : 2');
    expect(markup).toContain('מספר העיגולים הכולל');
    expect(markup).toContain('גורם ההרחבה מן השורה הראשונה אל השורה הרביעית');
    expect(markup).toContain('לקבוצה המקורית הוסיפו 2 עיגולים מכל צבע');
  });

  it('provides structured ratio answers and two compact explanation lines on page 1', () => {
    const markup = renderPage(1);
    expect(markup.match(/ratio-answer-box/g)?.length).toBeGreaterThanOrEqual(6);
    expect(markup).toContain('ratio-answer-colon');
    expect(markup.match(/ratio-page-1-inline-explanation/g)).toHaveLength(2);
    expect(markup.match(/class="work-area-line"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(markup).toContain('אפשרות נוספת:');
  });

  it('balances dense page 11 with grouped work and compact final answers', () => {
    const markup = renderPage(11);
    expect(markup).toContain('ratio-page-11');
    expect(markup.match(/response-set ratio-page-11-response/g)).toHaveLength(5);
    expect(markup.match(/class="work-area-line"/g)).toHaveLength(6);
    expect(markup.match(/data-grouped-response="true"/g)).toHaveLength(5);
    expect(markup.match(/ratio-answer-box/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps short answers inline on dense page 18 while preserving calculation work', () => {
    const markup = renderPage(18);
    expect(markup).toContain('ratio-page-18');
    expect(markup.match(/ratio-answer-container is-inline/g)?.length).toBeGreaterThanOrEqual(6);
    expect(markup.match(/auto-response--calculation/g)).toHaveLength(1);
    expect(markup).toContain('באיזו מחרוזת נשמר אותו יחס?');
  });

  it('keeps ratio responses inline on dense page 22', () => {
    const markup = renderPage(22);
    expect(markup).toContain('ratio-page-22');
    expect(markup.match(/ratio-answer-container is-inline/g)).toHaveLength(5);
    expect(markup.match(/ratio-answer-box/g)).toHaveLength(10);
  });

  it('provides work areas, structured answers and correct SVG direction on page 29', () => {
    const markup = renderPage(29);
    expect(markup).not.toContain('שאלות אתגר');
    expect(markup.match(/class="response-set"/g)).toHaveLength(4);
    expect(markup.match(/class="work-area-line"/g)).toHaveLength(4);
    expect(markup.match(/class="ratio-answer-box"/g)?.length).toBeGreaterThanOrEqual(12);
    for (const value of ['10a', '4a', '6p', '2p', '3p']) {
      expect(markup).toMatch(new RegExp(`<text[^>]*direction="ltr"[^>]*>${value}</text>`));
    }
  });

  it('provides genuine working and final-answer space on dense page 35', () => {
    const markup = renderPage(35);
    expect(markup).toContain('ratio-page-35');
    expect(markup.match(/response-set/g)?.length).toBeGreaterThanOrEqual(4);
    expect(markup).toContain('calculation-response');
    expect(markup.match(/work-area-line/g)?.length).toBeGreaterThanOrEqual(13);
    expect(markup.match(/ratio-answer-box/g)?.length).toBeGreaterThanOrEqual(6);
    expect(markup).toContain('שלוש דרכי פתרון והסבר:');
    expect(markup).toContain('אומדן למספר הדגים');
  });

  it('uses an ordered-pair response and LTR coordinates on page 42', () => {
    const markup = renderPage(42);
    expect(markup).not.toContain('נושא: יחס — שאלות מבחנים');
    expect(markup.match(/ordered-pair-box/g)).toHaveLength(2);
    expect(markup).toContain('ordered-pair-comma');
    expect(markup).toContain('calculation-response');
    expect(markup.match(/work-area-line/g)?.length).toBeGreaterThanOrEqual(2);
    for (const value of ['C(4,0)', 'D(0,6)', 'A(10,0)', 'B(0,15)']) {
      expect(markup).toMatch(new RegExp(`<text[^>]*direction="ltr"[^>]*>${value.replace(/[()]/g, '\\$&')}</text>`));
    }
  });

  it('provides precise SVG direction and structured calculation responses on page 48', () => {
    const markup = renderPage(48);
    expect(markup).not.toContain('נושא: יחס — שאלות מבחנים');
    expect(markup.match(/calculation-response/g)).toHaveLength(2);
    expect(markup).toContain('הסבר:');
    expect(markup).toContain('ratio-answer-colon');
    expect(markup.match(/ratio-answer-box/g)?.length).toBeGreaterThanOrEqual(2);
    for (const value of ['12', '6', '8', '10', 'AB=18', 'BC=15', 'DF=5']) {
      expect(markup).toMatch(new RegExp(`<text[^>]*direction="ltr"[^>]*>${value}</text>`));
    }
  });
});
