import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';

describe('ratio printed header contract', () => {
  it('prints only the canonical topic title and the local page number on all 48 pages', () => {
    for (const page of WORKSHEET_PAGES) {
      const markup = renderToStaticMarkup(<>{page.component()}</>);
      expect(markup).toContain('<span class="page-header-title page-title">יחס</span>');
      expect(markup).toContain(`<div class="page-number">${page.id}</div>`);
      expect(markup).not.toMatch(/page-header-title page-title">\s*\d+\s*[·.-]/);
      expect(markup).not.toMatch(/page-header-title page-title">[^<]*פרק\s*\d+/);
    }
  });
});
