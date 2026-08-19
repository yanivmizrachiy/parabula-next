import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';
import { PageNumberScope } from '@/components/worksheet/pages/PageLayout';

describe('ratio source header contract', () => {
  it('keeps a clean pedagogical title and sequential student page number on all 55 pages', () => {
    for (const page of WORKSHEET_PAGES) {
      const markup = renderToStaticMarkup(
        <PageNumberScope pageNumber={page.id}>{page.component()}</PageNumberScope>,
      );
      const title = markup.match(/<span class="page-header-title page-title">([^<]+)<\/span>/)?.[1] ?? '';

      expect(title.trim().length).toBeGreaterThan(0);
      expect(markup).toContain(`<div class="page-number">${page.id}</div>`);
      expect(title).not.toMatch(/^\s*\d+\s*[·.-]/);
      expect(title).not.toMatch(/פרק\s*\d+/);
      expect(title).not.toMatch(/^(?:תרגול|העשרה|אתגר|ביסוס|שלב\b|למידה מודרכת)/);
    }
  });
});
