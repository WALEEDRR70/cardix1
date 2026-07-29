import { Link } from "@/lib/nav";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { tx } from "@/lib/tx";

export function ToolShell({
  lang, title, subtitle, intro, children, faqs,
}: {
  lang: Locale;
  title: string;
  subtitle: string;
  intro: string;
  children: React.ReactNode;
  faqs?: { q: string; a: string }[];
}) {
  return (
    <MarketingLayout lang={lang}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-24">
          <Link to="/tools" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary">
            Cardixn · {tx("Free Tools")}
          </Link>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground">{subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-6 md:p-8">
          {children}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-muted-foreground leading-relaxed">{intro}</p>
      </section>

      {faqs && faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-10">
          <h2 className="text-2xl font-semibold mb-6">{tx("FAQ")}</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-border/60 bg-card/40 p-5">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 p-8 md:p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">{tx("Get a full digital business card")}</h3>
          <p className="mt-3 text-muted-foreground">{tx("All of these tools, unified into one editable card, shareable via QR, NFC or link.")}</p>
          <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
            {tx("Start free")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
