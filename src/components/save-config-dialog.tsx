import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDelimiter: string;
  onConfirm: (config: { delimiter: string, includeSep: boolean, includeBom: boolean }) => void;
}

export function SaveConfigDialog({
  open,
  onOpenChange,
  defaultDelimiter,
  onConfirm,
}: SaveConfigDialogProps) {
  const { t } = useTranslation();
  const [delimiter, setDelimiter] = useState(defaultDelimiter || ",");
  const [includeSep, setIncludeSep] = useState(false);
  const [includeBom, setIncludeBom] = useState(true);

  useEffect(() => {
    if (open) {
      setDelimiter(defaultDelimiter || ",");
      // Eğer virgül değilse genelde Excel için sep= gerekir
      setIncludeSep(defaultDelimiter !== ",");
      setIncludeBom(true);
    }
  }, [open, defaultDelimiter]);

  const handleConfirm = () => {
    onConfirm({ delimiter, includeSep, includeBom });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleConfirm}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            {t('app.save_as')}
          </DialogTitle>
          <DialogDescription>
            {t('save_config.desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>{t('save_config.delimiter_label')}</Label>
            <Select value={delimiter} onValueChange={setDelimiter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">{t('save_config.comma')}</SelectItem>
                <SelectItem value=";">{t('save_config.semicolon')}</SelectItem>
                <SelectItem value="&#9;">{t('save_config.tab')}</SelectItem>
                <SelectItem value="|">{t('save_config.pipe')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
                id="includeSep" 
                checked={includeSep}
                onCheckedChange={(checked) => setIncludeSep(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => setIncludeSep(!includeSep)}>
                <Label htmlFor="includeSep" className="text-sm font-medium leading-none cursor-pointer">
                    {t('save_config.excel_compat_label')}
                </Label>
                <p className="text-xs text-muted-foreground">
                    {t('save_config.excel_compat_desc')}
                </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
                id="includeBom" 
                checked={includeBom}
                onCheckedChange={(checked) => setIncludeBom(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => setIncludeBom(!includeBom)}>
                <Label htmlFor="includeBom" className="text-sm font-medium leading-none cursor-pointer">
                    {t('save_config.bom_label')}
                </Label>
                <p className="text-xs text-muted-foreground">
                    {t('save_config.bom_desc')}
                </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('find_replace.cancel')}
          </Button>
          <Button onClick={handleConfirm}>
            {t('save_config.continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}