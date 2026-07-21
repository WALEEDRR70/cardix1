import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardForm, type CardFormData } from "@/components/CardForm";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ExternalLink, Share2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/_authenticated/cards/$id")({
  head: () => ({ meta: [{ title: "Edit card — Cardix" }] }),
  component: EditCard,
});

function EditCard() {
  const { t } = useI18n();
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: card, isLoading } = useQuery({
    queryKey: ["card", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !card) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;

  const initial: CardFormData = {
    name: card.name, slug: card.slug, title: card.title ?? "", company: card.company ?? "",
    bio: card.bio ?? "", phone: card.phone ?? "", whatsapp: card.whatsapp ?? "",
    email: card.email ?? "", website: card.website ?? "", address: card.address ?? "",
    accent_color: card.accent_color, is_published: card.is_published,
  };

  async function onSubmit(d: CardFormData): Promise<void> {
    const { error } = await supabase.from("cards").update(d).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["card", id] });
    qc.invalidateQueries({ queryKey: ["cards"] });
    toast.success("Saved");
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/c/${card.slug}` : `/c/${card.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.dashboard}
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{t.editCard}</h1>
          <div className="flex items-center gap-2">
            <a href={`/c/${card.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
              <ExternalLink className="h-3.5 w-3.5" /> {t.view}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success("Link copied");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              <Share2 className="h-3.5 w-3.5" /> {t.share}
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[auto_1fr]">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={publicUrl} size={120} fgColor="#111" bgColor="#fff" level="M" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.scan}</p>
            <p className="mt-1 break-all text-sm">{publicUrl}</p>
            <p className="mt-3 text-xs text-muted-foreground">Views: {card.view_count}</p>
          </div>
        </div>

        <CardForm initial={initial} onSubmit={onSubmit} submitLabel={t.save} />
      </div>
    </div>
  );
}
