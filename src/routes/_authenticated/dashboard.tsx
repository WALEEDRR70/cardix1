import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { Plus, ExternalLink, LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Cardix" },
      { name: "description", content: "Manage your Cardix digital business cards." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const nav = useNavigate();
  const { user } = Route.useRouteContext();

  const { data: cards } = useQuery({
    queryKey: ["cards", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  async function del(id: string) {
    if (!confirm("Delete this card?")) return;
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cards"] });
    toast.success("Deleted");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">C</span>
            <span className="font-semibold tracking-tight">{t.brand}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle />
            <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
              <LogOut className="h-3.5 w-3.5" /> {t.signOut}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.myCards}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Link to="/cards/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> {t.newCard}
          </Link>
        </div>

        {cards && cards.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">{t.noCards}</p>
            <Link to="/cards/new" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">
              {t.createCard}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards?.map((c) => (
            <div key={c.id} className="group rounded-3xl border border-border bg-card p-5 transition hover:shadow-soft">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">{c.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{c.title || c.company || "—"}</p>
                </div>
                <span className="h-8 w-8 rounded-xl" style={{ backgroundColor: c.accent_color }} />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">/c/{c.slug}</div>
              <div className="mt-5 flex items-center gap-2">
                <Link to="/cards/$id" params={{ id: c.id }} className="flex-1 rounded-xl bg-secondary px-3 py-2 text-center text-xs font-medium hover:bg-muted">
                  <Pencil className="mx-auto h-3.5 w-3.5" />
                </Link>
                <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-secondary px-3 py-2 text-center text-xs font-medium hover:bg-muted">
                  <ExternalLink className="mx-auto h-3.5 w-3.5" />
                </a>
                <button onClick={() => del(c.id)} className="flex-1 rounded-xl bg-secondary px-3 py-2 text-center text-xs font-medium hover:bg-destructive/10 hover:text-destructive">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
