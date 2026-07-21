import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { CardPreview } from "@/components/CardPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — Cardix" },
      { name: "description", content: "Manage your Cardix digital business cards." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();

  const { data: cards } = useQuery({
    queryKey: ["cards", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function del(id: string) {
    if (!confirm("Delete this card?")) return;
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cards"] });
    toast.success("Deleted");
  }

  const totalViews = cards?.reduce((a, c) => a + (c.view_count ?? 0), 0) ?? 0;
  const primary = cards?.[0];

  return (
    <MobileShell topBar={<PageHeader title={t.brand} subtitle={user.email ?? undefined} right={<ThemeToggle compact />} />}>
      <div className="px-5">
        {/* Featured (primary) card */}
        {primary ? (
          <Link to="/cards/$id" params={{ id: primary.id }} className="block">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] opacity-40 blur-2xl" style={{ background: "var(--gradient-mesh)" }} />
              <div className="relative flex justify-center">
                <CardPreview card={primary} size="lg" />
              </div>
            </div>
          </Link>
        ) : (
          <EmptyHome t={t} />
        )}

        {/* Stats */}
        {cards && cards.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            <StatTile label={t.myCards} value={cards.length} />
            <StatTile label={t.totalViews} value={totalViews} />
            <StatTile label={t.templates.luxury} value={new Set(cards.map((c) => c.template)).size} icon={<Sparkles className="h-3.5 w-3.5" />} />
          </div>
        )}

        {/* All cards */}
        {cards && cards.length > 1 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.myCards}</h2>
              <span className="text-[11px] text-muted-foreground">{cards.length}</span>
            </div>
            <div className="grid gap-3">
              {cards.slice(1).map((c) => (
                <div key={c.id} className="glass card-lift flex items-center gap-3 rounded-2xl p-3">
                  <Link to="/cards/$id" params={{ id: c.id }} className="grid h-14 w-24 shrink-0 overflow-hidden rounded-xl">
                    <MiniCard card={c} />
                  </Link>
                  <Link to="/cards/$id" params={{ id: c.id }} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.title || c.company || "/c/" + c.slug}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Eye className="h-3 w-3" /> {c.view_count ?? 0}
                    </p>
                  </Link>
                  <button
                    onClick={() => del(c.id)}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </MobileShell>
  );
}

function EmptyHome({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className="glass mt-4 flex flex-col items-center gap-4 rounded-3xl p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <p className="text-lg font-semibold">{t.createCard}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.noCards}</p>
      </div>
      <Link
        to="/cards/new"
        className="rounded-full px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        style={{ background: "var(--gradient-gold)" }}
      >
        {t.createCard}
      </Link>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function MiniCard({ card }: { card: { name: string; template?: string | null; accent_color: string; title?: string | null } }) {
  return <CardPreview card={{ ...card, accent_color: card.accent_color }} size="sm" />;
}
