import { Link } from "@/lib/nav";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { LandingCopy } from "@/i18n/landing-pages";
import { CATEGORY_LABEL, LANDING_PAGES, type LandingCategory } from "@/i18n/landing-pages";
import type { Locale } from "@/i18n/config";
import { isRtl } from "@/i18n/config";

export function LandingPageView({
  copy, lang, category, slug,
}: { copy: LandingCopy; lang: Locale; category: LandingCategory; slug: string }) {
  const rtl = isRtl(lang);
  const catLabel = CATEGORY_LABEL[category][lang === "ar" ? "ar" : "en"];
  const related = LANDING_PAGES.filter((p) => p.category === category && p.slug !== slug).slice(0, 4);

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Link to="/" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary">
            Cardix · {catLabel}
          </Link>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {copy.h1}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-muted-foreground">{copy.subtitle}</p>
          <p className="mt-8 max-w-3xl text-base md:text-lg text-foreground/80 leading-relaxed">{copy.intro}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
              {copy.ctaButton} <ArrowRight className="size-4" />
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 hover:bg-muted/50 transition-colors">
              {lang === "ar" ? "استكشف Cardix" : "Explore Cardix"}
            </Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24 space-y-16">
        {copy.sections.map((s, i) => (
          <article key={i}>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">{s.h2}</h2>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">{s.body}</p>
          </article>
        ))}
      </section>

      {/* Features */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-12">
            {lang === "ar" ? "لماذا Cardix" : "Why Cardix"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {copy.features.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-2.5"><Sparkles className="size-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-10">
          {lang === "ar" ? "الأسئلة الشائعة" : "Frequently asked questions"}
        </h2>
        <div className="space-y-4">
          {copy.faqs.map((f, i) => (
            <details key={i} className="group rounded-xl border border-border/50 bg-card/40 p-5 hover:border-primary/40 transition-colors">
              <summary className="cursor-pointer font-medium flex items-start gap-3">
                <Check className="size-5 text-primary shrink-0 mt-0.5" /> <span>{f.q}</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed ps-8">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border/40 bg-muted/10">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
              {lang === "ar" ? "مواضيع ذات صلة" : "Related topics"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => {
                const rc = p.copy[lang] ?? p.copy.en!;
                return (
                  <Link key={p.slug} to={`/l/${p.slug}`} className="rounded-xl border border-border/50 bg-card/40 p-5 hover:border-primary/50 hover:bg-card/60 transition-all">
                    <div className="text-xs uppercase tracking-wider text-primary/70 mb-2">{p.keyword}</div>
                    <div className="font-medium leading-snug">{rc.h1}</div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link to="/l" className="text-primary hover:underline">
                {lang === "ar" ? "استعرض جميع الأدلة ←" : "Browse all guides →"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28 text-center">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-10 md:p-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{copy.ctaTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8">{copy.ctaSub}</p>
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-primary-foreground font-semibold text-lg shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-shadow">
            {copy.ctaButton} <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
