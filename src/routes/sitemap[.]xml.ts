import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SUPPORTED_LOCALES, SITE_ORIGIN } from "@/i18n/config";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...SUPPORTED_LOCALES.map(
            (l) => `  <sitemap><loc>${SITE_ORIGIN}/sitemap-${l}.xml</loc></sitemap>`,
          ),
          `</sitemapindex>`,
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
