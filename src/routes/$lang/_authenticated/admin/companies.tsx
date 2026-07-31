import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, CreditCard, Eye, Palette, Search, ShieldCheck, Users } from "lucide-react";

import { MobileShell, PageHeader } from "@/components/MobileShell";
import { listPlatformCompanies, type AdminCompanyRow } from "@/lib/admin.functions";
import { CardPreview } from "@/components/CardPreview";

export const Route = createFileRoute("/$lang/_authenticated/admin/companies")({
  head: () => ({
    meta: [
      { title: "Companies — Cardixn admin" },
      { name: "description", content: "Browse every Cardixn company workspace and its corporate cards." },
      { property: "og:title", content: "Companies — Cardixn admin" },
      { property: "og:description", content: "Browse every Cardixn company workspace and its cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCompanies,
});

function AdminCompanies() {
  const load = useServerFn(listPlatformCompanies);
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => load({}),
    retry: false,
  });

  const companies = data?.companies ?? [];
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((c) =>
      [c.name, c.slug, c.owner_email, ...c.cards.map((k) => k.name)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [companies, q]);

  if (error) {
    return (
      <MobileShell topBar={<PageHeader title="الشركات" back="/dashboard" />}>
        <div className="px-5 py-20 text-center text-sm text-muted-foreground">
          هذه الصفحة مخصّصة لمسؤولي المنصّة فقط.
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell topBar={<PageHeader title="الشركات" back="/dashboard" />}>
      <div className="space-y-5 px-5 pb-24 lg:px-8">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Building2 className="h-4 w-4" />} label="الشركات" value={companies.length} />
          <Stat icon={<CreditCard className="h-4 w-4" />} label="بطاقات الشركات" value={data?.totalCards ?? 0} />
        </div>

        <label className="glass flex items-center gap-2 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم الشركة أو الرابط أو المالك…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">…</p>}

        <div className="space-y-3">
          {filtered.map((c) => (
            <CompanyRow key={c.id} company={c} />
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">
              لا توجد شركات مطابقة.
            </p>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function CompanyRow({ company }: { company: AdminCompanyRow }) {
  const { lang } = Route.useParams();
  const [open, setOpen] = useState(false);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-sm font-semibold">
          {company.logo_url ? (
            <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            company.name.slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{company.name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            /{company.slug} · {company.owner_email ?? "—"}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
          {company.cards.length} بطاقة
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-border/60 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            أُنشئت {new Date(company.created_at).toLocaleDateString("ar")} · {company.member_count} عضو ·{" "}
            {company.is_published ? "منشورة" : "غير منشورة"}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/${lang}/co/${company.slug}`}
              className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] hover:bg-secondary/70"
            >
              مساحة الشركة
            </a>
            <a
              href={`/${lang}/company/${company.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] hover:bg-secondary/70"
            >
              الصفحة العامة
            </a>
          </div>

          {company.cards.length === 0 && <p className="text-xs text-muted-foreground">لا توجد بطاقات.</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {company.cards.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border/60 p-3">
                <CardPreview
                  card={{
                    name: c.name,
                    slug: c.slug,
                    title: c.title,
                    company: c.company,
                    bio: c.bio,
                    phone: c.phone,
                    whatsapp: c.whatsapp,
                    email: c.email,
                    website: c.website,
                    address: c.address,
                    avatar_url: c.avatar_url,
                    accent_color: c.accent_color || "#C9A227",
                    template: c.template,
                    design: c.design,
                    socials: c.socials,
                  }}
                  size="sm"
                />
                <div className="mt-3 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {[c.title, c.card_type === "company" ? "بطاقة الشركة" : "بطاقة موظف"].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Eye className="h-3 w-3" /> {c.view_count}
                  </span>
                  <a
                    href={`/${lang}/studio/${c.id}`}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                    aria-label="تعديل التصميم"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`/c/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                    aria-label="فتح البطاقة"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
