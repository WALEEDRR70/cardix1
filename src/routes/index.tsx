import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CardPreview } from "@/components/CardPreview";
import { ArrowRight, QrCode, ScanLine, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardix — Premium digital business cards" },
      { name: "description", content: "Create beautiful, luxury digital business cards. Share with a tap, a scan, or a link." },
      { property: "og:title", content: "Cardix — Premium digital business cards" },
      { property: "og:description", content: "Create beautiful, luxury digital business cards. Share with a tap, a scan, or a link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();

  const features = [
    { icon: Sparkles, title: t.featureTemplates, desc: t.featureTemplatesDesc },
    { icon: QrCode, title: t.featureShare, desc: t.featureShareDesc },
    { icon: ScanLine, title: t.featureScan, desc: t.featureScanDesc },
  ];

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "var(--gradient-mesh)" }} />

      <header className="safe-top relative z-10 mx-auto flex w-full max-w-[520px] items-center justify-between px-5 pb-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>C</span>
          <span className="text-base font-semibold tracking-tight">{t.brand}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <LangToggle compact />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[520px] flex-col px-5 pt-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t.landingBadge}
        </div>

        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {t.tagline.split(".")[0]}
          <br />
          <span className="text-gradient-gold">{t.tagline.split(".")[1]?.trim() || t.brand}</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">{t.subtagline}</p>

        {/* Card stack */}
        <div className="relative mx-auto mt-10 h-[280px] w-full max-w-[380px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute -rotate-6 opacity-60 blur-[1px]">
              <CardPreview card={demoCards[1]} size="sm" />
            </div>
            <div className="absolute rotate-6 opacity-80 blur-[0.5px]">
              <CardPreview card={demoCards[2]} size="sm" />
            </div>
            <div className="relative float-slow">
              <CardPreview card={demoCards[0]} size="md" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/auth"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
            style={{ background: "var(--gradient-gold)" }}
          >
            {t.getStarted}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
          <Link
            to="/auth"
            className="glass inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium hover:bg-card"
          >
            {t.signIn}
          </Link>
        </div>

        <section className="mt-12 grid gap-3">
          {features.map((f) => (
            <div key={f.title} className="glass flex items-start gap-3 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-14 pb-10 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} {t.brand} · Crafted with intent.
        </footer>
      </main>
    </div>
  );
}

const demoCards = [
  { name: "Layla Al-Farsi", title: "Design Director", company: "Atelier Nord", accent_color: "#D4AF37", template: "luxury" },
  { name: "Kenji Ito", title: "Founder", company: "Kōgei", accent_color: "#22D3EE", template: "aurora" },
  { name: "Maya Chen", title: "Investor", company: "Northline", accent_color: "#9C7A3C", template: "ivory" },
];
