import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale, isRtl } from "@/i18n/config";
import { TOOLS, getToolCopy } from "@/i18n/tools";
import { ArrowRight, QrCode, Contact, Mail } from "lucide-react";

const ICON = { QrCode, Contact, Mail } as const;

export const Route = createFileRoute("/$lang/tools/")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/tools`;
    const isAr = lang === "ar";
    const title = isAr ? "أدوات مجانية للمحترفين — QR وvCard وتوقيع البريد | Cardixn" : "Free Professional Tools — QR, vCard & Email Signature | Cardixn";
    const description = isAr
      ? "مجموعة أدوات مجانية للمحترفين: منشئ QR، منشئ vCard، منشئ توقيع البريد الإلكتروني. بدون تسجيل، بدون علامات مائية."
      : "Free professional toolkit: QR generator, vCard downloader, email signature builder. No signup, no watermarks, unlimited use.";
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
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hreflang: l, href: `${SITE_ORIGIN}/${l}/tools` })),
        { rel: "alternate", hreflang: "x-default", href: `${SITE_ORIGIN}/en/tools` },
      ],
    };
  },
  component: ToolsHub,
});

function ToolsHub() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const rtl = isRtl(locale);
  const isAr = locale === "ar";
  return (
    <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <span className="text-xs uppercase tracking-widest text-primary/80">Cardixn · {isAr ? "أدوات" : "Tools"}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {isAr ? "أدوات مجانية للمحترفين" : "Free tools for professionals"}
          </h1>
          <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">
            {isAr ? "أدوات شغّالة بلا حدود، بلا تسجيل، بلا علامة مائية." : "Working tools. Unlimited use. No signup. No watermarks."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 grid gap-6 md:grid-cols-3">
        {TOOLS.map((t) => {
          const c = getToolCopy(t, locale);
          const Icon = ICON[t.icon as keyof typeof ICON] ?? QrCode;
          return (
            <Link
              key={t.slug}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-6 hover:border-primary/50 hover:bg-card/60 transition-all"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold group-hover:text-primary transition-colors">{c.h1}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.subtitle}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
                {isAr ? "افتح الأداة" : "Open tool"} <ArrowRight className="size-4 rtl:rotate-180" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
