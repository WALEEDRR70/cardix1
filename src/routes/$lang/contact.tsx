import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Mail, MessageCircle, LifeBuoy, ArrowRight, Send } from "lucide-react";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/contact`;
    const isAr = lang === "ar";
    const title = tx("Contact Cardixn — Support, Sales & Partnerships");
    const description = tx("Get in touch with the Cardixn team for support, team plans or partnerships. We usually reply within one business day.");
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
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hrefLang: l, href: `${SITE_ORIGIN}/${l}/contact` })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/contact` },
      ],
    };
  },
  component: ContactPage,
});

const SUPPORT_EMAIL = "hello@cardixn.com";

function ContactPage() {
  const { lang } = Route.useParams();
  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
  const isAr = locale === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    (tx("Enquiry from ")) + (name || (tx("a visitor"))),
  )}&body=${encodeURIComponent(`${message}\n\n— ${name}\n${email}`)}`;

  const channels = [
    { icon: Mail, title: tx("Email us"), desc: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
    { icon: LifeBuoy, title: tx("Product support"), desc: tx("Reply within 1 business day"), href: `mailto:${SUPPORT_EMAIL}` },
    { icon: MessageCircle, title: tx("Teams & partnerships"), desc: tx("Custom plans for teams"), href: `mailto:${SUPPORT_EMAIL}` },
  ];

  const field = "w-full rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-sm outline-none transition focus:border-primary/60";

  return (
    <MarketingLayout lang={locale}>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-6 md:py-28">
          <span className="text-xs uppercase tracking-widest text-primary/80">Cardixn · {tx("Contact")}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {tx("We'd love to hear from you")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-muted-foreground">
            {tx("Product question, feature request, or a plan for your team? Write to us — we usually reply within one business day.")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-16 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-7">
          <h2 className="text-xl font-semibold">{tx("Send a message")}</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="c-name" className="text-xs font-medium text-muted-foreground">{tx("Name")}</label>
              <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} className={field + " mt-1.5"} placeholder={tx("Your full name")} />
            </div>
            <div>
              <label htmlFor="c-email" className="text-xs font-medium text-muted-foreground">{tx("Email")}</label>
              <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field + " mt-1.5"} placeholder="you@company.com" />
            </div>
            <div>
              <label htmlFor="c-msg" className="text-xs font-medium text-muted-foreground">{tx("Message")}</label>
              <textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={field + " mt-1.5 resize-none"} placeholder={tx("How can we help?")} />
            </div>
            <a
              href={mailto}
              className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Send className="size-4" /> {tx("Send message")}
            </a>
            <p className="text-center text-[11px] text-muted-foreground">
              {tx("Opens your email app with the message pre-filled.")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.title} href={c.href} className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:border-primary/50 transition">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></span>
                <span className="min-w-0">
                  <span className="block font-semibold">{c.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">{c.desc}</span>
                </span>
              </a>
            );
          })}
          <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur p-6">
            <h2 className="font-semibold">{tx("Before you write")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {tx("You might find your answer on the features or pricing page.")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/features" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-card/60 transition">
                {tx("Features")} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-card/60 transition">
                {tx("Pricing")} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
