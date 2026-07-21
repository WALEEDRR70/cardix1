import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ConfirmDeleteDialog({
  open, onOpenChange, onConfirm, title, description, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
}) {
  const { t } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-strong max-w-sm rounded-3xl border-border/40 p-6">
        <AlertDialogHeader className="text-start">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-destructive/15 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold tracking-tight">
            {title ?? t.deleteConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-muted-foreground">
            {description ?? t.deleteConfirmDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 flex flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-destructive px-6 text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90"
          >
            {loading ? "…" : t.delete}
          </AlertDialogAction>
          <AlertDialogCancel className="mt-0 rounded-full border-border/40 px-6">
            {t.cancel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
