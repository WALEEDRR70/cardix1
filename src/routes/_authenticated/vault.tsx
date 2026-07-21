import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { Trash2, Phone, Mail, Globe } from "lucide-react";
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

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("saved_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success("Deleted");
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
              <div key={c.id} className="glass card-lift group rounded-2xl p-3 lg:p-4">
                <div className="flex items-start gap-2.5">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary bg-cover bg-center text-[11px] font-semibold lg:h-12 lg:w-12 lg:text-sm"
                    style={{ backgroundImage: c.avatar_url ? `url(${c.avatar_url})` : undefined }}
                  >
                    {!c.avatar_url && c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold lg:text-sm">{c.name}</p>
                    {c.title && <p className="truncate text-[11px] text-muted-foreground lg:text-xs">{c.title}</p>}
                    {c.company && <p className="truncate text-[10px] text-muted-foreground lg:text-[11px]">{c.company}</p>}
                  </div>
                  <button
                    onClick={() => del(c.id)}
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label={t.delete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {c.phone && <QuickPill href={`tel:${c.phone}`} icon={<Phone className="h-3 w-3" />} label={t.call} />}
                  {c.email && <QuickPill href={`mailto:${c.email}`} icon={<Mail className="h-3 w-3" />} label={t.email} />}
                  {c.website && (
                    <QuickPill href={c.website.startsWith("http") ? c.website : `https://${c.website}`} icon={<Globe className="h-3 w-3" />} label={t.website} />
                  )}
                  {c.source === "scan" && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
                      Scanned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        )}
      </div>
    </MobileShell>
  );
}

function QuickPill({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium hover:bg-muted">
      {icon} {label}
    </a>

  );
}
