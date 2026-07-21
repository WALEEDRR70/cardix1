import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SUPPORTED_LOCALES, SITE_ORIGIN, isSupportedLocale } from "@/i18n/config";

// Public, indexable page paths (relative to the locale). Add new SEO pages here.
const INDEXABLE_PATHS = ["/", "/features", "/pricing", "/about", "/contact", "/blog"];

export const Route = createFileRoute("/sitemap/{$lang}.xml")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const lang = params.lang;
        if (!isSupportedLocale(lang)) {
          return new Response("Not found", { status: 404 });
        }
        const urls = INDEXABLE_PATHS.map((p) => {
          const path = p === "/" ? "" : p;
          const alternates = SUPPORTED_LOCALES.map(
            (l) =>
              `      <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_ORIGIN}/${l}${path}" />`,
          ).join("\n");
          const xDefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en${path}" />`;
          return [
            `  <url>`,
            `    <loc>${SITE_ORIGIN}/${lang}${path}</loc>`,
            `    <changefreq>weekly</changefreq>`,
            `    <priority>${p === "/" ? "1.0" : "0.8"}</priority>`,
            alternates,
            xDefault,
            `  </url>`,
          ].join("\n");
        }).join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
