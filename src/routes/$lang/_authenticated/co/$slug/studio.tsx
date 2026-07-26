import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link, useNavigate } from "@/lib/nav";
import { useQuery } from "@tanstack/react-query";
import { Wand2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CompanyShell } from "@/components/company/CompanyShell";
import { Card } from "@/components/company/sections";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/studio")({ component: Page });

const T = {
  en: {
    desc: "Open any company card in the visual designer: drag & drop canvas, layers, elements, AI style rebuild and export.",
    open: "Open designer", none: "No cards yet", cards: "Company cards",
    newDesign: "New drag & drop design", creating: "Creating…", failed: "Could not create the design",
  },
  ar: {
    desc: "افتح أي بطاقة للشركة داخل المصمم البصري: لوحة سحب وإفلات، طبقات، عناصر، إعادة بناء النمط بالذكاء الاصطناعي والتصدير.",
    open: "فتح المصمم", none: "لا توجد بطاقات بعد", cards: "بطاقات الشركة",
    newDesign: "تصميم جديد بالسحب والإفلات", creating: "جارٍ الإنشاء…", failed: "تعذّر إنشاء التصميم",
  },
};

function Page() {
  const { company, role } = useCompany();
  const { w, lang } = useWs();
  const t = T[lang === "ar" ? "ar" : "en"];
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

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

  const { data: cards = [] } = useQuery({
    queryKey: ["company-studio-cards", company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, name, title, slug, updated_at")
        .eq("company_id", company.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

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
          <p className="py-6 text-sm text-muted-foreground">{t.none}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {cards.map((c) => (
              <li key={c.id}>
                <Link
                  to="/studio/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 transition hover:border-primary/50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Wand2 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {c.name || c.slug}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{c.title || t.open}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </CompanyShell>
  );
}
