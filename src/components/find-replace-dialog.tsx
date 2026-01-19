import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Replace } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  onFindAndReplace: (findText: string, replaceText: string, columnId: string, caseSensitive: boolean) => number;
}

export function FindReplaceDialog({
  open,
  onOpenChange,
  headers,
  onFindAndReplace,
}: FindReplaceDialogProps) {
  const { t } = useTranslation();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [targetColumn, setTargetColumn] = useState("all");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const handleReplace = () => {
    if (!findText) return;

    const count = onFindAndReplace(findText, replaceText, targetColumn, caseSensitive);
    
    if (count > 0) {
      toast.success(t('find_replace.success_msg', { count }));
      onOpenChange(false);
    } else {
      toast.info(t('find_replace.not_found'));
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('find_replace.title')}
          </DialogTitle>
          <DialogDescription>
            {t('find_replace.desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="find">{t('find_replace.find_label')}</Label>
            <Input
              id="find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Örn: İstanbul"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="replace">{t('find_replace.replace_label')}</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Örn: İst."
            />
          </div>

          <div className="grid gap-2">
            <Label>{t('find_replace.target_column')}</Label>
            <Select value={targetColumn} onValueChange={setTargetColumn}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('find_replace.target_column')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('find_replace.all_columns')}</SelectItem>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
                id="caseSensitive" 
                checked={caseSensitive}
                onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
            />
            <Label htmlFor="caseSensitive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('find_replace.case_sensitive')}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('find_replace.cancel')}
          </Button>
          <Button onClick={handleReplace} disabled={!findText}>
            <Replace className="w-4 h-4 mr-2" />
            {t('find_replace.replace_all')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
