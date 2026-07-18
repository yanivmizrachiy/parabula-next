import { useCallback, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { PageSelector } from '@/components/worksheet/PageSelector';
import { PreviewHeader } from '@/components/worksheet/PreviewHeader';
import { WorksheetPage } from '@/components/worksheet/WorksheetPage';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';

const ZOOM_LEVELS = [50, 75, 100, 125, 150] as const;

function zoomClass(zoom: number): string {
  return `ratio-zoom-${zoom}`;
}

export default function Index() {
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>(WORKSHEET_PAGES.map((page) => page.id));
  const [currentPreview, setCurrentPreview] = useState(0);
  const [zoom, setZoom] = useState<number>(100);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'יחס_לכיתה_ח',
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        html, body { height: 100%; margin: 0 !important; padding: 0 !important; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .worksheet-page { width: 210mm !important; height: 297mm !important; page-break-after: always; page-break-inside: avoid; }
        .worksheet-page:last-child { page-break-after: auto; }
      }
    `,
  });

  const togglePage = useCallback((pageId: number) => {
    setSelectedPages((previous) => previous.includes(pageId)
      ? previous.filter((id) => id !== pageId)
      : [...previous, pageId].sort((a, b) => a - b));
  }, []);

  const selectAll = useCallback(() => setSelectedPages(WORKSHEET_PAGES.map((page) => page.id)), []);
  const deselectAll = useCallback(() => setSelectedPages([]), []);
  const filteredPages = WORKSHEET_PAGES.filter((page) => selectedPages.includes(page.id));

  const changeZoom = useCallback((direction: -1 | 1) => {
    setZoom((current) => {
      const index = ZOOM_LEVELS.indexOf(current as (typeof ZOOM_LEVELS)[number]);
      const nextIndex = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + direction));
      return ZOOM_LEVELS[nextIndex];
    });
  }, []);

  return (
    <div className="ratio-workbench min-h-screen flex" dir="rtl">
      <aside className="ratio-workbench-sidebar w-80 bg-card border-l border-border flex flex-col no-print" aria-label="בחירת דפי עבודה">
        <header className="p-4 border-b bg-primary text-primary-foreground">
          <h1 className="font-bold text-lg">יחס ופרופורציה — כיתה ח׳</h1>
          <p className="text-sm opacity-90">48 דפי A4 מסודרים לפי רצף פדגוגי</p>
        </header>

        <PageSelector
          pages={WORKSHEET_PAGES}
          selectedPages={selectedPages}
          currentPreview={currentPreview}
          onTogglePage={togglePage}
          onSelectPage={setCurrentPreview}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />

        <div className="p-4 border-t bg-card">
          <Button onClick={() => handlePrint()} className="w-full gap-2" size="lg" disabled={selectedPages.length === 0}>
            <Printer className="w-5 h-5" aria-hidden="true" />
            הדפס {selectedPages.length} דפים
          </Button>
        </div>
      </aside>

      <section className="ratio-workbench-preview flex-1 bg-muted/30 flex flex-col" aria-label="תצוגה מקדימה">
        <div className="no-print">
          <PreviewHeader
            currentPage={currentPreview + 1}
            totalPages={WORKSHEET_PAGES.length}
            zoom={zoom}
            onPrevious={() => setCurrentPreview((current) => Math.max(0, current - 1))}
            onNext={() => setCurrentPreview((current) => Math.min(WORKSHEET_PAGES.length - 1, current + 1))}
            onZoomIn={() => changeZoom(1)}
            onZoomOut={() => changeZoom(-1)}
            canGoPrevious={currentPreview > 0}
            canGoNext={currentPreview < WORKSHEET_PAGES.length - 1}
          />
        </div>

        <div className="ratio-preview-canvas flex-1 p-8 flex justify-center overflow-auto no-print">
          <div className={`ratio-preview-scale ${zoomClass(zoom)}`}>
            <WorksheetPage
              pageNumber={WORKSHEET_PAGES[currentPreview].id}
              totalPages={WORKSHEET_PAGES.length}
              className="shadow-xl"
            />
          </div>
        </div>
      </section>

      <div className="hidden" aria-hidden="true">
        <div ref={printRef}>
          {filteredPages.map((page) => (
            <WorksheetPage key={page.id} pageNumber={page.id} totalPages={WORKSHEET_PAGES.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
