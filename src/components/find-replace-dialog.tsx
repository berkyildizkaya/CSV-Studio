import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Replace } from "lucide-react";
import { toast } from "sonner";

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
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [targetColumn, setTargetColumn] = useState("all");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const handleReplace = () => {
    if (!findText) return;

    const count = onFindAndReplace(findText, replaceText, targetColumn, caseSensitive);
    
    if (count > 0) {
      toast.success(`${count} adet kayıt güncellendi.`);
      onOpenChange(false);
    } else {
      toast.info("Değiştirilecek kayıt bulunamadı.");
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
            Bul ve Değiştir
          </DialogTitle>
          <DialogDescription>
            Veri seti içinde metin arayın ve toplu olarak değiştirin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="find">Aranan Metin</Label>
            <Input
              id="find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Örn: İstanbul"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="replace">Yeni Değer</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Örn: İst."
            />
          </div>

          <div className="grid gap-2">
            <Label>Hedef Sütun</Label>
            <Select value={targetColumn} onValueChange={setTargetColumn}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sütun Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sütunlar</SelectItem>
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
              Büyük/Küçük harf duyarlı
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleReplace} disabled={!findText}>
            <Replace className="w-4 h-4 mr-2" />
            Tümünü Değiştir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
