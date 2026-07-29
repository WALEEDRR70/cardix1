import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { GetStartedCards } from "@/components/marketing/GetStartedCards";
import {
  ArrowRight, Nfc, QrCode, ScanLine, Sparkles, BarChart3, Palette,
  Globe2, ShieldCheck, Contact, Cloud, Smartphone, Share2,
} from "lucide-react";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/$lang/features")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/features`;
    const isAr = lang === "ar";
    const title = tx("Cardixn Features — NFC, QR & AI Scanning for Digital Business Cards");
    const description = tx("Explore every Cardixn feature: NFC, QR and link sharing, AI card scanning, live analytics, luxury templates, contact vault and cloud sync.");
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
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hrefLang: l, href: `${SITE_ORIGIN}/${l}/features` })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/features` },
      ],
    };
  },
  component: FeaturesPage,
});

const FEATURES = [
  { icon: Nfc, en: ["Tap to share (NFC)", "Write your card to any NFC tag or card and share your full profile with a single tap — no app needed on their phone."], ar: ["مشاركة باللمس (NFC)", "اكتب بطاقتك على أي بطاقة أو ملصق NFC وشارك ملفك كاملاً بلمسة واحدة — بدون تطبيق على جهاز الطرف الآخر."] },
  { icon: QrCode, en: ["Dynamic QR code", "Every card gets a high-resolution QR you can download and print. Update your details anytime — the QR never changes."], ar: ["رمز QR ديناميكي", "لكل بطاقة رمز QR عالي الدقة قابل للتحميل والطباعة. حدّث بياناتك في أي وقت — والرمز يبقى كما هو."] },
  { icon: ScanLine, en: ["AI paper-card scanner", "Snap a photo of any paper business card. Our AI reads the name, title, phone, email and website, then files it in your vault."], ar: ["ماسح البطاقات الورقية بالذكاء الاصطناعي", "صوّر أي بطاقة ورقية وسيقرأ الذكاء الاصطناعي الاسم والمسمى والهاتف والبريد والموقع ويحفظها في خزنتك."] },
  { icon: Contact, en: ["Live contact vault", "Saved cards stay in sync. When someone updates their details, your copy updates automatically — no rescanning."], ar: ["خزنة جهات اتصال حيّة", "البطاقات المحفوظة تبقى محدثة. عند تغيير صاحبها لبياناته تُحدَّث نسختك تلقائياً — بدون إعادة مسح."] },
  { icon: BarChart3, en: ["Analytics that matter", "See views, taps and saves over the last 30 days so you know which cards and channels actually convert."], ar: ["تحليلات مفيدة", "شاهد المشاهدات والنقرات والحفظ خلال آخر 30 يوماً لتعرف أي بطاقة وأي قناة تحقق نتائج فعلية."] },
  { icon: Palette, en: ["19 luxury templates", "Premium layouts with glassmorphism, gradients and a custom accent color picker that themes the whole card page."], ar: ["19 قالباً فاخراً", "تصاميم مميزة بزجاجية وتدرجات لونية ومنتقي لون مخصص يلوّن صفحة البطاقة بالكامل."] },
  { icon: Sparkles, en: ["AI bio writing", "Generate a polished, professional bio in your language in one click — then refine it to sound exactly like you."], ar: ["كتابة نبذة بالذكاء الاصطناعي", "أنشئ نبذة احترافية أنيقة بلغتك بنقرة واحدة، ثم عدّلها لتناسب أسلوبك تماماً."] },
  { icon: Share2, en: ["Social profiles built in", "Add 30+ platforms — WhatsApp, Instagram, LinkedIn, TikTok, Snapchat and more — with brand-accurate icons and handles."], ar: ["حسابات التواصل مدمجة", "أضف أكثر من 30 منصة — واتساب، إنستقرام، لينكدإن، تيك توك، سناب شات وغيرها — بأيقونات أصلية ومعرفات ظاهرة."] },
  { icon: Smartphone, en: ["Downloadable poster", "Export your card as a 1080×1920 portrait image, ready for stories, WhatsApp status and print."], ar: ["بوستر قابل للتحميل", "صدّر بطاقتك كصورة طولية 1080×1920 جاهزة للستوري وحالة واتساب والطباعة."] },
  { icon: Globe2, en: ["20 languages, RTL ready", "Full Arabic RTL and 19 more languages, each on its own SEO-friendly URL with hreflang tags."], ar: ["20 لغة مع دعم RTL", "دعم كامل للعربية من اليمين لليسار و19 لغة أخرى، لكل منها رابط منفصل مهيأ لمحركات البحث."] },
  { icon: Cloud, en: ["Cloud sync", "Everything lives in the cloud and syncs instantly across every device you sign in from."], ar: ["مزامنة سحابية", "كل شيء محفوظ في السحابة ويتزامن فوراً عبر كل أجهزتك."] },
  { icon: ShieldCheck, en: ["Private by design", "Row-level security means only you can read and edit your cards and vault. Published cards show exactly what you choose."], ar: ["خصوصية بالتصميم", "حماية على مستوى الصف تعني أنك وحدك من يقرأ ويعدّل بطاقاتك وخزنتك، والمنشور يعرض ما تختاره فقط."] },
];

function FeaturesPage() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const isAr = locale === "ar";

  return (
    <MarketingLayout lang={locale}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 md:py-28">
          <span className="text-xs uppercase tracking-widest text-primary/80">Cardixn · {tx("Features")}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {tx("Everything your digital card should do")}
          </h1>
          <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">
            {tx("Share with a tap, a scan or a link, capture paper cards with AI, and keep every contact automatically up to date.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
              {tx("Start free")} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-card/60 transition">
              {tx("See pricing")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const [h, p] = isAr ? f.ar : f.en;
          const Icon = f.icon;
          return (
            <article key={h} className="group rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-6 hover:border-primary/50 hover:bg-card/60 transition-all">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold group-hover:text-primary transition-colors">{h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
            </article>
          );
        })}
      </section>

      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {tx("Ready to build your card?")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {tx("Create your first card in under two minutes — free.")}
          </p>
          <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
            {tx("Create my card")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
      <GetStartedCards lang={locale} />
    </MarketingLayout>
  );
}
