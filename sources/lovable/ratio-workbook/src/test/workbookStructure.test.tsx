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

  it('uses meaningful navigation titles and chapter names', () => {
    for (const page of WORKSHEET_PAGES) {
      expect(page.title).not.toMatch(/^עמוד \d+$/);
      expect(page.title.length).toBeGreaterThan(8);
      expect(page.chapter).toMatch(/^\d · /);
    }
  });

  it('renders every page and excludes all known broken formulations', () => {
    for (const page of WORKSHEET_PAGES) {
      const markup = renderToStaticMarkup(<>{page.component()}</>);
      expect(markup).toContain('worksheet-page');
      expect(markup).toContain(`>${page.id}<`);
      for (const fragment of forbiddenBrokenFragments) {
        expect(markup).not.toContain(fragment);
      }
    }
  });

  it('renders 36 diamonds in the first ratio question', () => {
    const markup = renderPage(1);
    expect(markup).toContain('היחס בין מספר המעויינים השחורים לבין מספר המעויינים הלבנים הוא 2 : 1');
    expect(markup.match(/<polygon/g)).toHaveLength(36);
  });

  it('uses the lower area of page 1 for meaningful ratio practice', () => {
    const markup = renderPage(1);
    expect(markup).toContain('בדיקת הבנה – הרחבת היחס 3 : 2');
    expect(markup).toContain('מספר העיגולים הכולל');
    expect(markup).toContain('גורם ההרחבה מן השורה הראשונה אל השורה הרביעית');
    expect(markup).toContain('לקבוצה המקורית הוסיפו 2 עיגולים מכל צבע');
  });

  it('provides structured ratio answer boxes and explanation space on page 1', () => {
    const markup = renderPage(1);
    expect(markup.match(/ratio-answer-box/g)?.length).toBeGreaterThanOrEqual(6);
    expect(markup).toContain('ratio-answer-colon');
    expect(markup).toContain('work-area-line');
    expect(markup).toContain('אפשרות נוספת:');
    expect(markup).toContain('הסבר:');
  });
});
