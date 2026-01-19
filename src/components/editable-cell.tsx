import { useState, useEffect, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  getValue: () => any;
  rowIndex: number;
  columnId: string;
  updateData: (rowIndex: number, columnId: string, value: any) => void;
}

// Değerin tipini tahmin eden yardımcı fonksiyon
function detectType(value: any): 'boolean' | 'number' | 'text' {
  if (value === null || value === undefined) return 'text';
  
  const strVal = String(value).trim();
  const lowerVal = strVal.toLowerCase();

  if (lowerVal === 'true' || lowerVal === 'false') return 'boolean';

  if (!isNaN(Number(strVal)) && strVal !== '') {
    if (strVal.startsWith('0') && strVal.length > 1 && !strVal.startsWith('0.')) {
      return 'text'; 
    }
    return 'number';
  }

  return 'text';
}

function EditableCellComponent({
  getValue,
  rowIndex,
  columnId,
  updateData,
}: EditableCellProps) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  
  const cellType = useMemo(() => detectType(initialValue), [initialValue]);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  const handleSave = () => {
    let valueToSave = value;
    if (cellType === 'boolean' && typeof value === 'boolean') {
        valueToSave = String(value);
    }
    updateData(rowIndex, columnId, valueToSave);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const renderCellContent = () => {
    if (cellType === 'boolean') {
      const boolVal = String(initialValue).toLowerCase() === 'true';
      return (
        <Badge variant={boolVal ? "default" : "secondary"} className={cn("text-xs pointer-events-none", boolVal ? "bg-green-600" : "")}>
          {boolVal ? "TRUE" : "FALSE"}
        </Badge>
      );
    }
    
    if (cellType === 'number') {
        return <span className="font-mono text-blue-600 dark:text-blue-400 font-medium pointer-events-none">{initialValue}</span>;
    }

    return <span className="truncate block w-full text-sm pointer-events-none">{initialValue}</span>;
  };

  const renderEditInput = () => {
    if (cellType === 'boolean') {
      const isChecked = String(value).toLowerCase() === 'true';
      return (
        <div className="flex items-center space-x-2 py-4">
          <Switch
            id="bool-switch"
            checked={isChecked}
            onCheckedChange={(checked) => setValue(String(checked))}
          />
          <Label htmlFor="bool-switch" className="font-normal text-base">
            {isChecked ? "True (Aktif)" : "False (Pasif)"}
          </Label>
        </div>
      );
    }

    if (cellType === 'number') {
      return (
        <>
            <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="font-mono"
            />
             <p className="text-[0.8rem] text-muted-foreground mt-2">
                Sayısal değer düzenliyorsunuz.
             </p>
        </>
      );
    }

    return (
      <Textarea
        id="cell-value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[150px] font-mono text-sm"
        placeholder="Buraya veri girin..."
      />
    );
  };

  return (
    <>
      <div
        className="group flex items-center justify-between w-full h-full min-h-[2rem] px-2 py-1 rounded-md border border-transparent hover:border-border hover:bg-muted/50 cursor-pointer transition-all"
        onDoubleClick={() => setOpen(true)}
        title="Düzenlemek için çift tıklayın"
      >
        {renderCellContent()}
        <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity ml-2 shrink-0" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hücreyi Düzenle</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-primary">{columnId}</span> sütunundaki değeri düzenliyorsunuz.
              <br/>
              <span className="text-xs text-muted-foreground">Algılanan Veri Tipi: <Badge variant="outline" className="text-[10px] h-5">{cellType.toUpperCase()}</Badge></span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {!['boolean'].includes(cellType) && (
                  <Label htmlFor="cell-value" className="text-sm font-medium">Değer</Label>
              )}
              {renderEditInput()}
              
              {!['boolean'].includes(cellType) && (
                <p className="text-[0.8rem] text-muted-foreground">
                    Kaydetmek için <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Ctrl</kbd> + <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Enter</kbd> tuşlarını kullanabilirsiniz.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Named export olarak dışarı aktar, aynı isimle
export const EditableCell = memo(EditableCellComponent, (prev, next) => {
    return prev.getValue() === next.getValue() && prev.rowIndex === next.rowIndex && prev.columnId === next.columnId;
});