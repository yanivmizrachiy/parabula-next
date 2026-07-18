import { useRef, useState, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';
import { WorksheetPage } from '@/components/worksheet/WorksheetPage';
import { PageSelector } from '@/components/worksheet/PageSelector';
import { PreviewHeader } from '@/components/worksheet/PreviewHeader';

export default function Index() {
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>(WORKSHEET_PAGES.map(p => p.id));
  const [currentPreview, setCurrentPreview] = useState(0);
  const [zoom, setZoom] = useState(100);

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
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId].sort((a, b) => a - b)
    );
  }, []);

  const selectAll = useCallback(() => setSelectedPages(WORKSHEET_PAGES.map(p => p.id)), []);
  const deselectAll = useCallback(() => setSelectedPages([]), []);

  const filteredPages = WORKSHEET_PAGES.filter(p => selectedPages.includes(p.id));

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev + 25, 150)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 25, 50)), []);

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 bg-card border-l border-border flex flex-col no-print">
        <div className="p-4 border-b bg-primary text-primary-foreground">
          <h1 className="font-bold text-lg">יחס - כיתה ח'</h1>
          <p className="text-sm opacity-80">בחרו דפים להדפסה</p>
        </div>

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
            <Printer className="w-5 h-5" />
            הדפס {selectedPages.length} דפים
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-muted/30 flex flex-col">
        <div className="no-print">
          <PreviewHeader
            currentPage={currentPreview + 1}
            totalPages={WORKSHEET_PAGES.length}
            zoom={zoom}
            onPrevious={() => setCurrentPreview(Math.max(0, currentPreview - 1))}
            onNext={() => setCurrentPreview(Math.min(WORKSHEET_PAGES.length - 1, currentPreview + 1))}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            canGoPrevious={currentPreview > 0}
            canGoNext={currentPreview < WORKSHEET_PAGES.length - 1}
          />
        </div>

        <div className="flex-1 p-8 flex justify-center overflow-auto no-print">
          <div className="transition-transform duration-200" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <WorksheetPage
              pageNumber={WORKSHEET_PAGES[currentPreview].id}
              totalPages={WORKSHEET_PAGES.length}
              className="shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Print container */}
      <div className="hidden">
        <div ref={printRef}>
          {filteredPages.map((page) => (
            <WorksheetPage key={page.id} pageNumber={page.id} totalPages={WORKSHEET_PAGES.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
