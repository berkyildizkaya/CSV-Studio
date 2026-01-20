import { useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, GripVertical, Columns, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ColumnManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
}

export function ColumnManagerDialog({
  open,
  onOpenChange,
  headers,
  onMoveColumn,
}: ColumnManagerDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      startTransition(() => {
        onMoveColumn(index, index - 1);
      });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < headers.length - 1) {
      startTransition(() => {
        onMoveColumn(index, index + 1);
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    // İşlem devam ederken kapatma isteğini reddet
    if (isPending) return;
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[400px]" 
        showCloseButton={!isPending}
        onPointerDownOutside={(e) => isPending && e.preventDefault()}
        onEscapeKeyDown={(e) => isPending && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Columns className="w-5 h-5" />
                {t('column_manager.title', 'Sütun Yönetimi')}
            </div>
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </DialogTitle>
          <DialogDescription>
            {t('column_manager.desc', 'Sütunların sırasını değiştirmek için okları kullanın.')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4 mt-4 relative">
          {isPending && (
             <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-card border p-3 rounded-full shadow-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
             </div>
          )}
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div
                key={header}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group ${isPending ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate" title={header}>
                    {header}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0 || isPending}
                    onClick={() => handleMoveUp(index)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === headers.length - 1 || isPending}
                    onClick={() => handleMoveDown(index)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full" disabled={isPending}>
            {t('common.done', 'Tamam')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
