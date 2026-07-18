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
});
