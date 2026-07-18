import { cn } from '@/lib/utils';
import { WORKSHEET_PAGES } from '@/data/worksheetPages';

interface WorksheetPageProps {
  pageNumber: number;
  totalPages: number;
  className?: string;
  showPageNumber?: boolean;
  showOverlays?: boolean;
  imageSrc?: string; // kept for backwards compat but unused now
}

export function WorksheetPage({
  pageNumber,
  className,
}: WorksheetPageProps) {
  const pageData = WORKSHEET_PAGES.find(p => p.id === pageNumber);
  
  if (!pageData) return null;

  return (
    <div className={cn(className)}>
      {pageData.component()}
    </div>
  );
}
