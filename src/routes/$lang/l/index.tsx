import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, DEFAULT_LOCALE, isSupportedLocale, SUPPORTED_LOCALES } from "@/i18n/config";
import { getLandingPagesByCategory, CATEGORY_LABEL, type LandingCategory } from "@/i18n/landing-pages";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { GetStartedCards } from "@/components/marketing/GetStartedCards";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/$lang/l/")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/l`;
    const isAr = lang === "ar";
    const title = tx("The Digital Business Card Guide — Cardixn");
    const description = tx("The complete guide to digital business cards, QR, NFC, OCR and modern networking. Dozens of expert articles.");
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [
        { rel: "canonical", href: url },
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hrefLang: l, href: `${SITE_ORIGIN}/${l}/l` })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/l` },
      ],
    };
  },
  component: HubPage,
});

function HubPage() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const isAr = locale === "ar";
  const byCat = getLandingPagesByCategory();
  const cats: LandingCategory[] = ["app", "qr", "nfc", "ocr", "share", "templates", "compare"];

  return (
    <MarketingLayout lang={locale}>
      <section className="border-b border-border/40 py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-widest text-primary/80 mb-3">Cardixn</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            {tx("The Complete Digital Card Guide")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {tx("Dozens of expert guides to master modern digital networking.")}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        {cats.map((cat) => {
          const pages = byCat[cat];
          if (!pages.length) return null;
          return (
            <div key={cat}>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
                {CATEGORY_LABEL[cat][tx("en")]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((p) => {
                  const c = p.copy[locale] ?? p.copy.en!;
                  return (
                    <Link key={p.slug} to={`/l/${p.slug}`} className="group rounded-xl border border-border/50 bg-card/40 p-6 hover:border-primary/50 hover:bg-card/60 transition-all">
                      <div className="text-xs uppercase tracking-wider text-primary/70 mb-2">{p.keyword}</div>
                      <div className="font-semibold leading-snug mb-1 group-hover:text-primary transition-colors">{c.h1}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{c.subtitle}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
      <GetStartedCards lang={locale} />
    </MarketingLayout>
  );
}
