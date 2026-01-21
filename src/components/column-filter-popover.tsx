import * as React from "react";
import { useTranslation } from "react-i18next";
import { Filter, X, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getColumnUniqueValues } from "@/lib/column-type-detector";

interface ColumnFilterPopoverProps {
  columnId: string;
  data: any[];
  currentFilter: string[] | undefined;
  onFilterChange: (value: string[] | undefined) => void;
}

export function ColumnFilterPopover({
  columnId,
  data,
  currentFilter,
  onFilterChange,
}: ColumnFilterPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
    new Set(currentFilter || [])
  );

  // Popover açıldığında mevcut filtreyi yükle
  React.useEffect(() => {
    if (open) {
      setSelectedValues(new Set(currentFilter || []));
      setSearchTerm("");
    }
  }, [open, currentFilter]);

  // Unique değerleri hesapla
  const { uniqueValues, totalCount } = React.useMemo(() => {
    return getColumnUniqueValues(data, columnId, 200);
  }, [data, columnId]);

  // Arama terimine göre filtrele
  const filteredValues = React.useMemo(() => {
    if (!searchTerm) return uniqueValues;
    const term = searchTerm.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(term));
  }, [uniqueValues, searchTerm]);

  const hasActiveFilter = currentFilter && currentFilter.length > 0;

  const handleToggle = (value: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedValues(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedValues(new Set(filteredValues));
  };

  const handleClearSelection = () => {
    setSelectedValues(new Set());
  };

  const handleApply = () => {
    if (selectedValues.size === 0 || selectedValues.size === uniqueValues.length) {
      onFilterChange(undefined);
    } else {
      onFilterChange(Array.from(selectedValues));
    }
    setOpen(false);
  };

  const handleClear = () => {
    onFilterChange(undefined);
    setSelectedValues(new Set());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-1 rounded hover:bg-accent/50 transition-colors relative",
            hasActiveFilter && "text-primary"
          )}
          title={t('filter.title')}
        >
          <Filter className="h-3 w-3" />
          {hasActiveFilter && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex flex-col max-h-80">
          {/* Header */}
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <span className="text-sm font-medium">{t('filter.title')}</span>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                {t('filter.clear')}
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('filter.search_placeholder')}
                className="w-full h-8 pl-7 pr-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Select All / Clear */}
          <div className="px-3 py-1.5 border-b flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary hover:underline"
            >
              {t('filter.select_all')}
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={handleClearSelection}
              className="text-xs text-primary hover:underline"
            >
              {t('filter.deselect_all')}
            </button>
            {totalCount > 200 && (
              <span className="text-xs text-muted-foreground ml-auto">
                {t('filter.showing_top', { count: 200 })}
              </span>
            )}
          </div>

          {/* Values List */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-48 custom-scrollbar">
            {filteredValues.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {t('filter.no_values')}
              </div>
            ) : (
              <div className="py-1">
                {filteredValues.map((value) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedValues.has(value)}
                      onCheckedChange={() => handleToggle(value)}
                    />
                    <span className="text-sm truncate flex-1" title={value || t('filter.empty_value')}>
                      {value || <span className="text-muted-foreground italic">{t('filter.empty_value')}</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t flex justify-between items-center bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {t('filter.selected_count', { count: selectedValues.size })}
            </span>
            <Button size="sm" onClick={handleApply} className="h-7 text-xs">
              {t('filter.apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
