import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';

describe('ratio page identity classes', () => {
  it('assigns ratio-page-N to every one of the 48 rendered pages', () => {
    expect(WORKSHEET_PAGES).toHaveLength(48);

    for (const page of WORKSHEET_PAGES) {
      const markup = renderToStaticMarkup(<>{page.component()}</>);
      expect(markup).toContain(`ratio-page-${page.id}`);
    }
  });

  it('keeps the five canonical fit targets addressable by page-specific CSS', () => {
    for (const pageId of [1, 16, 18, 21, 48]) {
      const page = WORKSHEET_PAGES.find((candidate) => candidate.id === pageId);
      expect(page).toBeDefined();
      const markup = renderToStaticMarkup(<>{page?.component()}</>);
      expect(markup).toContain(`ratio-page-${pageId}`);
    }
  });
});
