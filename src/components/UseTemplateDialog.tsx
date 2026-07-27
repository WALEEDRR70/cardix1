// Lets the user pick how to use a shared template: on one of their existing cards
// (horizontal slider of cards) or as a brand-new card.
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CardPreview } from "@/components/CardPreview";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { listTargetCards, type DesignTemplate } from "@/lib/templates";

export function UseTemplateDialog({
  tpl,
  open,
  onOpenChange,
  ar,
  userId,
  companyId,
  busy,
  onApply,
  onCreate,
}: {
  tpl: DesignTemplate | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ar: boolean;
  userId: string | null;
  companyId?: string | null;
  busy: boolean;
  onApply: (cardId: string) => void;
  onCreate: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const dragRef = useDragScroll<HTMLDivElement>();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["template-target-cards", userId, companyId ?? null],
    queryFn: () => listTargetCards(userId!, companyId ?? null),
    enabled: open && !!userId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{ar ? "استخدام القالب" : "Use template"}</DialogTitle>
          <DialogDescription>
            {ar
              ? "اختر بطاقة موجودة لتغيير تصميمها، أو أنشئ بطاقة جديدة بهذا التصميم."
              : "Pick an existing card to restyle, or create a new card with this design."}
          </DialogDescription>
        </DialogHeader>

        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {ar ? "بطاقاتي" : "My cards"}
          </p>
          {isLoading ? (
            <div className="grid h-32 place-items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : cards.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {ar ? "لا توجد بطاقات بعد." : "No cards yet."}
            </p>
          ) : (
            <div ref={dragRef} className="flex gap-3 overflow-x-auto pb-2">
              {cards.map((c) => {
                const active = picked === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPicked(c.id)}
                    className={
                      "relative w-[190px] shrink-0 rounded-2xl border p-2 text-start transition " +
                      (active ? "border-accent bg-accent/10" : "border-border/60 hover:border-accent/50")
                    }
                  >
                    <div className="grid place-items-center overflow-hidden rounded-xl bg-muted/20 p-1">
                      <CardPreview
                        card={{
                          name: c.name,
                          slug: c.slug,
                          title: c.title,
                          company: c.company,
                          bio: c.bio,
                          phone: c.phone,
                          whatsapp: c.whatsapp,
                          email: c.email,
                          website: c.website,
                          address: c.address,
                          avatar_url: c.avatar_url,
                          accent_color: c.accent_color,
                          template: c.template,
                          design: c.design,
                          socials: c.socials,
                        }}
                        size="sm"
                      />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold">{c.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{c.title ?? `/c/${c.slug}`}</p>
                    {active && (
                      <span className="absolute end-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!picked || busy}
            onClick={() => picked && onApply(picked)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {ar ? "تطبيق على البطاقة المختارة" : "Apply to selected card"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCreate}
            className="flex items-center justify-center gap-1.5 rounded-full border border-border/60 px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {ar ? "إنشاء بطاقة جديدة" : "Create new card"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
