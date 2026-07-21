import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { Trash2, Phone, Mail, Globe, StickyNote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Cardix" },
      { name: "description", content: "Every business card you've saved or scanned, safe in your Cardix vault." },
      { property: "og:title", content: "Vault — Cardix" },
      { property: "og:description", content: "All your saved digital and scanned business cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Vault,
});

function Vault() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: cards } = useQuery({
    queryKey: ["saved_cards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_cards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function del(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("saved_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success("Deleted");
  }

  async function editNote(e: React.MouseEvent, id: string, current: string | null) {
    e.preventDefault();
    e.stopPropagation();
    const next = window.prompt(t.notePlaceholder, current ?? "");
    if (next === null) return;
    const { error } = await supabase.from("saved_cards").update({ notes: next }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success(t.saveNote);
  }

  return (
    <MobileShell topBar={<PageHeader title={t.vault} subtitle={cards ? `${cards.length}` : undefined} />}>
      <div className="px-4 lg:px-8">
        {!cards || cards.length === 0 ? (
          <div className="glass mt-4 rounded-3xl p-10 text-center lg:p-16">
            <p className="text-sm text-muted-foreground lg:text-base">{t.emptyVault}</p>
          </div>
        ) : (
          <div className="grid gap-2 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <Link
                key={c.id}
                to="/vault/$id"
                params={{ id: c.id }}
                className="glass card-lift group block rounded-2xl p-3 lg:p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary bg-cover bg-center text-sm font-semibold ring-1 ring-border/60 lg:h-24 lg:w-24"
                    style={{ backgroundImage: c.avatar_url ? `url(${c.avatar_url})` : undefined }}
                  >
                    {!c.avatar_url && (
                      <div className="grid h-full w-full place-items-center">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold lg:text-[15px]">{c.name}</p>
                        {c.title && <p className="truncate text-[12px] text-muted-foreground">{c.title}</p>}
                        {c.company && <p className="truncate text-[11px] text-muted-foreground/80">{c.company}</p>}
                      </div>
                      <button
                        onClick={(e) => editNote(e, c.id, c.notes)}
                        className="flex min-h-[48px] w-[38%] min-w-0 shrink-0 items-start gap-1 overflow-hidden rounded-lg bg-secondary/60 px-2 py-1.5 text-start text-[10.5px] italic leading-tight text-muted-foreground transition hover:bg-secondary"
                        aria-label={c.notes ? t.editNote : t.addNote}
                      >
                        <StickyNote className="mt-0.5 h-3 w-3 shrink-0 opacity-70" />
                        <span dir="auto" className="line-clamp-2 min-w-0 flex-1 [overflow-wrap:anywhere] [word-break:break-word]">{c.notes || t.addNote}</span>
                      </button>
                      <button
                        onClick={(e) => del(e, c.id)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label={t.delete}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.phone && <QuickPill icon={<Phone className="h-3 w-3" />} label={t.call} />}
                      {c.email && <QuickPill icon={<Mail className="h-3 w-3" />} label={t.email} />}
                      {c.website && <QuickPill icon={<Globe className="h-3 w-3" />} label={t.website} />}
                      {c.source === "scan" && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
                          Scanned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function QuickPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium">
      {icon} {label}
    </span>
  );
}
