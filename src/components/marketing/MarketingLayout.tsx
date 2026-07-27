import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/lib/nav";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle as LocaleSwitcher } from "@/components/LangToggle";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { MobileNav } from "@/components/marketing/MobileNav";
import { isRtl, type Locale } from "@/i18n/config";

export function MarketingLayout({ children, lang }: { children: ReactNode; lang?: Locale }) {
  const rtl = lang ? isRtl(lang) : false;
  return (
    <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

function MarketingNav() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const navLinks = [
    { to: "/features", label: ar ? "المميزات" : "Features" },
    { to: "/templates", label: ar ? "القوالب" : "Templates" },
    { to: "/pricing", label: ar ? "الأسعار" : "Pricing" },
    { to: "/l", label: ar ? "الأدلة" : "Guides" },
    { to: "/tools", label: ar ? "الأدوات" : "Tools" },
    { to: "/blog", label: ar ? "المدونة" : "Blog" },
  ] as const;

  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthed(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={
        "safe-top sticky top-0 z-40 w-full transition-all " +
        (scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border/60" : "")
      }
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoAsset.url} alt="" className="h-9 w-9 object-contain" />
          <span className="text-base font-semibold tracking-tight">{t.brand}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-foreground transition">{l.label}</Link>
          ))}
        </nav>



        <div className="flex items-center gap-2">
          <MobileNav links={navLinks} authed={authed} />
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle compact />
            <LocaleSwitcher compact />
          </div>
          {authed === false ? (
            <Link to="/auth" className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2">
              {t.signIn}
            </Link>
          ) : null}
          <Link
            to={authed === false ? "/auth" : "/dashboard"}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
            style={{ background: "var(--gradient-gold)" }}
          >
            {authed === false ? t.getStarted : t.dashboard}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const productLinks = [
    { to: "/features", label: ar ? "المميزات" : "Features" },
    { to: "/pricing", label: ar ? "الأسعار" : "Pricing" },
    { to: "/l/digital-business-card", label: ar ? "بطاقة أعمال رقمية" : "Digital Business Card" },
    { to: "/l/nfc-business-card", label: ar ? "بطاقة NFC" : "NFC Business Card" },
    { to: "/l/qr-business-card", label: ar ? "بطاقة QR" : "QR Business Card" },
    { to: "/l/business-card-scanner", label: ar ? "ماسح البطاقات (OCR)" : "Card Scanner (OCR)" },
    { to: "/l/business-card-templates", label: ar ? "القوالب" : "Templates" },
  ];

  const toolLinks = [
    { to: "/tools/qr-generator", label: ar ? "مولّد رمز QR" : "QR Code Generator" },
    { to: "/tools/vcard-generator", label: ar ? "مولّد vCard (.vcf)" : "vCard (.vcf) Generator" },
    { to: "/tools/email-signature", label: ar ? "منشئ توقيع البريد" : "Email Signature Builder" },
    { to: "/tools", label: ar ? "كل الأدوات المجانية" : "All Free Tools" },
  ];
  const professionLinks = [
    { to: "/l/for-real-estate-agents", label: ar ? "للعقاريين" : "For Real Estate" },
    { to: "/l/for-doctors", label: ar ? "للأطباء" : "For Doctors" },
    { to: "/l/for-lawyers", label: ar ? "للمحامين" : "For Lawyers" },
    { to: "/l/for-sales-teams", label: ar ? "لفرق المبيعات" : "For Sales Teams" },
  ];
  const learnLinks = [
    { to: "/blog", label: ar ? "المدونة" : "Blog" },
    { to: "/l", label: ar ? "كل الأدلة" : "All Guides" },
    { to: "/about", label: ar ? "عن كارديكس" : "About Cardixn" },
    { to: "/contact", label: ar ? "تواصل معنا" : "Contact" },
    { to: "/blog/nfc-vs-qr-which-is-better", label: ar ? "NFC مقابل QR" : "NFC vs QR" },
  ];

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-14 lg:grid-cols-5 lg:px-10">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
            <span className="text-sm font-semibold">{t.brand}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {ar
              ? "بطاقات أعمال رقمية فاخرة. شاركها بلمسة أو مسح أو رابط."
              : "Premium digital business cards. Share with a tap, a scan, or a link."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <ThemeToggle compact />
            <LocaleSwitcher compact />
          </div>
        </div>
        <FooterCol title={ar ? "المنتج" : "Product"} items={productLinks} />
        <FooterCol title={ar ? "أدوات مجانية" : "Free Tools"} items={toolLinks} />
        <FooterCol title={ar ? "للمحترفين" : "For Professionals"} items={professionLinks} />
        <FooterCol title={ar ? "تعلّم" : "Learn"} items={learnLinks} />
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-5 text-[11px] text-muted-foreground lg:flex-row lg:px-10">
          <span>© {new Date().getFullYear()} {t.brand}</span>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" className="hover:text-foreground">Sitemap</a>
            <Link to="/auth" className="hover:text-foreground">{t.signIn}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to as any} className="hover:text-foreground transition">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
