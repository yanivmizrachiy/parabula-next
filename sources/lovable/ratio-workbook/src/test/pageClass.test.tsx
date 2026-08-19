import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';
import { PageNumberScope } from '@/components/worksheet/pages/PageLayout';

function renderStudentPage(page: (typeof WORKSHEET_PAGES)[number]) {
  return renderToStaticMarkup(
    <PageNumberScope pageNumber={page.id}>{page.component()}</PageNumberScope>,
  );
}

describe('ratio page identity classes', () => {
  it('assigns sequential student-facing ratio-page-N classes to every rendered page', () => {
    expect(WORKSHEET_PAGES).toHaveLength(55);

    for (const page of WORKSHEET_PAGES) {
      const markup = renderStudentPage(page);
      expect(markup).toContain(`ratio-page-${page.id}`);
      expect(markup).toContain(`<div class="page-number">${page.id}</div>`);
    }
  });

  it('keeps original source-page identities stable for page-specific layout targeting', () => {
    for (const [key, sourcePage] of [
      ['ratio-page-01', 1],
      ['ratio-page-16', 16],
      ['ratio-page-18', 18],
      ['ratio-page-21', 21],
      ['ratio-page-48', 48],
    ] as const) {
      const page = WORKSHEET_PAGES.find((candidate) => candidate.key === key);
      expect(page).toBeDefined();
      const markup = renderStudentPage(page!);
      expect(markup).toContain(`ratio-source-page-${sourcePage}`);
    }
  });
});
