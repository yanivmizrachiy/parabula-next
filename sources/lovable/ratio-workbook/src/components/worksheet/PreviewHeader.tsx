import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewHeaderProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPrevious: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function PreviewHeader({
  currentPage,
  totalPages,
  zoom,
  onPrevious,
  onNext,
  onZoomIn,
  onZoomOut,
  canGoPrevious,
  canGoNext,
}: PreviewHeaderProps) {
  return (
    <div className="p-4 border-b bg-card flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-muted-foreground">תצוגה מקדימה</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>עמוד</span>
          <span className="font-bold text-foreground">{currentPage}</span>
          <span>מתוך</span>
          <span className="font-bold text-foreground">{totalPages}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l pl-2 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            disabled={zoom <= 50}
            className="h-8 w-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            disabled={zoom >= 150}
            className="h-8 w-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation Controls */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={!canGoNext}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
