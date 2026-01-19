import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectCellProps {
  isSelected: boolean;
  onToggle: () => void;
}

export const SelectCell = memo(({ isSelected, onToggle }: SelectCellProps) => {
  return (
    <div
      className="flex items-center justify-center h-full w-full cursor-pointer hover:bg-muted/80 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle()}
        aria-label="Satırı seç"
        className="translate-y-[2px] pointer-events-none"
      />
    </div>
  );
}, (prev, next) => {
    // Sadece seçim durumu değişirse render et
    return prev.isSelected === next.isSelected;
});
