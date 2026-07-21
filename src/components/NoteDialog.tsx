import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function NoteDialog({
  open, initial, onOpenChange, onSave, saving,
}: {
  open: boolean;
  initial: string;
  saving?: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (value: string) => void | Promise<void>;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState(initial);
  useEffect(() => { if (open) setValue(initial); }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md rounded-3xl border-border/40 p-6">
        <DialogHeader className="text-start">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <StickyNote className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {initial ? t.editNote : t.addNote}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {t.notePlaceholder}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.notePlaceholder}
          rows={5}
          dir="auto"
          className="resize-none rounded-2xl border-border/50 bg-secondary/40 text-sm"
        />
        <DialogFooter className="mt-2 flex flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
          <Button
            onClick={() => onSave(value)}
            disabled={saving}
            className="rounded-full bg-gradient-to-br from-primary to-primary/80 px-6 text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
          >
            {saving ? t.saving : t.saveNote}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-6"
          >
            {t.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
