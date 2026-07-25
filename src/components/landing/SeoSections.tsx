import {
  QrCode, Radio, ScanLine, Sparkles, ShieldCheck, Lock, BarChart3, Smartphone,
  Globe2, Briefcase, Camera, Stethoscope, Scale, HardHat, Home,
  TrendingUp, Palette, Wrench, Layers, Check, X, Star, Clock, LeafyGreen,
  DollarSign, Building2, GraduationCap, Cpu, Wallet, Fingerprint, RefreshCw,
  Share2, Download, MousePointerClick, LineChart, Rocket, HeartHandshake,
  Sparkle, MapPin, Link as LinkIcon, ArrowRight, Zap,
} from "lucide-react";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { getSeoContent, type SeoContent } from "@/i18n/seo-content";

/* Long-form SEO sections. Content is fully data-driven per locale
   so every language renders the same rich, keyword-dense layout. */

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
        <Sparkle className="h-3 w-3 text-accent" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {sub ? <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{sub}</p> : null}
    </div>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">{children}</span>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"relative rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl transition hover:border-border " + className}>
      {children}
    </div>
  );
}

/* -------- Why Digital -------- */
function WhyDigital({ c }: { c: SeoContent }) {
  const icons = [LeafyGreen, RefreshCw, Zap, DollarSign];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.whyDigital.eyebrow}
          title={<>{c.whyDigital.title[0]}<Accent>{c.whyDigital.title[1]}</Accent></>}
          sub={c.whyDigital.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {c.whyDigital.items.map((it, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <GlassCard key={it.title}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{it.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
        <div className="mt-10 rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur-xl">
          <p className="text-base leading-relaxed text-muted-foreground">{c.whyDigital.closing}</p>
        </div>
      </div>
    </section>
  );
}

/* -------- Why Cardixn -------- */
function WhyCardixn({ c }: { c: SeoContent }) {
  const icons = [Sparkles, Palette, ShieldCheck, Globe2, BarChart3, Rocket];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.whyCardixn.eyebrow}
          title={<>{c.whyCardixn.title[0]}<Accent>{c.whyCardixn.title[1]}</Accent></>}
          sub={c.whyCardixn.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.whyCardixn.pillars.map((p, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <GlassCard key={p.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------- Feature Deep Dive -------- */
function FeatureBlock({ side, icon: Icon, eyebrow, title, body, bullets, illustration }: {
  side: "left" | "right";
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  illustration: React.ReactNode;
}) {
  const textFirst = side === "left";
  return (
    <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
      <div className={textFirst ? "" : "lg:order-2"}>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
          <Icon className="h-3.5 w-3.5 text-accent" />
          {eyebrow}
        </div>
        <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={textFirst ? "" : "lg:order-1"}>
        <div className="relative rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-40" style={{ background: "var(--gradient-mesh)" }} />
          <div className="relative">{illustration}</div>
        </div>
      </div>
    </div>
  );
}

function DeepFeatures({ c }: { c: SeoContent }) {
  const icons = [QrCode, Radio, ScanLine, Sparkles];
  const sides: ("left" | "right")[] = ["left", "right", "left", "right"];
  const illustrations = [
    (
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-inner">
          <div className="grid h-40 w-40 grid-cols-8 grid-rows-8 gap-[3px]">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.45 ? "#0a0a0a" : "transparent" }} />
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">cardix1.lovable.app/c/you</div>
      </div>
    ),
    (
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-accent/30 animate-ping" style={{ animationDelay: "300ms" }} />
          <div className="absolute inset-8 rounded-full border border-accent/20 animate-ping" style={{ animationDelay: "600ms" }} />
          <Radio className="h-14 w-14 text-accent" />
        </div>
      </div>
    ),
    (
      <div className="mx-auto flex h-52 w-full max-w-[280px] items-center justify-center rounded-2xl border border-border bg-background/40">
        <div className="relative h-40 w-56 rounded-lg border-2 border-dashed border-accent/60">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent shadow-[0_0_20px_var(--accent)] animate-pulse" />
          <ScanLine className="absolute right-3 top-3 h-4 w-4 text-accent" />
        </div>
      </div>
    ),
    (
      <div className="space-y-3">
        <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-accent/70 to-transparent" />
        <div className="h-3 w-full rounded-full bg-muted/60" />
        <div className="h-3 w-5/6 rounded-full bg-muted/60" />
        <div className="h-3 w-2/3 rounded-full bg-muted/60" />
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" /> Cardixn AI
        </div>
      </div>
    ),
  ];
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.deepFeatures.eyebrow}
          title={<>{c.deepFeatures.title[0]}<Accent>{c.deepFeatures.title[1]}</Accent></>}
        />
        {c.deepFeatures.blocks.map((b, i) => (
          <FeatureBlock
            key={b.title}
            side={sides[i]!}
            icon={icons[i] ?? Sparkles}
            eyebrow={b.eyebrow}
            title={b.title}
            body={b.body}
            bullets={b.bullets}
            illustration={illustrations[i]}
          />
        ))}
      </div>
    </section>
  );
}

/* -------- Comparison: Paper -------- */
function ComparisonPaper({ c }: { c: SeoContent }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.comparisonPaper.eyebrow}
          title={<>{c.comparisonPaper.title[0]}<Accent>{c.comparisonPaper.title[1]}</Accent></>}
          sub={c.comparisonPaper.sub}
        />
        <div className="mt-14 overflow-hidden rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl">
          <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr] border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <div className="p-5">{c.comparisonPaper.headers[0]}</div>
            <div className="flex items-center gap-2 border-l border-border/70 bg-gradient-to-b from-accent/10 to-transparent p-5 text-accent">
              <Sparkles className="h-4 w-4" /> {c.comparisonPaper.headers[1]}
            </div>
            <div className="border-l border-border/70 p-5">{c.comparisonPaper.headers[2]}</div>
          </div>
          {c.comparisonPaper.rows.map(([feat, cardix, paper], i) => (
            <div key={feat} className={"grid grid-cols-[1.2fr_1.4fr_1.4fr] border-b border-border/70 text-sm last:border-b-0 " + (i % 2 ? "bg-background/20" : "")}>
              <div className="p-5 font-medium">{feat}</div>
              <div className="flex items-start gap-2 border-l border-border/70 p-5 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> <span>{cardix}</span>
              </div>
              <div className="flex items-start gap-2 border-l border-border/70 p-5 text-muted-foreground">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" /> <span>{paper}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Comparison: Apps -------- */
function ComparisonApps({ c }: { c: SeoContent }) {
  const cols = c.comparisonApps.cols.map((col, i) => ({ ...col, accent: i === 0 }));
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.comparisonApps.eyebrow}
          title={<>{c.comparisonApps.title[0]}<Accent>{c.comparisonApps.title[1]}</Accent></>}
          sub={c.comparisonApps.sub}
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {cols.map((col) => (
            <div key={col.name} className={"relative rounded-3xl border p-6 backdrop-blur-xl " + (col.accent ? "border-accent/60 bg-gradient-to-b from-accent/10 to-card/60" : "border-border/70 bg-card/60")}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{col.name}</div>
                {col.accent ? <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">{c.comparisonApps.bestPick}</span> : null}
              </div>
              <ul className="mt-5 space-y-3">
                {col.rows.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm text-muted-foreground">
                    {col.accent ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />}
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Use Cases -------- */
function UseCases({ c }: { c: SeoContent }) {
  const icons = [Briefcase, TrendingUp, Palette, Camera, Stethoscope, Scale, HardHat, Home, Wrench, HeartHandshake];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.useCases.eyebrow}
          title={<>{c.useCases.title[0]}<Accent>{c.useCases.title[1]}</Accent></>}
          sub={c.useCases.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.useCases.cases.map((cs, i) => {
            const Icon = icons[i] ?? Briefcase;
            return (
              <GlassCard key={cs.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{cs.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cs.body}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------- Industries -------- */
function Industries({ c }: { c: SeoContent }) {
  const icons = [Building2, GraduationCap, Cpu, Wallet, LeafyGreen, MapPin];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.industries.eyebrow}
          title={<>{c.industries.title[0]}<Accent>{c.industries.title[1]}</Accent></>}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.industries.items.map((it, i) => {
            const Icon = icons[i] ?? Building2;
            return (
              <GlassCard key={it.title}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-lg font-semibold">{it.title}</div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------- Security -------- */
function Security({ c }: { c: SeoContent }) {
  const icons = [ShieldCheck, Lock, Fingerprint, HeartHandshake];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.security.eyebrow}
          title={<>{c.security.title[0]}<Accent>{c.security.title[1]}</Accent></>}
          sub={c.security.sub}
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {c.security.cards.map((s, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <GlassCard key={s.title}>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-accent" />
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------- Analytics -------- */
function Analytics({ c }: { c: SeoContent }) {
  const icons = [MousePointerClick, Download, Share2, Radio, QrCode, Clock];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.analytics.eyebrow}
          title={<>{c.analytics.title[0]}<Accent>{c.analytics.title[1]}</Accent></>}
          sub={c.analytics.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.analytics.metrics.map((m, i) => {
            const Icon = icons[i] ?? MousePointerClick;
            return (
              <GlassCard key={m.title}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-accent" />
                  <div className="text-base font-semibold">{m.title}</div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
              </GlassCard>
            );
          })}
        </div>
        <div className="mt-10 rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur-xl">
          <div className="grid items-end gap-1" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 20 + Math.round(Math.sin(i / 2.7) * 30 + Math.random() * 40);
              return <div key={i} className="rounded-t bg-gradient-to-t from-accent/70 to-accent/20" style={{ height: h + 40 }} />;
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{c.analytics.agoLabel}</span>
            <span className="inline-flex items-center gap-1"><LineChart className="h-3 w-3" /> {c.analytics.liveLabel}</span>
            <span>{c.analytics.todayLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------- Cross-platform -------- */
function CrossPlatform({ c }: { c: SeoContent }) {
  const icons = [Smartphone, Smartphone, Globe2];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.crossPlatform.eyebrow}
          title={<>{c.crossPlatform.title[0]}<Accent>{c.crossPlatform.title[1]}</Accent></>}
          sub={c.crossPlatform.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {c.crossPlatform.cards.map((cd, i) => {
            const Icon = icons[i] ?? Smartphone;
            return (
              <GlassCard key={cd.title}>
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 text-lg font-semibold">{cd.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cd.body}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------- Stats -------- */
function Stats({ c }: { c: SeoContent }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.stats.items.map((it) => (
            <GlassCard key={it.u}>
              <div className="text-5xl font-semibold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">{it.n}</div>
              <div className="mt-2 text-sm font-medium">{it.u}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Testimonials -------- */
function ExtendedTestimonials({ c }: { c: SeoContent }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.testimonials.eyebrow}
          title={<>{c.testimonials.title[0]}<Accent>{c.testimonials.title[1]}</Accent></>}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.testimonials.quotes.map((q) => (
            <GlassCard key={q.name}>
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{q.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/40 to-primary/30 text-xs font-semibold">
                  {q.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.role}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- FAQ -------- */
function ExtendedFaq({ c }: { c: SeoContent }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.faq.eyebrow}
          title={<>{c.faq.title[0]}<Accent>{c.faq.title[1]}</Accent></>}
        />
        <div className="mt-14 space-y-3">
          {c.faq.items.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
                {f.q}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Articles teaser -------- */
function ArticlesTeaser({ c }: { c: SeoContent }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.articles.eyebrow}
          title={<>{c.articles.title[0]}<Accent>{c.articles.title[1]}</Accent></>}
          sub={c.articles.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {c.articles.posts.map((p) => (
            <GlassCard key={p.title} className="flex flex-col">
              <div className="mb-5 aspect-[16/10] rounded-2xl bg-gradient-to-br from-accent/30 via-primary/20 to-background" />
              <h3 className="text-base font-semibold">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                {c.articles.readCta} <ArrowRight className="h-3 w-3" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Integrations -------- */
function Integrations({ c }: { c: SeoContent }) {
  const icons = [LinkIcon, Download, Layers, Camera];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow={c.integrations.eyebrow}
          title={<>{c.integrations.title[0]}<Accent>{c.integrations.title[1]}</Accent></>}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {c.integrations.items.map((it, i) => {
            const Icon = icons[i] ?? LinkIcon;
            return (
              <GlassCard key={it.title}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{it.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------- Final CTA -------- */
function SeoFinalCta({ authed, c }: { authed: boolean | null; c: SeoContent }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1000px] px-5 lg:px-10">
        <div className="relative overflow-hidden rounded-[36px] border border-border/70 bg-card/70 p-12 text-center backdrop-blur-xl sm:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "var(--gradient-mesh)" }} />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {c.finalCta.title[0]}
              <br />
              <Accent>{c.finalCta.title[1]}</Accent>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{c.finalCta.sub}</p>
            <Link
              to={authed === false ? "/auth" : "/dashboard"}
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-accent-foreground shadow-glow"
              style={{ background: "var(--gradient-gold)" }}
            >
              {c.finalCta.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Public API ---------------- */
export function SeoSections({ authed }: { authed: boolean | null }) {
  const { lang } = useI18n();
  const c = getSeoContent(lang);
  return (
    <div className="relative">
      <WhyDigital c={c} />
      <WhyCardixn c={c} />
      <DeepFeatures c={c} />
      <ComparisonPaper c={c} />
      <ComparisonApps c={c} />
      <UseCases c={c} />
      <Industries c={c} />
      <Security c={c} />
      <Analytics c={c} />
      <CrossPlatform c={c} />
      <Integrations c={c} />
      <Stats c={c} />
      <ExtendedTestimonials c={c} />
      <ExtendedFaq c={c} />
      <ArticlesTeaser c={c} />
      <SeoFinalCta authed={authed} c={c} />
    </div>
  );
}

/* Back-compat export used by JSON-LD in the route. Returns the FAQ
   items for the requested locale (falling back to English). */
export function getSeoFaqItems(lang: Parameters<typeof getSeoContent>[0]) {
  return getSeoContent(lang).faq.items;
}
