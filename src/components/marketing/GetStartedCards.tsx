import { ArrowRight, LayoutTemplate, ScanLine, Sparkles, QrCode, Building2, BarChart3 } from "lucide-react";
import { Link } from "@/lib/nav";
import type { Locale } from "@/i18n/config";
import { txDict } from "@/lib/tx";

type Step = {
  icon: typeof Sparkles;
  step: string;
  title: string;
  desc: string;
  to: string;
  cta: string;
};

const COPY = {
  en: {
    eyebrow: "Get started",
    heading: "Your digital card in three steps",
    sub: "Free to start — no credit card, no app download.",
    steps: [
      { icon: LayoutTemplate, step: "01", title: "Pick a template", desc: "Browse premium designs and recolor any of them to match your brand in one tap.", to: "/templates", cta: "Browse templates" },
      { icon: Sparkles, step: "02", title: "Make it yours", desc: "Add your details, logo and links — or let AI write your bio and polish the layout.", to: "/auth", cta: "Create my card" },
      { icon: QrCode, step: "03", title: "Share anywhere", desc: "One link, a QR code or an NFC tap. Works on every phone, no app required.", to: "/features", cta: "See how sharing works" },
    ] satisfies Step[],
    extras: [
      { icon: ScanLine, title: "Scan paper cards", desc: "Turn any paper card into a saved contact with the AI scanner.", to: "/tools" },
      { icon: Building2, title: "Company workspace", desc: "Branded cards for every employee, managed from one dashboard.", to: "/features" },
      { icon: BarChart3, title: "Know what works", desc: "Live analytics on views, taps and saved contacts.", to: "/features" },
    ],
    primary: "Start free",
    secondary: "Explore templates",
  },
  ar: {
    eyebrow: "ابدأ الآن",
    heading: "بطاقتك الرقمية في ثلاث خطوات",
    sub: "البداية مجانية — بدون بطاقة ائتمان وبدون تحميل تطبيق.",
    steps: [
      { icon: LayoutTemplate, step: "٠١", title: "اختر قالباً", desc: "تصفّح تصاميم فاخرة وغيّر ألوانها لتناسب هويتك بضغطة واحدة.", to: "/templates", cta: "تصفّح القوالب" },
      { icon: Sparkles, step: "٠٢", title: "خصّصها لك", desc: "أضف بياناتك وشعارك وروابطك — أو دع الذكاء الاصطناعي يكتب نبذتك ويحسّن التصميم.", to: "/auth", cta: "أنشئ بطاقتي" },
      { icon: QrCode, step: "٠٣", title: "شاركها أينما كنت", desc: "رابط واحد أو رمز QR أو لمسة NFC. تعمل على كل الهواتف بدون تطبيق.", to: "/features", cta: "طرق المشاركة" },
    ] satisfies Step[],
    extras: [
      { icon: ScanLine, title: "امسح البطاقات الورقية", desc: "حوّل أي بطاقة ورقية إلى جهة اتصال محفوظة عبر الماسح الذكي.", to: "/tools" },
      { icon: Building2, title: "مساحة الشركات", desc: "بطاقات موحّدة الهوية لكل موظف تُدار من لوحة واحدة.", to: "/features" },
      { icon: BarChart3, title: "اعرف ما ينجح", desc: "تحليلات لحظية للمشاهدات واللمسات وجهات الاتصال المحفوظة.", to: "/features" },
    ],
    primary: "ابدأ مجاناً",
    secondary: "استعرض القوالب",
  },
};

/** Encouragement block: 3 numbered "get started" cards + 3 capability cards + CTA. */
export function GetStartedCards({ lang, className = "" }: { lang: Locale; className?: string }) {
  const t = txDict(COPY.en, COPY.ar);

  return (
    <section className={"border-t border-border/40 bg-muted/10 " + className}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">{t.eyebrow}</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">{t.heading}</h2>
          <p className="mt-3 text-muted-foreground">{t.sub}</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.steps.map((s) => (
            <Link
              key={s.step}
              to={s.to}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
            >
              <span className="absolute end-5 top-5 text-4xl font-black leading-none text-primary/10 transition-colors group-hover:text-primary/25">
                {s.step}
              </span>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {s.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {t.extras.map((e) => (
            <Link
              key={e.title}
              to={e.to}
              className="group flex items-start gap-4 rounded-3xl border border-border/50 bg-card/30 p-6 transition-colors hover:border-primary/40 hover:bg-card/60"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground/80">
                <e.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-medium leading-snug transition-colors group-hover:text-primary">{e.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-gold)" }}
          >
            {t.primary} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-card/60"
          >
            {t.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
