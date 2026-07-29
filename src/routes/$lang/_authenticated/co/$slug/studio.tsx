import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/nav";
import { useQuery } from "@tanstack/react-query";
import { Wand2, Plus, Loader2, Trash2, Copy, Building2 } from "lucide-react";
import { toast } from "sonner";
import { CompanyShell } from "@/components/company/CompanyShell";
import { Card, EmptyState } from "@/components/company/sections";
import { DesignPreview, cardDesignValues } from "@/components/DesignPreview";
import type { StudioDoc } from "@/lib/studio/types";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";
import { AssignDesignDialog } from "@/components/company/AssignDesignDialog";
import { txDict } from "@/lib/tx";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/studio")({ component: Page });

const T = {
  en: {
    desc: "Open any company card in the visual designer: drag & drop canvas, layers, elements, AI style rebuild and export.",
    open: "Open designer", none: "No cards yet", cards: "Company cards",
    newDesign: "New drag & drop design", creating: "Creating…", failed: "Could not create the design",
    del: "Delete card", confirm: "Delete this card permanently?", deleted: "Card deleted",
    delFailed: "Could not delete the card",
    dup: "Duplicate card", duped: "Card duplicated", dupFailed: "Could not duplicate the card",
    assign: "Assign to department",
  },
  ar: {
    desc: "افتح أي بطاقة للشركة داخل المصمم البصري: لوحة سحب وإفلات، طبقات، عناصر، إعادة بناء النمط بالذكاء الاصطناعي والتصدير.",
    open: "فتح المصمم", none: "لا توجد بطاقات بعد", cards: "بطاقات الشركة",
    newDesign: "تصميم جديد بالسحب والإفلات", creating: "جارٍ الإنشاء…", failed: "تعذّر إنشاء التصميم",
    del: "حذف البطاقة", confirm: "هل تريد حذف هذه البطاقة نهائيًا؟", deleted: "تم حذف البطاقة",
    delFailed: "تعذّر حذف البطاقة",
    dup: "نسخ البطاقة", duped: "تم نسخ البطاقة", dupFailed: "تعذّر نسخ البطاقة",
    assign: "تعيين لقسم",
  },
};

function Page() {
  const { company, role } = useCompany();
  const { w, lang } = useWs();
  const t = txDict(T.en, T.ar);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [assignCard, setAssignCard] = useState<any | null>(null);
  const canDelete = canManageCompany(role);

  async function duplicateCard(c: any) {
    setDuplicating(c.id);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user.id;
      if (!uid) throw new Error("no session");
      const { data, error } = await supabase
        .from("cards")
        .insert({
          user_id: uid,
          company_id: company.id,
          name: `${c.name || company.name} (copy)`,
          title: c.title ?? null,
          slug: `${company.slug}-design-${Math.random().toString(36).slice(2, 7)}`,
          card_type: "company",
          template: c.template,
          accent_color: c.accent_color,
          design: c.design ?? null,
          avatar_url: c.avatar_url ?? null,
          phone: c.phone ?? null,
          email: c.email ?? null,
          website: c.website ?? null,
          company: c.company ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success(t.duped);
      await refetch();
      navigate({ to: "/studio/$id", params: { id: data.id } });
    } catch {
      toast.error(t.dupFailed);
    } finally {
      setDuplicating(null);
    }
  }

  async function deleteCard(id: string) {
    if (!window.confirm(t.confirm)) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
      toast.success(t.deleted);
      await refetch();
    } catch {
      toast.error(t.delFailed);
    } finally {
      setDeleting(null);
    }
  }


  async function createDesign() {
    setCreating(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user.id;
      if (!uid) throw new Error("no session");
      const slug = `${company.slug}-design-${Math.random().toString(36).slice(2, 7)}`;
      const { data, error } = await supabase
        .from("cards")
        .insert({
          user_id: uid,
          company_id: company.id,
          name: company.name,
          slug,
          card_type: "company",
          accent_color: (company as any).primary_color || "#7c34ff",
        })
        .select("id")
        .single();
      if (error) throw error;
      navigate({ to: "/studio/$id", params: { id: data.id } });
    } catch {
      toast.error(t.failed);
    } finally {
      setCreating(false);
    }
  }

  const { data: cards = [], refetch } = useQuery({
    queryKey: ["company-studio-cards", company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, name, title, slug, updated_at, design, template, accent_color, avatar_url, phone, email, website, company")
        .eq("company_id", company.id)
        .eq("card_type", "company")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Live stream: any edit saved in the designer (or by a teammate) re-renders here instantly.
  useEffect(() => {
    const channel = supabase
      .channel(`studio-cards-${company.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards", filter: `company_id=eq.${company.id}` },
        () => { refetch(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [company.id, refetch]);


  return (
    <CompanyShell company={company} role={role} title={w.designStudio} subtitle={company.name}>
      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t.cards}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </div>
          <button
            type="button"
            onClick={createDesign}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {creating ? t.creating : t.newDesign}
          </button>
        </div>
        {cards.length === 0 ? (
          <EmptyState icon={Wand2} title={t.none} hint={t.desc} actionLabel={t.newDesign} onAction={createDesign} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <li key={c.id} className="relative">
                <Link
                  to="/studio/$id"
                  params={{ id: c.id }}
                  className="block rounded-3xl border border-border bg-card/60 p-3 transition hover:border-primary/50"
                >
                  <div className="overflow-hidden rounded-2xl bg-secondary/40">
                    {c.design ? (
                      <DesignPreview
                        doc={c.design as unknown as StudioDoc}
                        values={cardDesignValues(c as any)}
                      />
                    ) : (
                      <div className="grid aspect-[1.75/1] place-items-center text-muted-foreground">
                        <Wand2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 min-w-0 px-1 pb-1 pe-32">
                    <p className="truncate text-sm font-medium text-foreground">{c.name || c.slug}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.title || t.open}</p>
                  </div>
                </Link>
                {canDelete && (
                  <div className="absolute bottom-4 end-4 flex items-center gap-1.5">
                  <button
                    type="button"
                    title={t.assign}
                    aria-label={t.assign}
                    onClick={() => setAssignCard(c)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/80 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                  >
                    <Building2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title={t.dup}
                    aria-label={t.dup}
                    onClick={() => duplicateCard(c)}
                    disabled={duplicating === c.id}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/80 text-muted-foreground transition hover:border-primary/60 hover:text-primary disabled:opacity-60"
                  >
                    {duplicating === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    title={t.del}
                    aria-label={t.del}
                    onClick={() => deleteCard(c.id)}
                    disabled={deleting === c.id}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/80 text-muted-foreground transition hover:border-destructive/60 hover:text-destructive disabled:opacity-60"
                  >
                    {deleting === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <AssignDesignDialog
        open={!!assignCard}
        onOpenChange={(v) => { if (!v) setAssignCard(null); }}
        companyId={company.id}
        lang={lang}
        card={assignCard}
      />
    </CompanyShell>
  );
}
