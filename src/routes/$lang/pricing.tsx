import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/$lang/pricing")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/pricing`;
    const isAr = lang === "ar";
    const title = isAr ? "أسعار Cardixn — ابدأ مجاناً وطوّر متى شئت" : "Cardixn Pricing — Start Free, Upgrade Anytime";
    const description = isAr
      ? "خطط Cardixn البسيطة: مجانية للأفراد، Pro للمحترفين، وخطة الفرق. بدون بطاقة ائتمان للبدء."
      : "Simple Cardixn plans: Free for individuals, Pro for professionals, Teams for companies. No credit card to get started.";
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

const PLANS = [
  {
    id: "free",
    en: { name: "Free", price: "$0", note: "forever", tag: "For getting started",
      items: ["1 digital card", "QR code + share link", "Core templates", "Contact vault (25 cards)", "Basic view analytics"] },
    ar: { name: "مجاني", price: "0$", note: "للأبد", tag: "للبداية",
      items: ["بطاقة رقمية واحدة", "رمز QR ورابط مشاركة", "القوالب الأساسية", "خزنة جهات اتصال (25 بطاقة)", "تحليلات مشاهدات أساسية"] },
  },
  {
    id: "pro", featured: true,
    en: { name: "Pro", price: "$6", note: "/ month", tag: "Most popular",
      items: ["Unlimited cards", "All 19 luxury templates", "NFC writing + poster export", "AI bio writing & AI card scanning", "Unlimited contact vault + notes", "Full 30-day analytics", "Custom accent colors"] },
    ar: { name: "برو", price: "6$", note: "/ شهرياً", tag: "الأكثر طلباً",
      items: ["بطاقات غير محدودة", "كل القوالب الـ19 الفاخرة", "كتابة NFC وتصدير البوستر", "نبذة بالذكاء الاصطناعي ومسح البطاقات", "خزنة غير محدودة مع ملاحظات", "تحليلات كاملة لـ30 يوماً", "ألوان مخصصة للبطاقة"] },
  },
  {
    id: "teams",
    en: { name: "Teams", price: "$4", note: "/ user / month", tag: "For companies",
      items: ["Everything in Pro", "Shared brand templates", "Team card directory", "Centralized billing", "Priority support"] },
    ar: { name: "الفرق", price: "4$", note: "/ مستخدم / شهرياً", tag: "للشركات",
      items: ["كل مزايا برو", "قوالب موحّدة للعلامة التجارية", "دليل بطاقات الفريق", "فوترة مركزية", "دعم ذو أولوية"] },
  },
];

function PricingPage() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const isAr = locale === "ar";

  return (
    <MarketingLayout lang={locale}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
          <span className="text-xs uppercase tracking-widest text-primary/80">Cardixn · {isAr ? "الأسعار" : "Pricing"}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {isAr ? "تسعير بسيط وواضح" : "Simple, honest pricing"}
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
            {isAr ? "ابدأ مجاناً بدون بطاقة ائتمان. طوّر عندما تحتاج مزايا أكثر فقط." : "Start free with no credit card. Upgrade only when you need more."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const c = isAr ? plan.ar : plan.en;
          return (
            <article
              key={plan.id}
              className={
                "relative rounded-3xl border p-7 backdrop-blur transition-all " +
                (plan.featured
                  ? "border-primary/60 bg-card/70 shadow-glow lg:scale-[1.03]"
                  : "border-border/60 bg-card/40 hover:border-primary/40")
              }
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">{c.tag}</p>
              <h2 className="mt-3 text-2xl font-bold">{c.name}</h2>
              <p className="mt-4 flex items-end gap-1.5">
                <span className="text-4xl font-bold tracking-tight">{c.price}</span>
                <span className="pb-1 text-sm text-muted-foreground">{c.note}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {c.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{i}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={
                  "mt-7 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition " +
                  (plan.featured ? "text-accent-foreground shadow-glow" : "border border-border hover:bg-card/60")
                }
                style={plan.featured ? { background: "var(--gradient-gold)" } : undefined}
              >
                {isAr ? "ابدأ الآن" : "Get started"} <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="border-t border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{isAr ? "أسئلة شائعة" : "Common questions"}</h2>
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
    </MarketingLayout>
  );
}
