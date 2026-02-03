import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Info, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const { t } = useTranslation();
  const APP_VERSION = "1.0.1";
  const APP_AUTHOR = "Berk YILDIZKAYA";
  const GITHUB_URL = "https://github.com/berkyildizkaya/csv-studio";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            {t('about.title')}
          </DialogTitle>
          <DialogDescription>
            CSV Studio - {t('app.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{t('about.version')}</h4>
            <p className="text-sm text-muted-foreground">{APP_VERSION}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{t('about.author')}</h4>
            <p className="text-sm text-muted-foreground">{APP_AUTHOR}</p>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                <Github className="w-4 h-4" />
                {t('about.github')}
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('about.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
