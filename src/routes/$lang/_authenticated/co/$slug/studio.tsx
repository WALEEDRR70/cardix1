import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { useQuery } from "@tanstack/react-query";
import { Wand2, Plus } from "lucide-react";
import { CompanyShell } from "@/components/company/CompanyShell";
import { Card } from "@/components/company/sections";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/studio")({ component: Page });

const T = {
  en: {
    desc: "Open any company card in the visual designer: layers, elements, AI style rebuild and export.",
    open: "Open designer", none: "No cards yet", create: "Create a card", cards: "Company cards",
  },
  ar: {
    desc: "افتح أي بطاقة للشركة داخل المصمم البصري: الطبقات، العناصر، إعادة بناء النمط بالذكاء الاصطناعي والتصدير.",
    open: "فتح المصمم", none: "لا توجد بطاقات بعد", create: "إنشاء بطاقة", cards: "بطاقات الشركة",
  },
};

function Page() {
  const { company, role } = useCompany();
  const { w, lang } = useWs();
  const t = T[lang === "ar" ? "ar" : "en"];

  const { data: cards = [] } = useQuery({
    queryKey: ["company-studio-cards", company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, full_name, title, slug, updated_at")
        .eq("company_id", company.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <CompanyShell company={company} role={role} title={w.designStudio} subtitle={company.name}>
      <Card title={t.cards} description={t.desc}>
        {cards.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-6">
            <p className="text-sm text-muted-foreground">{t.none}</p>
            <Link
              to="/cards/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> {t.create}
            </Link>
          </div>
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
                      {c.full_name || c.slug}
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
