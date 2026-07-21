import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { ArrowLeft, Eye, Download, MousePointerClick } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/cards/$id/analytics")({
  head: () => ({
    meta: [
      { title: "Card analytics — Cardix" },
      { name: "description", content: "See how people interact with your Cardix digital business card." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { t } = useI18n();
  const { id } = Route.useParams();

  const { data: card } = useQuery({
    queryKey: ["card", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["card_events", id],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("card_events")
        .select("event_type, created_at")
        .eq("card_id", id)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const rows = events ?? [];
    const in7 = rows.filter((e) => now - new Date(e.created_at).getTime() < 7 * day);
    const views = rows.filter((e) => e.event_type === "view").length;
    const saves = rows.filter((e) => e.event_type === "save_contact").length;

    const buckets: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * day);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    rows.forEach((e) => {
      if (e.event_type !== "view") return;
      const k = new Date(e.created_at).toISOString().slice(0, 10);
      if (k in buckets) buckets[k]++;
    });
    const series = Object.entries(buckets);
    const max = Math.max(1, ...series.map(([, v]) => v));
    return { views, saves, in7: in7.length, series, max };
  }, [events]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/cards/$id" params={{ id }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.editCard}
          </Link>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t.analytics}</h1>
          {card && <p className="mt-1 text-sm text-muted-foreground">{card.name}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat icon={<Eye className="h-4 w-4" />} label={t.totalViews} value={card?.view_count ?? 0} />
          <Stat icon={<MousePointerClick className="h-4 w-4" />} label={t.last7days} value={stats.in7} />
          <Stat icon={<Download className="h-4 w-4" />} label={t.contactSaves} value={stats.saves} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">{t.last30days}</h2>
            <span className="text-xs text-muted-foreground">{stats.views} {t.totalViews.toLowerCase()}</span>
          </div>
          {events && events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t.noAnalytics}</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {stats.series.map(([day, v]) => (
                <div key={day} className="group relative flex-1">
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition hover:bg-primary"
                    style={{ height: `${(v / stats.max) * 100}%`, minHeight: v > 0 ? 4 : 2 }}
                  />
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background opacity-0 group-hover:opacity-100">
                    {day}: {v}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
