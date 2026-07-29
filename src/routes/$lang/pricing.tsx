import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyBilling, startSubscription } from "@/lib/billing.functions";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { GetStartedCards } from "@/components/marketing/GetStartedCards";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/$lang/pricing")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/pricing`;
    const isAr = lang === "ar";
    const title = tx("Cardixn Pricing — Start Free, Upgrade Anytime", lang);
    const description = tx("Simple Cardixn plans: Free for individuals, Pro for professionals, Teams for companies. No credit card to get started.", lang);
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: url },
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hrefLang: l, href: `${SITE_ORIGIN}/${l}/pricing` })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/pricing` },
      ],
    };
  },
  component: PricingPage,
});

type PlanRow = {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  audience: string;
  interval: string;
  price_cents: number;
  currency: string;
  features_en: string[];
  features_ar: string[];
  is_featured: boolean;
  sort_order: number;
};

const FREE = {
  en: { name: "Free", note: "for everyone, for now", tag: "All features unlocked",
    items: ["Unlimited digital cards", "QR code + share link", "All templates & Design Studio", "Company workspace & employee cards", "Contact vault & analytics"] },
  ar: { name: "مجاني", note: "للجميع حالياً", tag: "كل المزايا مفتوحة",
    items: ["بطاقات رقمية بلا حدود", "رمز QR ورابط مشاركة", "كل القوالب واستوديو التصميم", "مساحة الشركة وبطاقات الموظفين", "خزنة جهات الاتصال والتحليلات"] },
};

function priceLabel(cents: number, currency: string) {
  const v = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
  return currency === "USD" ? `$${v}` : `${v} ${currency}`;
}

function PricingPage() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const isAr = locale === "ar";
  const [audience, setAudience] = useState<"individual" | "company">("individual");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [busy, setBusy] = useState<string | null>(null);
  const start = useServerFn(startSubscription);
  const loadBilling = useServerFn(getMyBilling);

  const { data: billing } = useQuery({
    queryKey: ["my-billing-public"],
    queryFn: async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return null;
      return (await loadBilling({})) as any;
    },
  });
  const activePlanId: string | null = billing?.active?.plan_id ?? null;

  const { data: plans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("billing_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as PlanRow[];
    },
  });

  const shown = (plans ?? []).filter((p) => p.audience === audience && p.interval === interval);

  async function subscribe(plan: PlanRow) {
    setBusy(plan.id);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = `/${locale}/auth`;
        return;
      }
      const res = await start({ data: { planId: plan.id, origin: window.location.origin } });
      if (res.approveUrl) window.location.href = res.approveUrl;
      else toast.error(tx("Could not start checkout"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <MarketingLayout lang={locale}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 md:py-28 text-center">
          <span className="text-xs uppercase tracking-widest text-primary/80">Cardixn · {tx("Pricing")}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {tx("Simple, honest pricing")}
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
            {tx("Start free with no credit card. Upgrade only when you need more.")}
          </p>

          <div className="mt-8 flex justify-center">
            <p className="rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
              {tx("All plans are free until further notice 🎉")}
            </p>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-xl px-5 py-10 sm:px-6 md:py-16">
        <article className="relative rounded-3xl border border-border/60 bg-card/40 p-7 backdrop-blur transition-all hover:border-primary/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">{(isAr ? FREE.ar : FREE.en).tag}</p>
          <h2 className="mt-3 text-2xl font-bold">{(isAr ? FREE.ar : FREE.en).name}</h2>
          <p className="mt-4 flex items-end gap-1.5">
            <span className="text-4xl font-bold tracking-tight">{tx("$0")}</span>
            <span className="pb-1 text-sm text-muted-foreground">{(isAr ? FREE.ar : FREE.en).note}</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {(isAr ? FREE.ar : FREE.en).items.map((i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{i}</span>
              </li>
            ))}
          </ul>
          <Link to="/auth" className="mt-7 flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-card/60">
            {tx("Start free")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </article>

        {shown.map((plan) => (
          <article
            key={plan.id}
            className={
              "relative rounded-3xl border p-7 backdrop-blur transition-all " +
              (plan.is_featured
                ? "border-primary/60 bg-card/70 shadow-glow lg:scale-[1.03]"
                : "border-border/60 bg-card/40 hover:border-primary/40")
            }
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
              {plan.is_featured ? (tx("Most popular")) : audience === "company" ? (tx("For companies")) : tx("For individuals")}
            </p>
            <h2 className="mt-3 text-2xl font-bold">{isAr ? plan.name_ar : plan.name_en}</h2>
            <p className="mt-4 flex items-end gap-1.5">
              <span className="text-4xl font-bold tracking-tight">{priceLabel(plan.price_cents, plan.currency)}</span>
              <span className="pb-1 text-sm text-muted-foreground">
                {interval === "month" ? (tx("/ month")) : tx("/ year")}
              </span>
            </p>
            {(isAr ? plan.description_ar : plan.description_en) && (
              <p className="mt-2 text-sm text-muted-foreground">{isAr ? plan.description_ar : plan.description_en}</p>
            )}
            <ul className="mt-6 space-y-3 text-sm">
              {(isAr ? plan.features_ar : plan.features_en).map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{i}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe(plan)}
              disabled={busy === plan.id || activePlanId === plan.id}
              className={
                "mt-7 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60 " +
                (plan.is_featured ? "text-accent-foreground shadow-glow" : "border border-border hover:bg-card/60")
              }
              style={plan.is_featured ? { background: "var(--gradient-gold)" } : undefined}
            >
              {busy === plan.id ? <Loader2 className="size-4 animate-spin" /> : null}
              {activePlanId === plan.id
                ? tx("Your current plan")
                : tx("Subscribe with PayPal")}
              {activePlanId === plan.id ? null : <ArrowRight className="size-4 rtl:rotate-180" />}
            </button>
          </article>
        ))}
      </section>


      <section className="border-t border-border/40">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{tx("Common questions")}</h2>
          <div className="mt-8 space-y-6">
            {(isAr
              ? [["هل الخطة المجانية محدودة بوقت؟", "لا، المجانية مجانية للأبد وتشمل بطاقة واحدة برمز QR ورابط مشاركة."],
                 ["هل أحتاج بطاقة NFC؟", "لا. يمكنك المشاركة بالرابط أو رمز QR، وبطاقة NFC خيار إضافي فقط."],
                 ["هل يمكنني الإلغاء في أي وقت؟", "نعم، الإلغاء فوري وتحتفظ ببياناتك وبطاقاتك."]]
              : [["Is the free plan time-limited?", "No. Free is free forever and includes one card with a QR code and share link."],
                 ["Do I need an NFC card?", "No. You can share by link or QR — NFC is an optional extra."],
                 ["Can I cancel anytime?", "Yes. Cancellation is instant and you keep your data and cards."]]
            ).map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-border/60 bg-card/40 p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <GetStartedCards lang={locale} />
    </MarketingLayout>
  );
}
