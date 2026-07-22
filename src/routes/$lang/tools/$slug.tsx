import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { getTool, getToolCopy } from "@/i18n/tools";
import { ToolShell } from "@/components/tools/ToolShell";
import { QrGeneratorTool } from "@/components/tools/QrGeneratorTool";
import { VCardGeneratorTool } from "@/components/tools/VCardGeneratorTool";
import { EmailSignatureTool } from "@/components/tools/EmailSignatureTool";

export const Route = createFileRoute("/$lang/tools/$slug")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.lang)) throw notFound();
    if (!getTool(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const tool = getTool(params.slug);
    if (!tool) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const c = getToolCopy(tool, lang);
    const url = `${SITE_ORIGIN}/${lang}/tools/${tool.slug}`;
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: c.title },
        { name: "twitter:description", content: c.description },
      ],
      links: [
        { rel: "canonical", href: url },
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hreflang: l, href: `${SITE_ORIGIN}/${l}/tools/${tool.slug}` })),
        { rel: "alternate", hreflang: "x-default", href: `${SITE_ORIGIN}/en/tools/${tool.slug}` },
      ],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: c.h1,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url,
        }),
      }],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { lang, slug } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const tool = getTool(slug)!;
  const c = getToolCopy(tool, locale);
  const isAr = locale === "ar";

  const faqs = slug === "qr-generator"
    ? (isAr
      ? [{ q: "هل الرموز الناتجة مجانية للاستخدام التجاري؟", a: "نعم. جميع الرموز التي تنشئها ملكك بالكامل، بلا قيود ولا علامة مائية." },
         { q: "ما أعلى دقة يمكنني تنزيلها؟", a: "حتى 2000×2000 بكسل، مناسب للطباعة على الشارات واللوحات الكبيرة." }]
      : [{ q: "Are the generated codes free for commercial use?", a: "Yes. Every code you create is entirely yours — no restrictions, no watermarks." },
         { q: "What's the max download resolution?", a: "Up to 2000×2000 pixels, suitable for print, badges, and large signage." }])
    : slug === "vcard-generator"
    ? (isAr
      ? [{ q: "ما هو ملف vCard؟", a: "معيار عالمي (.vcf) لجهات الاتصال يعمل على iPhone وAndroid وOutlook وGmail وأي دفتر عناوين حديث." },
         { q: "هل بياناتي محفوظة على خوادمكم؟", a: "لا. الأداة تعمل بالكامل في متصفحك. لا تصل بياناتك إلى خوادمنا أبداً." }]
      : [{ q: "What is a vCard file?", a: "A universal contact standard (.vcf) supported by iPhone, Android, Outlook, Gmail and every modern address book." },
         { q: "Is my data stored on your servers?", a: "No. The tool runs entirely in your browser. Your data never touches our servers." }])
    : (isAr
      ? [{ q: "أين ألصق التوقيع؟", a: "Gmail: الإعدادات ← عام ← التوقيع. Outlook: الملف ← خيارات ← البريد ← التوقيعات." },
         { q: "هل يعمل التوقيع على الجوال؟", a: "نعم. HTML متجاوب ويظهر بشكل نظيف على تطبيقات Gmail وOutlook للجوال." }]
      : [{ q: "Where do I paste the signature?", a: "Gmail: Settings → General → Signature. Outlook: File → Options → Mail → Signatures." },
         { q: "Does it work on mobile mail?", a: "Yes. The HTML is responsive and renders cleanly in the Gmail and Outlook mobile apps." }]);

  return (
    <ToolShell lang={locale} title={c.h1} subtitle={c.subtitle} intro={c.longIntro} faqs={faqs}>
      {slug === "qr-generator" && <QrGeneratorTool lang={locale} />}
      {slug === "vcard-generator" && <VCardGeneratorTool lang={locale} />}
      {slug === "email-signature" && <EmailSignatureTool lang={locale} />}
    </ToolShell>
  );
}
