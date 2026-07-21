import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { CardPreview } from "@/components/CardPreview";
import { ArrowRight, QrCode, Sparkles, ScanLine } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardix — The premium digital business card" },
      { name: "description", content: "Create beautiful, luxury digital business cards. Share with a tap, a scan, or a link." },
      { property: "og:title", content: "Cardix — The premium digital business card" },
      { property: "og:description", content: "Create beautiful, luxury digital business cards. Share with a tap, a scan, or a link." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const icons = [<Sparkles key="0" className="h-5 w-5" />, <QrCode key="1" className="h-5 w-5" />, <ScanLine key="2" className="h-5 w-5" />];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">C</span>
          <span className="text-lg font-semibold tracking-tight">{t.brand}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LangToggle />
          <Link to="/auth" className="text-sm font-medium hover:opacity-70">{t.signIn}</Link>
          <Link to="/auth" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            {t.getStarted}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pt-16 pb-24 lg:grid-cols-2 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Cardix · Digital Business Cards
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {t.tagline.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-gradient-gold">{t.tagline.split(" ").slice(-2).join(" ")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">{t.subtagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:shadow-luxe">
              {t.getStarted}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {t.features.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">{icons[i]}</div>
                <h3 className="mt-3 text-sm font-semibold">{f.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-primary/10 blur-2xl" />
          <div className="relative">
            <CardPreview
              card={{
                name: "Layla Al-Farsi",
                title: "Design Director",
                company: "Atelier Nord",
                bio: "Building quiet, beautiful products at the intersection of craft and technology.",
                phone: "+971 50 123 4567",
                email: "layla@ateliernord.co",
                website: "ateliernord.co",
                whatsapp: "+971501234567",
                accent_color: "#D4AF37",
              }}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {t.brand}</span>
          <span>Made with craft.</span>
        </div>
      </footer>
    </div>
  );
}
