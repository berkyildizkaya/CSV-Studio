import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: any;
  columnId: string;
  isDirty?: boolean;
  isNewColumn?: boolean;
  onEditClick: (value: any, columnId: string) => void;
  onContextMenu: (e: React.MouseEvent, value: any, columnId: string) => void;
}

// Değerin tipini tahmin eden yardımcı fonksiyon (Hafif versiyon)
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
  value,
  columnId,
  isDirty,
  isNewColumn,
  onEditClick,
  onContextMenu
}: EditableCellProps) {
  const cellType = detectType(value);

  const renderCellContent = () => {
    if (cellType === 'boolean') {
      const boolVal = String(value).toLowerCase() === 'true';
      return (
        <Badge variant={boolVal ? "default" : "secondary"} className={cn("text-[10px] px-1 h-4 pointer-events-none", boolVal ? "bg-green-600" : "")}>
          {boolVal ? "TRUE" : "FALSE"}
        </Badge>
      );
    }
    
    if (cellType === 'number') {
        return <span className="font-mono text-blue-600 dark:text-blue-400 font-medium pointer-events-none truncate">{value}</span>;
    }

    return <span className="truncate block w-full text-sm pointer-events-none">{value}</span>;
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between w-full h-full min-h-[2rem] px-2 py-1 rounded-sm cursor-pointer transition-colors border border-transparent hover:border-primary/30 hover:bg-primary/5",
        isDirty && "bg-emerald-50/50 dark:bg-emerald-900/10",
        isNewColumn && "bg-blue-50/50 dark:bg-blue-900/10"
      )}
      onDoubleClick={() => onEditClick(value, columnId)}
      onContextMenu={(e) => onContextMenu(e, value, columnId)}
    >
      <div className="flex-1 overflow-hidden flex items-center">
        {renderCellContent()}
      </div>
      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-40 ml-1 shrink-0" />
    </div>
  );
}

export const EditableCell = memo(EditableCellComponent, (prev, next) => {
    return (
        prev.value === next.value &&
        prev.isDirty === next.isDirty &&
        prev.isNewColumn === next.isNewColumn
    );
});
