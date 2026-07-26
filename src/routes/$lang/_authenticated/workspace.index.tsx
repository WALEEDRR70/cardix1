import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@/lib/nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { Building2, Plus, ChevronRight, BadgeCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { slugify, useWs, type Company, type CompanyRole, roleLabel } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/workspace/")({
  head: () => ({ meta: [{ title: "Company workspace — Cardixn" }] }),
  component: WorkspaceIndex,
});

type Row = { role: CompanyRole; companies: Company | null };

function WorkspaceIndex() {
  const { w } = useWs();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-workspaces", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_members")
        .select("role, companies(*)")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const finalSlug = slugify(slug || name);
      const { data: company, error } = await supabase
        .from("companies")
        .insert({ owner_id: user.id, name: name.trim(), slug: finalSlug })
        .select()
        .single();
      if (error) throw error;
      const { error: mErr } = await supabase
        .from("company_members")
        .insert({ company_id: company.id, user_id: user.id, role: "owner", status: "active" });
      if (mErr) throw mErr;
      await supabase.from("company_departments").insert(
        ["Management", "Sales", "Marketing", "Design", "IT"].map((d, i) => ({
          company_id: company.id,
          name: d,
          slug: slugify(d),
          sort_order: i,
        })),
      );
      qc.invalidateQueries({ queryKey: ["my-workspaces", user.id] });
      nav({ to: "/workspace/$id", params: { id: company.id } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const rows = (data ?? []).filter((r) => r.companies);

  return (
    <MobileShell topBar={<PageHeader title={w.companyWorkspace} back="/dashboard" />}>
      <div className="space-y-5 px-5 pb-10 lg:px-8">
        {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">{w.loading}</p>}

        {!isLoading && rows.length === 0 && !creating && (
          <div className="glass mt-6 rounded-3xl border border-border/60 p-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
              <Building2 className="h-6 w-6 text-accent" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">{w.noWorkspaces}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{w.noWorkspacesDesc}</p>
            <button
              onClick={() => nav({ to: "/co/new" })}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Plus className="h-4 w-4" /> {w.createWorkspace}
            </button>
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((r) => (
              <Link
                key={r.companies!.id}
                to="/workspace/$id"
                params={{ id: r.companies!.id }}
                className="glass flex items-center gap-4 rounded-3xl border border-border/60 p-4 transition hover:border-accent/50"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary text-sm font-bold"
                  style={{ background: r.companies!.logo_url ? undefined : r.companies!.brand_primary + "22", color: r.companies!.brand_primary }}
                >
                  {r.companies!.logo_url ? (
                    <img src={r.companies!.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    r.companies!.name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="truncate">{r.companies!.name}</span>
                    {r.companies!.is_verified && <BadgeCheck className="h-4 w-4 text-accent" />}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" /> {roleLabel(r.role, w)} · /company/{r.companies!.slug}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </Link>
            ))}
            {!creating && (
              <button
                onClick={() => nav({ to: "/co/new" })}
                className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" /> {w.createWorkspace}
              </button>
            )}
          </div>
        )}

        {creating && (
          <form onSubmit={create} className="glass space-y-3 rounded-3xl border border-border/60 p-5">
            <h2 className="text-sm font-semibold">{w.createWorkspace}</h2>
            <div>
              <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.companyName}</label>
              <input
                required
                value={name}
                onChange={(e) => { setName(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }}
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="AOSS MEDIA"
              />
            </div>
            <div>
              <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.companySlug}</label>
              <div className="flex items-center rounded-2xl border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
                <span className="pl-4 text-sm text-muted-foreground">/company/</span>
                <input
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full bg-transparent px-2 py-3 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                disabled={busy}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-60"
                style={{ background: "var(--gradient-gold)" }}
              >
                {busy ? "…" : w.createWorkspace}
              </button>
              <button type="button" onClick={() => setCreating(false)} className="rounded-2xl border border-border px-5 text-sm">
                {w.cancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </MobileShell>
  );
}
