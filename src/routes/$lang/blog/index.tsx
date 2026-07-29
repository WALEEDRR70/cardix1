import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { getAllPosts, getPostCopy } from "@/i18n/blog-posts";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { GetStartedCards } from "@/components/marketing/GetStartedCards";

export const Route = createFileRoute("/$lang/blog/")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/blog`;
    const isAr = lang === "ar";
    const title = isAr ? "مدونة Cardixn — رؤى البطاقات الرقمية والشبكات المهنية" : "Cardixn Blog — Insights on Digital Cards & Modern Networking";
    const description = isAr
      ? "مقالات طويلة وأدلة عملية ودراسات حالة حول البطاقات الرقمية و NFC و QR و OCR والتحول من الورق."
      : "Long-form articles, playbooks and case studies on digital business cards, NFC, QR, AI OCR and the death of paper.";
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
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hrefLang: l, href: `${SITE_ORIGIN}/${l}/blog` })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/blog` },
      ],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Cardixn Blog",
          url,
          publisher: { "@type": "Organization", name: "Cardixn" },
        }),
      }],
    };
  },
  component: BlogIndex,
});

function BlogIndex() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const posts = getAllPosts();
  const isAr = locale === "ar";

  return (
    <MarketingLayout lang={locale}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 md:py-28">
          <Link to="/" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary">Cardixn · {isAr ? "المدونة" : "Blog"}</Link>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {isAr ? "رؤى وأدلة عن البطاقات الرقمية" : "Insights & playbooks for the digital-card era"}
          </h1>
          <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">
            {isAr
              ? "مقالات معمّقة يكتبها فريق Cardixn. تحليل الاتجاهات، حالات عملية، وأدلة لتحويل بطاقتك إلى أصل قوي."
              : "Deeply-researched writing from the Cardixn team. Trends, real-world case studies, and no-fluff guides to turn your card into a serious business asset."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => {
            const c = getPostCopy(post, locale);
            return (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-8 hover:border-primary/50 hover:bg-card/60 transition-all"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{new Date(post.publishedAt).toLocaleDateString(locale)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" />{c.readTime}</span>
                </div>
                <h2 className="mt-4 text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">{c.h1}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{c.excerpt}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {c.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm text-primary">
                  {isAr ? "اقرأ المقال" : "Read article"} <ArrowRight className="size-4 rtl:rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <GetStartedCards lang={locale} />
    </MarketingLayout>
  );
}
