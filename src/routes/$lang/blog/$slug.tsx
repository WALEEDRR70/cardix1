import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale, isRtl } from "@/i18n/config";
import { getPost, getPostCopy, getAllPosts } from "@/i18n/blog-posts";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/$lang/blog/$slug")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.lang)) throw notFound();
    if (!getPost(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const post = getPost(params.slug);
    if (!post) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const c = getPostCopy(post, lang);
    const url = `${SITE_ORIGIN}/${lang}/blog/${post.slug}`;
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { name: "keywords", content: c.tags.join(", ") },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
        { property: "article:author", content: post.author },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: c.title },
        { name: "twitter:description", content: c.description },
      ],
      links: [
        { rel: "canonical", href: url },
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hreflang: l, href: `${SITE_ORIGIN}/${l}/blog/${post.slug}` })),
        { rel: "alternate", hreflang: "x-default", href: `${SITE_ORIGIN}/en/blog/${post.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: c.h1,
            description: c.description,
            author: { "@type": "Organization", name: post.author },
            publisher: { "@type": "Organization", name: "Cardix" },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: url,
            inLanguage: lang,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/${lang}` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/${lang}/blog` },
              { "@type": "ListItem", position: 3, name: c.h1, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { lang, slug } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const rtl = isRtl(locale);
  const post = getPost(slug)!;
  const c = getPostCopy(post, locale);
  const isAr = locale === "ar";
  const related = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link to="/blog" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary">
          ← Cardix · {isAr ? "المدونة" : "Blog"}
        </Link>
        <h1 className="mt-6 text-3xl md:text-5xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          {c.h1}
        </h1>
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="size-4" />{new Date(post.publishedAt).toLocaleDateString(locale)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-4" />{c.readTime}</span>
          <span>· {post.author}</span>
        </div>
        <p className="mt-8 text-xl md:text-2xl text-muted-foreground leading-relaxed">{c.excerpt}</p>

        <div className="mt-12 space-y-12">
          {c.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{s.h2}</h2>
              <div className="mt-4 text-foreground/85 leading-[1.85] whitespace-pre-line">{s.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-2">
          {c.tags.map((t) => (
            <span key={t} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">{t}</span>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 p-8 md:p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">{isAr ? "أنشئ بطاقتك الرقمية الآن" : "Create your digital card now"}</h3>
          <p className="mt-3 text-muted-foreground">{isAr ? "60 ثانية. مجاناً. بلا بطاقة ائتمانية." : "60 seconds. Free. No credit card."}</p>
          <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
            {isAr ? "ابدأ الآن" : "Get started"} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h3 className="text-xl md:text-2xl font-semibold mb-6">{isAr ? "مقالات ذات صلة" : "Related reading"}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => {
              const rc = getPostCopy(r, locale);
              return (
                <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} className="group rounded-2xl border border-border/60 bg-card/40 p-6 hover:border-primary/50 transition-colors">
                  <div className="text-xs text-muted-foreground">{rc.readTime}</div>
                  <div className="mt-2 font-semibold group-hover:text-primary transition-colors line-clamp-2">{rc.h1}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
