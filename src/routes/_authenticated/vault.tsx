import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { ArrowLeft, Camera, Trash2, Phone, Mail, Globe, Building2 } from "lucide-react";
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
      const { data, error } = await supabase
        .from("saved_cards")
        .select("*")
        .order("created_at", { ascending: false });
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t.dashboard}
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link
              to="/scan"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Camera className="h-3.5 w-3.5" /> {t.scanCard}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t.vault}</h1>

        {!cards || cards.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            {t.emptyVault}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div key={c.id} className="group rounded-2xl border border-border bg-card p-5 transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold tracking-tight">{c.name}</h3>
                    {c.title && <p className="truncate text-sm text-muted-foreground">{c.title}</p>}
                    {c.company && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" /> {c.company}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => del(c.id)}
                    className="rounded-full p-1.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-destructive group-hover:opacity-100"
                    aria-label={t.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-1.5 text-sm">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Mail className="h-3.5 w-3.5" /> <span className="truncate">{c.email}</span>
                    </a>
                  )}
                  {c.website && (
                    <a
                      href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Globe className="h-3.5 w-3.5" /> <span className="truncate">{c.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
                {c.source === "scan" && (
                  <span className="mt-4 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                    Scanned
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
