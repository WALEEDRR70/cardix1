import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { Eye, Download, MousePointerClick } from "lucide-react";
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
        .from("card_events").select("event_type, created_at")
        .eq("card_id", id).gte("created_at", since)
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
    const saves = rows.filter((e) => e.event_type === "save").length;
    const buckets: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) buckets[new Date(now - i * day).toISOString().slice(0, 10)] = 0;
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
    <MobileShell topBar={<PageHeader title={t.analytics} subtitle={card?.name} back={`/cards/${id}`} />}>
      <div className="space-y-4 px-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Eye className="h-3.5 w-3.5" />} label={t.totalViews} value={card?.view_count ?? 0} />
          <Stat icon={<MousePointerClick className="h-3.5 w-3.5" />} label={t.last7days} value={stats.in7} />
          <Stat icon={<Download className="h-3.5 w-3.5" />} label={t.contactSaves} value={stats.saves} />
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t.last30days}</h2>
            <span className="text-[11px] text-muted-foreground">{stats.views} {t.totalViews.toLowerCase()}</span>
          </div>
          {events && events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t.noAnalytics}</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {stats.series.map(([day, v]) => (
                <div key={day} className="group relative flex-1">
                  <div
                    className="w-full rounded-t-md transition"
                    style={{
                      height: `${(v / stats.max) * 100}%`,
                      minHeight: v > 0 ? 4 : 2,
                      background: v > 0 ? "var(--gradient-gold)" : "color-mix(in oklab, var(--foreground) 10%, transparent)",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
