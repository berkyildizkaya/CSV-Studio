import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Columns, 
  Loader2, 
  Pencil, 
  Trash2, 
  Plus,
  Check,
  X,
  PlusCircle,
  Hash
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ColumnManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
  onRenameColumn: (oldName: string, newName: string) => void;
  onAddColumn: (name: string, index?: number) => void;
  onDeleteColumn: (name: string) => void;
}

export function ColumnManagerDialog({
  open,
  onOpenChange,
  headers,
  onMoveColumn,
  onRenameColumn,
  onAddColumn,
  onDeleteColumn,
}: ColumnManagerDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  
  // Mod durumları
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [movingHeader, setMovingHeader] = useState<string | null>(null);
  const [insertingAtIndex, setInsertingAtIndex] = useState<number | null>(null);
  
  // Değer durumları
  const [newName, setNewName] = useState("");
  const [targetPos, setTargetPos] = useState("");
  const [newColName, setNewColName] = useState("");

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

  const handleJumpToPosition = (fromIndex: number) => {
    const toPos = parseInt(targetPos);
    if (isNaN(toPos) || toPos < 1 || toPos > headers.length) {
      toast.error(t('column_manager.invalid_pos', 'Geçersiz sıra numarası.'));
      return;
    }

    const toIndex = toPos - 1; // 1-based to 0-based
    if (fromIndex === toIndex) {
      setMovingHeader(null);
      return;
    }

    startTransition(() => {
      onMoveColumn(fromIndex, toIndex);
      setMovingHeader(null);
      setTargetPos("");
      toast.success(t('column_manager.move_success', 'Sütun taşındı.'));
    });
  };

  const startEditing = (header: string) => {
    setEditingHeader(header);
    setNewName(header);
    setMovingHeader(null);
    setInsertingAtIndex(null);
  };

  const startMoving = (header: string, index: number) => {
    setMovingHeader(header);
    setTargetPos((index + 1).toString());
    setEditingHeader(null);
    setInsertingAtIndex(null);
  };

  const saveRename = () => {
    if (editingHeader && newName && newName !== editingHeader) {
      startTransition(() => {
        onRenameColumn(editingHeader, newName);
        setEditingHeader(null);
        toast.success(t('column_manager.rename_success'));
      });
    } else {
      setEditingHeader(null);
    }
  };

  const handleAddAtPosition = (index?: number) => {
    if (!newColName) return;
    startTransition(() => {
      onAddColumn(newColName, index);
      setNewColName("");
      setInsertingAtIndex(null);
      toast.success(t('column_manager.add_success'));
    });
  };

  const handleDeleteColumn = (name: string) => {
    if (confirm(t('column_manager.delete_confirm', { name }))) {
      startTransition(() => {
        onDeleteColumn(name);
        toast.success(t('column_manager.delete_success'));
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return;
    onOpenChange(isOpen);
    if (!isOpen) {
      setEditingHeader(null);
      setMovingHeader(null);
      setInsertingAtIndex(null);
      setNewColName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]" 
        showCloseButton={!isPending}
        onPointerDownOutside={(e) => isPending && e.preventDefault()}
        onEscapeKeyDown={(e) => isPending && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Columns className="w-5 h-5" />
                {t('column_manager.title')}
            </div>
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </DialogTitle>
          <DialogDescription>
            {t('column_manager.desc')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[450px] pr-4 mt-2 relative border rounded-md p-2 bg-muted/5">
          {isPending && (
             <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
             </div>
          )}
          
          <div className="space-y-1">
            {/* En Üste Ekleme Butonu */}
            <div className="flex justify-center py-1">
                {insertingAtIndex === 0 ? (
                    <div className="flex items-center gap-2 w-full px-2 py-1 bg-primary/5 rounded-md border border-primary/20 animate-in fade-in slide-in-from-top-2">
                        <Input 
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            placeholder={t('column_manager.column_name_placeholder')}
                            className="h-8 text-xs"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAtPosition(0)}
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleAddAtPosition(0)}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setInsertingAtIndex(null)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-full border-dashed border hover:border-primary hover:text-primary transition-all text-muted-foreground text-[10px] uppercase tracking-wider"
                        onClick={() => { setInsertingAtIndex(0); setEditingHeader(null); setMovingHeader(null); setNewColName(""); }}
                        disabled={isPending}
                    >
                        <PlusCircle className="w-3.5 h-3.5 mr-2" />
                        {t('column_manager.add_to_start')}
                    </Button>
                )}
            </div>

            {headers.map((header, index) => (
              <div key={header} className="space-y-1">
                <div
                    className={`flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group ${isPending ? 'opacity-50' : ''} ${movingHeader === header ? 'border-primary ring-1 ring-primary/20' : ''}`}
                >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                        
                        {/* Sıra Numarası / Taşıma Inputu */}
                        <div className="shrink-0 min-w-[2.8rem]">
                            {movingHeader === header ? (
                                <Input 
                                    type="number"
                                    value={targetPos}
                                    onChange={(e) => setTargetPos(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJumpToPosition(index)}
                                    className="h-7 w-12 px-1 text-center font-bold text-primary border-primary ring-1 ring-primary/20"
                                    autoFocus
                                    min={1}
                                    max={headers.length}
                                />
                            ) : (
                                <button 
                                    className="group/pos flex items-center justify-center gap-1 text-[10px] font-bold bg-muted/50 border border-transparent hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all px-2 py-1 rounded-md w-full cursor-pointer"
                                    onClick={() => startMoving(header, index)}
                                    title={t('column_manager.move_to')}
                                    disabled={isPending}
                                >
                                    <span className="group-hover/pos:hidden">#{index + 1}</span>
                                    <Hash className="w-3 h-3 hidden group-hover/pos:block animate-in zoom-in-50 duration-200" />
                                </button>
                            )}
                        </div>
                    
                        {editingHeader === header ? (
                            <div className="flex items-center gap-1 flex-1">
                                <Input 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                                    autoFocus
                                    className="h-7 py-0 px-2 text-sm"
                                />
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={saveRename}>
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setEditingHeader(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : movingHeader === header ? (
                            <div className="flex items-center gap-1 flex-1">
                                <span className="text-xs font-semibold text-primary truncate">{header}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleJumpToPosition(index)}>
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setMovingHeader(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <span className="text-sm font-medium truncate py-1" title={header}>
                                {header}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                    {!editingHeader && !movingHeader && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => startEditing(header)}
                                disabled={isPending}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteColumn(header)}
                                disabled={isPending}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <div className="w-px h-4 bg-border mx-1" />
                        </>
                    )}
                    
                    {!movingHeader && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === 0 || isPending || editingHeader !== null}
                                onClick={() => handleMoveUp(index)}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === headers.length - 1 || isPending || editingHeader !== null}
                                onClick={() => handleMoveDown(index)}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    </div>
                </div>

                {/* Sütunlar Arasına Ekleme Butonu */}
                <div className="flex justify-center py-1">
                    {insertingAtIndex === index + 1 ? (
                        <div className="flex items-center gap-2 w-full px-2 py-1 bg-primary/5 rounded-md border border-primary/20 animate-in fade-in slide-in-from-top-2">
                            <Input 
                                value={newColName}
                                onChange={(e) => setNewColName(e.target.value)}
                                placeholder={t('column_manager.column_name_placeholder')}
                                className="h-8 text-xs"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAtPosition(index + 1)}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleAddAtPosition(index + 1)}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setInsertingAtIndex(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="group/add w-full flex justify-center items-center h-4 relative">
                            <div className="absolute w-full h-[1px] bg-border group-hover/add:bg-primary/30 transition-colors" />
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-5 w-5 rounded-full z-10 opacity-0 group-hover/add:opacity-100 transition-all scale-75 group-hover/add:scale-100 bg-background"
                                onClick={() => { setInsertingAtIndex(index + 1); setEditingHeader(null); setMovingHeader(null); setNewColName(""); }}
                                disabled={isPending}
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full" disabled={isPending}>
            {t('common.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}