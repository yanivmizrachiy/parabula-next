import { useParams } from 'react-router-dom';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';
import { WorksheetPage } from '@/components/worksheet/WorksheetPage';

export default function RenderPage() {
  const { pageId } = useParams();
  const pageNumber = Number(pageId);
  const exists = Number.isInteger(pageNumber) && WORKSHEET_PAGES.some((page) => page.id === pageNumber);

  if (!exists) {
    return <main role="alert">עמוד יחס לא נמצא.</main>;
  }

  return (
    <main className="render-page-shell" data-render-ready="true" data-page-number={pageNumber}>
      <WorksheetPage pageNumber={pageNumber} totalPages={WORKSHEET_PAGES.length} />
    </main>
  );
}
