import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface RowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  sampleData: any[]; 
  initialData?: any | null; // Düzenleme modu için veri
  onSave: (newData: any) => void;
}

const ITEMS_PER_PAGE = 8; 

function guessColumnType(header: string, data: any[]): 'boolean' | 'date' | 'number' | 'text' {
  const lowerHeader = header.toLowerCase();
  if (lowerHeader.includes("date") || lowerHeader.includes("tarih") || lowerHeader.includes("time")) return 'date';
  if (lowerHeader.startsWith("is") || lowerHeader.startsWith("has") || lowerHeader.includes("active")) return 'boolean';

  for (let i = 0; i < Math.min(data.length, 5); i++) {
    const val = data[i][header];
    if (val === undefined || val === null || val === "") continue;
    
    const strVal = String(val).trim().toLowerCase();
    
    if (strVal === "true" || strVal === "false") return "boolean";
    if (!isNaN(Date.parse(val)) && val.length > 5 && (val.includes("-") || val.includes("/") || val.includes("."))) return "date";
    if (!isNaN(Number(strVal)) && !strVal.startsWith("0")) return "number";
  }

  return "text";
}

export function RowFormDialog({ open, onOpenChange, headers, sampleData, initialData, onSave }: RowFormDialogProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const mode = initialData ? 'edit' : 'add';

  const columnTypes = useMemo(() => {
    const types: Record<string, string> = {};
    headers.forEach(h => {
      types[h] = guessColumnType(h, sampleData);
    });
    return types;
  }, [headers, sampleData]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Düzenleme Modu: Mevcut veriyi yükle
        setFormData({ ...initialData });
      } else {
        // Ekleme Modu: Varsayılanları yükle
        const defaults: Record<string, any> = {};
        headers.forEach(header => {
          const type = columnTypes[header];
          if (type === 'boolean') defaults[header] = "false"; 
          else if (type === 'date') defaults[header] = format(new Date(), "yyyy-MM-dd");
          else defaults[header] = "";
        });
        setFormData(defaults);
      }
      setCurrentPage(0);
    }
  }, [open, headers, columnTypes, initialData]);

  const totalPages = Math.ceil(headers.length / ITEMS_PER_PAGE);
  const currentHeaders = headers.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const handleInputChange = (header: string, value: any) => {
    setFormData(prev => ({ ...prev, [header]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? t('row_form.edit_title') : t('row_form.add_title')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? t('row_form.edit_desc') : t('row_form.add_desc')} 
            {' '}{t('row_form.columns_count', { count: headers.length })} {t('row_form.page_info', { current: currentPage + 1, total: totalPages })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            {currentHeaders.map((header) => {
              const type = columnTypes[header];
              const value = formData[header];

              return (
                <div key={header} className="grid gap-2 p-2 border rounded-md bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`input-${header}`} className="text-xs font-semibold uppercase text-muted-foreground truncate max-w-[120px]" title={header}>
                      {header}
                    </Label>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{type}</Badge>
                  </div>

                  {type === 'boolean' ? (
                    <div className="flex items-center space-x-2 h-9">
                      <Switch
                        id={`input-${header}`}
                        checked={String(value).toLowerCase() === "true"}
                        onCheckedChange={(checked) => handleInputChange(header, String(checked))}
                      />
                      <span className="text-sm">{String(value).toLowerCase() === "true" ? "True" : "False"}</span>
                    </div>
                  ) : type === 'date' ? (
                    <div className="relative">
                        <Input
                            id={`input-${header}`}
                            type="date"
                            value={value}
                            onChange={(e) => handleInputChange(header, e.target.value)}
                            className="w-full"
                        />
                    </div>
                  ) : type === 'number' ? (
                    <Input
                      id={`input-${header}`}
                      type="number"
                      value={value}
                      onChange={(e) => handleInputChange(header, e.target.value)}
                      placeholder="0"
                    />
                  ) : (
                    <Input
                      id={`input-${header}`}
                      value={value || ""}
                      onChange={(e) => handleInputChange(header, e.target.value)}
                      placeholder="..."
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('row_form.back')}
          </Button>

          <div className="flex gap-2">
            {currentPage < totalPages - 1 ? (
              <Button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}>
                {t('row_form.next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} className={mode === 'edit' ? "bg-primary" : "bg-green-600 hover:bg-green-700 text-white"}>
                {mode === 'edit' ? t('row_form.save_changes') : t('row_form.save_and_add')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}