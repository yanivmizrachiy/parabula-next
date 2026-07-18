import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Page {
  id: number;
  title: string;
  chapter?: string;
}

interface PageSelectorProps {
  pages: Page[];
  selectedPages: number[];
  currentPreview: number;
  onTogglePage: (pageId: number) => void;
  onSelectPage: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function PageSelector({
  pages,
  selectedPages,
  currentPreview,
  onTogglePage,
  onSelectPage,
  onSelectAll,
  onDeselectAll,
}: PageSelectorProps) {
  // Group pages by chapter
  const groupedPages = pages.reduce((acc, page) => {
    const chapter = page.chapter || 'אחר';
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(page);
    return acc;
  }, {} as Record<string, Page[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Selection Controls */}
      <div className="p-3 border-b bg-muted/50 flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          בחר הכל
        </Button>
        <Button variant="outline" size="sm" onClick={onDeselectAll}>
          נקה הכל
        </Button>
        <span className="mr-auto text-sm text-muted-foreground flex items-center gap-1">
          <span className="font-semibold">{selectedPages.length}</span>
          <span>/</span>
          <span>{pages.length}</span>
        </span>
      </div>

      {/* Page List */}
      <div className="flex-1 overflow-auto p-2 space-y-4">
        {Object.entries(groupedPages).map(([chapter, chapterPages]) => (
          <div key={chapter}>
            <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1 sticky top-0 bg-card">
              {chapter}
            </h3>
            <div className="space-y-1">
              {chapterPages.map((page) => (
                <label
                  key={page.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                    selectedPages.includes(page.id) 
                      ? "bg-accent border border-accent-foreground/20" 
                      : "hover:bg-muted border border-transparent",
                    currentPreview === page.id - 1 && "ring-2 ring-primary ring-offset-1"
                  )}
                  onClick={() => onSelectPage(page.id - 1)}
                >
                  <Checkbox
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={() => onTogglePage(page.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Page number circle */}
                    <div className="w-7 h-7 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">{page.id}</span>
                    </div>
                    <p className="text-sm truncate">{page.title}</p>
                  </div>
                  {selectedPages.includes(page.id) && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
