import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { getLandingPage, getLandingCopy } from "@/i18n/landing-pages";
import { LandingPageView } from "@/components/landing/LandingPageView";

export const Route = createFileRoute("/$lang/l/$slug")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.lang)) throw notFound();
    if (!getLandingPage(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const page = getLandingPage(params.slug);
    if (!page) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const copy = getLandingCopy(page, lang);
    const url = `${SITE_ORIGIN}/${lang}/l/${page.slug}`;
    const alternates = SUPPORTED_LOCALES.map((l) => ({
      rel: "alternate", hreflang: l, href: `${SITE_ORIGIN}/${l}/l/${page.slug}`,
    }));
    return {
      meta: [
        { title: copy.title },
        { name: "description", content: copy.description },
        { name: "keywords", content: page.keyword },
        { property: "og:title", content: copy.title },
        { property: "og:description", content: copy.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: copy.title },
        { name: "twitter:description", content: copy.description },
      ],
      links: [
        { rel: "canonical", href: url },
        ...alternates,
        { rel: "alternate", hreflang: "x-default", href: `${SITE_ORIGIN}/en/l/${page.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: copy.faqs.map((f) => ({
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
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/${lang}` },
              { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_ORIGIN}/${lang}/l` },
              { "@type": "ListItem", position: 3, name: page.keyword, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: LandingSlugPage,
});

function LandingSlugPage() {
  const { lang, slug } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const page = getLandingPage(slug)!;
  const copy = getLandingCopy(page, locale);
  return <LandingPageView copy={copy} lang={locale} category={page.category} slug={slug} />;
}
