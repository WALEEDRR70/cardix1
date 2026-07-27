import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, Leaf, Sparkles, ShieldCheck, Globe2 } from "lucide-react";

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/about`;
    const isAr = lang === "ar";
    const title = isAr ? "عن Cardixn — قصة بطاقة الأعمال الرقمية الفاخرة" : "About Cardixn — The Story Behind the Luxury Digital Card";
    const description = isAr
      ? "تعرّف على Cardixn: منصة بطاقات الأعمال الرقمية التي تستبدل الورق بمشاركة فورية بـ NFC وQR، بتصميم فاخر ودعم 20 لغة."
      : "Meet Cardixn: the digital business card platform replacing paper with instant NFC and QR sharing, luxury design and 20-language support.";
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
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hrefLang: l, href: `${SITE_ORIGIN}/${l}/about` })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/about` },
      ],
    };
  },
  component: AboutPage,
});

const VALUES = [
  { icon: Sparkles, en: ["Craft over clutter", "Every screen is designed like a premium product, not a form. If it isn't beautiful, it isn't shipped."], ar: ["الإتقان قبل الزحام", "كل شاشة مصممة كمنتج فاخر لا كنموذج بيانات. إن لم تكن جميلة فلن تُنشر."] },
  { icon: Leaf, en: ["Less paper, more signal", "One card replaces thousands of printed ones — and it's always current, never out of date in someone's drawer."], ar: ["ورق أقل، أثر أكبر", "بطاقة واحدة تغني عن آلاف المطبوعة — وتبقى محدثة دائماً بدل أن تُنسى في درج."] },
  { icon: Globe2, en: ["Global from day one", "Arabic RTL and 19 other languages are first-class, each with its own indexed URL — not an afterthought."], ar: ["عالمية من اليوم الأول", "العربية بنظام RTL و19 لغة أخرى مدعومة بالكامل، ولكل لغة رابط مفهرس خاص بها."] },
  { icon: ShieldCheck, en: ["Your data is yours", "Row-level security by default. You decide what's published, and nothing else leaves your account."], ar: ["بياناتك ملكك", "حماية على مستوى الصف افتراضياً. أنت تقرر ما يُنشر، ولا شيء آخر يغادر حسابك."] },
];

function AboutPage() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const isAr = locale === "ar";

  return (
    <MarketingLayout lang={locale}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-28">
          <span className="text-xs uppercase tracking-widest text-primary/80">Cardixn · {isAr ? "من نحن" : "About"}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {isAr ? "نبني بديلاً فاخراً للبطاقة الورقية" : "We're building the luxury end of paper cards"}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            {isAr
              ? "Cardixn منصة بطاقات أعمال رقمية فقط — لا شبكة اجتماعية ولا CRM. هدف واحد: أن تُقدَّم بأفضل صورة في ثوانٍ."
              : "Cardixn does one thing: digital business cards. No social network, no CRM — just the fastest, most elegant way to introduce yourself."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          {isAr
            ? "بدأت الفكرة من موقف بسيط ومتكرر: تنتهي بطاقاتك المطبوعة في أسوأ لحظة، أو تتغير وظيفتك ورقمك فتصبح كل النسخ التي وزّعتها خاطئة. البطاقة الورقية جميلة لكنها ثابتة، بينما هويتك المهنية تتغير باستمرار."
            : "Cardixn started from a familiar moment: you run out of printed cards at exactly the wrong time, or you change roles and every card you ever handed out becomes wrong. Paper is beautiful but frozen; your professional identity is not."}
        </p>
        <p>
          {isAr
            ? "لذلك بنينا بطاقة تعيش على الإنترنت وتُشارك بلمسة NFC أو مسح QR أو رابط بسيط، وتُحدَّث لحظياً لدى كل من حفظها. أضفنا ماسحاً ذكياً يقرأ البطاقات الورقية التي تستلمها ويحوّلها إلى جهات اتصال منظمة، وتحليلات تخبرك بما ينجح فعلاً."
            : "So we built a card that lives online, shares by NFC tap, QR scan or a plain link, and updates instantly for everyone who saved it. Then we added an AI scanner that turns the paper cards you receive into clean contacts, and analytics that show what actually works."}
        </p>
        <p>
          {isAr
            ? "التصميم ليس تفصيلاً ثانوياً عندنا. البطاقة هي أول انطباع، لذا كل قالب وكل تدرج لوني وكل حركة صُممت لتبدو كمنتج فاخر على الجوال قبل أي شيء آخر."
            : "Design isn't a detail here. Your card is a first impression, so every template, gradient and micro-interaction is tuned to feel like a premium product — on mobile first."}
        </p>
      </section>

      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16 grid gap-6 md:grid-cols-2">
          {VALUES.map((v) => {
            const [h, p] = isAr ? v.ar : v.en;
            const Icon = v.icon;
            return (
              <article key={h} className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-6">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{h}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{isAr ? "انضم إلينا" : "Come build with us"}</h2>
          <p className="mt-3 text-muted-foreground">
            {isAr ? "أنشئ بطاقتك الرقمية اليوم، أو راسلنا برأيك — نقرأ كل رسالة." : "Create your digital card today, or tell us what to build next — we read everything."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
              {isAr ? "ابدأ مجاناً" : "Start free"} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-card/60 transition">
              {isAr ? "تواصل معنا" : "Contact us"}
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
