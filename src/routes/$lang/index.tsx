import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CardPreview } from "@/components/CardPreview";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight, QrCode, ScanLine, Sparkles, Radio, BarChart3,
  Smartphone, Star, Check, ChevronDown, Zap, Layers, Globe2,
} from "lucide-react";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { supabase } from "@/integrations/supabase/client";

function useIsAuthed() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setAuthed(!!data.session); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  return authed;
}


import { SUPPORTED_LOCALES, SITE_ORIGIN, isSupportedLocale, DEFAULT_LOCALE, LOCALE_META } from "@/i18n/config";
import { getLandingSeo } from "@/i18n/landing-seo";
import { getLandingCopy, type LandingCopy } from "@/i18n/landing";
import { SeoSections, seoFaqItems } from "@/components/landing/SeoSections";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}`;
    const seo = getLandingSeo(lang);
    const isEn = lang === "en";
    const scripts = isEn
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Cardix",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web, iOS, Android",
              description: seo.description,
              url,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1284" },
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Cardix",
              url: SITE_ORIGIN,
              logo: `${SITE_ORIGIN}/favicon.ico`,
              sameAs: [],
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: seoFaqItems.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: url },
              ],
            }),
          },
        ]
      : undefined;
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: LOCALE_META[lang].ogLocale },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo.title },
        { name: "twitter:description", content: seo.description },
      ],
      links: [
        { rel: "canonical", href: url },
        ...SUPPORTED_LOCALES.map((l) => ({
          rel: "alternate",
          hrefLang: l,
          href: `${SITE_ORIGIN}/${l}`,
        })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en` },
      ],
      scripts,
    };
  },
  component: Landing,
});



const demoCards = [
  { name: "Layla Al-Farsi", title: "Design Director", company: "Atelier Nord", accent_color: "#7c34ff", template: "luxury" },
  { name: "Kenji Ito", title: "Founder", company: "Kōgei", accent_color: "#22D3EE", template: "aurora" },
  { name: "Maya Chen", title: "Investor", company: "Northline", accent_color: "#9C7A3C", template: "ivory" },
  { name: "Noor Rahman", title: "Product Lead", company: "Meridian", accent_color: "#E5E7EB", template: "platinum" },
  { name: "Adrián Vega", title: "CTO", company: "Halo Labs", accent_color: "#A855F7", template: "neon" },
  { name: "Sara Kim", title: "Partner", company: "Kōan", accent_color: "#111111", template: "noir" },
];

function Landing() {
  const { t, lang } = useI18n();
  const c = getLandingCopy(lang);
  const authed = useIsAuthed();


  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <BackgroundFx />
      <Nav t={t} c={c} authed={authed} />
      <Hero t={t} c={c} authed={authed} />
      <TrustStrip c={c} />
      <Templates c={c} />
      <HowItWorks c={c} />
      <Features c={c} />
      {lang === "en" ? <SeoSections authed={authed} /> : null}
      <Testimonials c={c} />
      <Pricing t={t} c={c} authed={authed} />
      <Faq c={c} />
      <FinalCta t={t} c={c} authed={authed} />
      <Footer t={t} c={c} />
    </div>
  );
}

/* ---------------- Background ---------------- */
function BackgroundFx() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
      {/* mesh glow */}
      <div className="absolute inset-0 opacity-80" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      {/* orbs */}
      <div className="absolute -left-40 top-[15%] h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
           style={{ background: "radial-gradient(circle, oklch(0.82 0.14 85 / 0.35), transparent 60%)" }} />
      <div className="absolute -right-40 top-[50%] h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
           style={{ background: "radial-gradient(circle, oklch(0.55 0.15 260 / 0.4), transparent 60%)" }} />
      {/* noise */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
           style={{
             backgroundImage:
               'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
           }} />
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav({ t, c, authed }: { t: ReturnType<typeof useI18n>["t"]; c: LandingCopy; authed: boolean | null }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={"safe-top sticky top-0 z-40 w-full transition-all " + (scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border/60" : "")}>
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoAsset.url} alt="" className="h-9 w-9 object-contain" />
          <span className="text-base font-semibold tracking-tight">{t.brand}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">{c.navFeatures}</a>
          <a href="#templates" className="hover:text-foreground transition">{c.navTemplates}</a>
          <a href="#pricing" className="hover:text-foreground transition">{c.navPricing}</a>
          <a href="#faq" className="hover:text-foreground transition">{c.navFaq}</a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle compact />
            <LocaleSwitcher compact />
          </div>
          {authed === false ? (
            <Link to="/auth" className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2">{t.signIn}</Link>
          ) : null}
          <Link
            to={authed === false ? "/auth" : "/dashboard"}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
            style={{ background: "var(--gradient-gold)" }}
          >
            {c.openApp}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ t, c, authed }: { t: ReturnType<typeof useI18n>["t"]; c: LandingCopy; authed: boolean | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMx(((e.clientX - r.left) / r.width - 0.5) * 2);
    setMy(((e.clientY - r.top) / r.height - 0.5) * 2);
  }

  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-14 px-5 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:py-24">
        {/* LEFT */}
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            {c.heroPill}
          </span>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[76px] lg:leading-[0.98]">
            {t.tagline.split(".")[0]}.
            <br />
            <span className="text-gradient-gold">{t.tagline.split(".")[1]?.trim() || t.brand}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t.subtagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={authed === false ? "/auth" : "/dashboard"}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
              style={{ background: "var(--gradient-gold)" }}>
              {t.getStarted}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <a href="#templates" className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium hover:bg-card">
              <Sparkles className="h-4 w-4" /> {c.navTemplates}
            </a>
          </div>

          {/* Feature strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-lg sm:grid-cols-4">
            {[
              { icon: QrCode, label: "QR" },
              { icon: Radio, label: "NFC" },
              { icon: ScanLine, label: "AI scan" },
              { icon: BarChart3, label: "Analytics" },
            ].map((f) => (
              <div key={f.label} className="glass flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs">
                <f.icon className="h-4 w-4 text-accent" /> {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — card stage */}
        <div
          ref={wrapRef}
          onMouseMove={onMove}
          onMouseLeave={() => { setMx(0); setMy(0); }}
          className="relative mx-auto flex h-[520px] w-full max-w-[560px] items-center justify-center [perspective:1400px] lg:h-[600px]"
        >
          {/* glow behind */}
          <div className="absolute inset-8 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.82 0.14 85 / 0.35), transparent 60%)" }} />

          {/* back cards */}
          <div
            className="absolute transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${-140 - mx * 20}px, ${-40 + my * 10}px, 0) rotate(-14deg)`, opacity: 0.55, filter: "blur(1px)" }}
          >
            <CardPreview card={demoCards[1]} size="md" />
          </div>
          <div
            className="absolute transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${130 - mx * 20}px, ${50 + my * 10}px, 0) rotate(12deg)`, opacity: 0.65, filter: "blur(0.5px)" }}
          >
            <CardPreview card={demoCards[2]} size="md" />
          </div>

          {/* main card */}
          <div
            className="relative float-slow"
            style={{
              transform: `rotateY(${mx * 6}deg) rotateX(${-my * 4}deg) translateZ(20px)`,
              transformStyle: "preserve-3d",
              transition: "transform 200ms ease-out",
            }}
          >
            <CardPreview card={demoCards[0]} size="lg" />
          </div>

          {/* Floating QR */}
          <div
            className="absolute bottom-2 rtl:right-2 ltr:right-2 lg:bottom-6 lg:rtl:right-6 lg:ltr:right-6 z-20"
            style={{ transform: `translate3d(${mx * -14}px, ${my * -14}px, 0)`, transition: "transform 200ms ease-out" }}
          >
            <div className="glass flex items-center gap-3 rounded-2xl p-3 shadow-luxe">
              <div className="grid place-items-center rounded-xl bg-white p-2">
                <QRCodeSVG value="https://cardix.app" size={70} fgColor="#0a0a0a" bgColor="#ffffff" level="M" />
              </div>
              <div className="pr-1">
                <p className="text-[11px] font-semibold">{c.liveCard}</p>
                <p className="text-[10px] text-muted-foreground">{c.tapToOpen}</p>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div
            className="absolute top-4 rtl:left-4 ltr:left-4 z-20"
            style={{ transform: `translate3d(${mx * 14}px, ${my * 14}px, 0)`, transition: "transform 200ms ease-out" }}
          >
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 shadow-soft">
              <Radio className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] font-medium">{t.nfcReady}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trust strip ---------------- */
function TrustStrip({ c }: { c: LandingCopy }) {
  const names = ["Atelier Nord", "Kōgei", "Northline", "Meridian", "Halo Labs", "Kōan"];
  return (
    <section className="border-y border-border/60 bg-background/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 px-5 py-8 lg:flex-row lg:justify-between lg:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.trustedBy}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground/80">
          {names.map((n) => (
            <span key={n} className="font-medium tracking-tight">{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Templates ---------------- */
function Templates({ c }: { c: LandingCopy }) {
  const { t } = useI18n();
  return (
    <section id="templates" className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 lg:px-10">
        <SectionHeader eyebrow={t.eyebrowTemplates} title={c.templatesTitle} desc={c.templatesDesc} />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demoCards.map((card, i) => (
            <div key={i} className="group relative rounded-3xl border border-border bg-card/40 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-luxe">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.template}</span>
                <span className="h-2 w-2 rounded-full" style={{ background: card.accent_color }} />
              </div>
              <div className="flex justify-center transition group-hover:scale-[1.02]">
                <CardPreview card={card} size="md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks({ c }: { c: LandingCopy }) {
  const { t } = useI18n();
  const steps = [
    { n: "01", icon: Sparkles, title: c.step1, d: c.step1d },
    { n: "02", icon: QrCode, title: c.step2, d: c.step2d },
    { n: "03", icon: BarChart3, title: c.step3, d: c.step3d },
  ];
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 lg:px-10">
        <SectionHeader eyebrow={t.eyebrowHowItWorks} title={c.howTitle} />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass relative overflow-hidden rounded-3xl p-8">
              <div className="text-[80px] font-semibold leading-none tracking-tighter text-foreground/5">{s.n}</div>
              <div className="mt-[-40px] flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Features (bento) ---------------- */
function Features({ c }: { c: LandingCopy }) {
  const { t } = useI18n();
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 lg:px-10">
        <SectionHeader eyebrow={t.eyebrowFeatures} title={c.featTitle} />

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6 lg:auto-rows-[220px]">
          {/* Big — Share */}
          <FeatureCard className="md:col-span-4 md:row-span-2" icon={QrCode} title={c.featShare} desc={c.featShareD}>
            <div className="pointer-events-none absolute -bottom-8 rtl:-left-8 ltr:-right-8 opacity-90">
              <div className="grid place-items-center rounded-3xl bg-white p-4 shadow-luxe">
                <QRCodeSVG value="https://cardix.app" size={140} fgColor="#0a0a0a" bgColor="#ffffff" level="M" />
              </div>
            </div>
          </FeatureCard>

          {/* Scanner */}
          <FeatureCard className="md:col-span-2" icon={ScanLine} title={c.featScan} desc={c.featScanD} />

          {/* NFC */}
          <FeatureCard className="md:col-span-2" icon={Radio} title={c.featNfc} desc={c.featNfcD} />

          {/* Analytics */}
          <FeatureCard className="md:col-span-4" icon={BarChart3} title={c.featAnalytics} desc={c.featAnalyticsD}>
            <div className="pointer-events-none absolute inset-x-6 bottom-4 flex h-16 items-end gap-1 opacity-90">
              {Array.from({ length: 30 }).map((_, i) => {
                const h = 20 + Math.round(Math.abs(Math.sin(i * 0.7)) * 70 + (i % 5) * 4);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${h}%`, background: "var(--gradient-gold)", opacity: 0.35 + (i / 30) * 0.5 }}
                  />
                );
              })}
            </div>
          </FeatureCard>

          {/* i18n */}
          <FeatureCard className="md:col-span-3" icon={Globe2} title={c.featI18n} desc={c.featI18nD} />
          {/* Cloud */}
          <FeatureCard className="md:col-span-3" icon={Smartphone} title={c.featCloud} desc={c.featCloudD} />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon, title, desc, className = "", children,
}: {
  icon: typeof Zap; title: string; desc: string; className?: string; children?: React.ReactNode;
}) {
  return (
    <div className={"glass relative overflow-hidden rounded-3xl p-6 lg:p-8 " + className}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">{desc}</p>
      {children}
    </div>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials({ c }: { c: LandingCopy }) {
  const { t: dict } = useI18n();
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 lg:px-10">
        <SectionHeader eyebrow={dict.eyebrowTestimonials} title={c.testimonialsTitle} />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {c.testimonials.map((t) => (
            <figure key={t.name} className="glass flex h-full flex-col justify-between rounded-3xl p-7">
              <div className="flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-foreground/90">"{t.body}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
                  {t.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
function Pricing({ t, c, authed }: { t: ReturnType<typeof useI18n>["t"]; c: LandingCopy; authed: boolean | null }) {
  const plans = [
    { name: c.free, price: "0", feats: ["1 card", "QR sharing", "Basic analytics"], cta: c.getStartedFree, primary: false },
    { name: c.pro, price: "9", feats: ["Unlimited cards", "AI scanner", "NFC + custom slug", "30-day analytics"], cta: c.tryPro, primary: true },
    { name: c.team, price: "29", feats: ["Everything in Pro", "Team roles", "Custom domain", "Priority support"], cta: t.getStarted, primary: false },
  ];
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
        <SectionHeader eyebrow={t.eyebrowPricing} title={c.pricingTitle} desc={c.pricingDesc} />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                "relative flex flex-col rounded-3xl p-8 " +
                (p.primary
                  ? "border-2 border-accent bg-card/80 shadow-luxe"
                  : "glass")
              }
            >
              {p.primary && (
                <span className="absolute -top-3 rtl:right-6 ltr:left-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
                  {t.mostPopular}
                </span>
              )}
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{p.name}</p>
              <p className="mt-4 text-5xl font-semibold tracking-tight">
                ${p.price}<span className="text-base font-normal text-muted-foreground">{c.perMonth}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to={authed === false ? "/auth" : "/dashboard"}
                className={
                  "mt-8 inline-flex items-center justify-center rounded-full py-3 text-sm font-semibold transition active:scale-[0.98] " +
                  (p.primary
                    ? "text-accent-foreground shadow-glow"
                    : "border border-border bg-card hover:bg-secondary")
                }
                style={p.primary ? { background: "var(--gradient-gold)" } : undefined}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function Faq({ c }: { c: LandingCopy }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[900px] px-5 lg:px-10">
        <SectionHeader eyebrow="FAQ" title={c.faqTitle} />
        <div className="mt-12 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur">
          {c.faqs.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="block w-full px-6 py-5 text-start transition hover:bg-card"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium">{f.q}</span>
                <ChevronDown className={"h-4 w-4 shrink-0 text-muted-foreground transition " + (open === i ? "rotate-180" : "")} />
              </div>
              <div
                className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
              >
                <div className="min-h-0">
                  <p className="pt-3 text-sm text-muted-foreground">{f.a}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCta({ t, c, authed }: { t: ReturnType<typeof useI18n>["t"]; c: LandingCopy; authed: boolean | null }) {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/60 p-10 backdrop-blur lg:p-20">
          <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "var(--gradient-mesh)" }} />
          <div className="pointer-events-none absolute -inset-40 rounded-full opacity-40 blur-3xl"
               style={{ background: "radial-gradient(circle, oklch(0.82 0.14 85 / 0.4), transparent 60%)" }} />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight lg:text-6xl">
                <span className="text-gradient-gold">{c.ctaTitle}</span>
              </h2>
              <p className="mt-4 max-w-lg text-base text-muted-foreground lg:text-lg">{c.ctaDesc}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={authed === false ? "/auth" : "/dashboard"} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow"
                  style={{ background: "var(--gradient-gold)" }}>
                  {t.getStarted}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <a href="#templates" className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium">
                  <Layers className="h-4 w-4" /> {c.navTemplates}
                </a>
              </div>
            </div>
            <div className="relative hidden lg:flex justify-center">
              <div className="absolute inset-0 rounded-full opacity-70 blur-3xl"
                   style={{ background: "radial-gradient(circle, oklch(0.82 0.14 85 / 0.3), transparent 60%)" }} />
              <div className="relative float-slow">
                <CardPreview card={demoCards[0]} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ t, c }: { t: ReturnType<typeof useI18n>["t"]; c: LandingCopy }) {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-5 px-5 py-10 lg:flex-row lg:px-10">
        <div className="flex items-center gap-2.5">
          <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold">{t.brand}</span>
          <span className="text-xs text-muted-foreground">· {c.footerTag}</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <LocaleSwitcher compact />
          <span className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} {t.brand}</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Bits ---------------- */
function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">{title}</h2>
      {desc && <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground lg:text-base">{desc}</p>}
    </div>
  );
}
