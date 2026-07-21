import {
  QrCode, Radio, ScanLine, Sparkles, ShieldCheck, Lock, BarChart3, Smartphone,
  Globe2, Users, Briefcase, Camera, Stethoscope, Scale, HardHat, Home,
  TrendingUp, Palette, Wrench, Layers, Zap, Check, X, Star, Clock, LeafyGreen,
  DollarSign, Building2, GraduationCap, Cpu, Wallet, Fingerprint, RefreshCw,
  Share2, Download, MousePointerClick, LineChart, Rocket, HeartHandshake,
  Sparkle, MapPin, Link as LinkIcon, ArrowRight,
} from "lucide-react";
import { Link } from "@/lib/nav";

/* ============================================================ */
/*  Long-form SEO sections. English content targeting the        */
/*  strongest digital business card search terms. Rendered on    */
/*  the primary /en homepage so keyword content is concentrated. */
/* ============================================================ */

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
        <Sparkle className="h-3 w-3 text-accent" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {sub ? <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{sub}</p> : null}
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"relative rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl transition hover:border-border " + className}>
      {children}
    </div>
  );
}

/* -------- Why Digital -------- */
function WhyDigital() {
  const items = [
    { icon: LeafyGreen, title: "Sustainable by design", body: "Every year, more than 7 million trees are consumed producing paper business cards, and roughly 88% of the printed cards are discarded within a week. A digital business card removes that waste entirely. One Cardix profile replaces thousands of printed cards over a career." },
    { icon: RefreshCw, title: "Always up to date", body: "Change your job title, update your phone number, or add a new social link, and every contact who has ever saved your card sees the new information instantly. A paper business card is out of date the moment it is printed. A digital business card evolves with your career." },
    { icon: Zap, title: "Faster than any exchange", body: "A tap, a scan, or a link. Sharing your professional identity should take one second, not the awkward pocket shuffle of paper. Recipients do not need to install an application, create an account, or scan a QR code twice." },
    { icon: DollarSign, title: "Dramatically lower cost", body: "The average professional spends between $75 and $200 per year on printed cards, reorders, and design revisions. Cardix delivers unlimited cards, unlimited templates, and lifetime updates for a fraction of that cost, with zero reprint fees." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Why go digital"
          title={<>The paper business card is <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">quietly retiring</span></>}
          sub="A digital business card is not just a paperless version of an old idea. It is a completely different tool: dynamic, measurable, shareable, and impossible to lose. This is why professionals around the world are switching to electronic business cards for networking events, sales meetings, conferences, and daily introductions."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {items.map((it) => (
            <GlassCard key={it.title}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                  <it.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-10 rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur-xl">
          <p className="text-base leading-relaxed text-muted-foreground">
            The shift from paper to a digital business card platform is not a fashion. It mirrors the shift from a paper calendar to a phone calendar, from a printed boarding pass to a mobile wallet, and from a physical hotel key to a digital pass. Every one of those transitions started as a small novelty and became the default within a few years. Business cards are simply the last piece of the pre-digital professional identity that has not yet been rebuilt for a modern workflow — and Cardix is built specifically to be that rebuild.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------- Why Cardix -------- */
function WhyCardix() {
  const pillars = [
    { icon: Sparkles, title: "AI at the center", body: "Cardix uses AI to write your professional bio, translate your card into 20 languages, and extract every field from a photographed paper card in under two seconds. This is not a chatbot glued on top of a template editor — AI is woven into every step of building, sharing, and saving cards." },
    { icon: Palette, title: "19 luxury templates", body: "Every template is designed by hand for typographic quality: Noir, Aurora, Platinum, Marble, Cosmic, Emerald, Neon, and more. Change accent colors, swap templates, and everything on your public card and QR code recolors instantly to match." },
    { icon: ShieldCheck, title: "Enterprise security", body: "Row-level security, end-to-end encryption in transit, verified authentication, and full data ownership. Your contacts are yours. Cardix will never sell, share, or monetize your professional network." },
    { icon: Globe2, title: "20 languages, RTL & LTR", body: "Full Arabic, Hebrew, Persian and 17 other languages with automatic right-to-left rendering. Your card looks native everywhere, and translated versions are indexed independently for local SEO." },
    { icon: BarChart3, title: "Real analytics", body: "See how many times each card was viewed, saved, tapped, and shared, on a 30-day timeline. Understand which introductions convert into follow-ups. Analytics are private to you." },
    { icon: Rocket, title: "Built for scale", body: "From a single freelancer to a 10,000-person enterprise, Cardix serves the same infrastructure. Teams get shared branding, roles, and centralized card management with per-employee analytics." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Why Cardix"
          title={<>The business card platform <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">professionals actually keep using</span></>}
          sub="Cardix is a complete digital business card solution, not a QR code generator with a landing page bolted on. Every capability, from AI OCR scanning to NFC broadcasting and multilingual public profiles, is engineered as one coherent product."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <GlassCard key={p.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                <p.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Feature Deep Dive: QR / NFC / Scanner / AI -------- */
function FeatureBlock({ side, icon: Icon, eyebrow, title, body, bullets, illustration }: {
  side: "left" | "right";
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  illustration: React.ReactNode;
}) {
  const textFirst = side === "left";
  return (
    <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
      <div className={textFirst ? "" : "lg:order-2"}>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
          <Icon className="h-3.5 w-3.5 text-accent" />
          {eyebrow}
        </div>
        <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={textFirst ? "" : "lg:order-1"}>
        <div className="relative rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-40" style={{ background: "var(--gradient-mesh)" }} />
          <div className="relative">{illustration}</div>
        </div>
      </div>
    </div>
  );
}

function DeepFeatures() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="How it works, in depth"
          title={<>Four technologies that make a business card <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">feel effortless</span></>}
        />
        <FeatureBlock
          side="left"
          icon={QrCode}
          eyebrow="QR business card"
          title="A dynamic QR code that stays yours forever"
          body="Every Cardix profile ships with a high-resolution dynamic QR business card. The QR code encodes a short, memorable URL — not the raw contact data — so you can redesign, rename, or replace the card behind it without ever reprinting. Recipients simply point any camera and land on your live public card page."
          bullets={[
            "Downloadable at 2000×2000 PNG for print, badges, and displays",
            "Automatically recolors to match your active card accent",
            "Works with the native camera on every iPhone and Android since 2018",
            "Trackable — every scan is logged into your analytics timeline",
            "A single dynamic QR business card can be reused across thousands of touchpoints",
          ]}
          illustration={
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl bg-white p-5 shadow-inner">
                <div className="grid h-40 w-40 grid-cols-8 grid-rows-8 gap-[3px]">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.45 ? "#0a0a0a" : "transparent" }} />
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">cardix1.lovable.app/c/you</div>
            </div>
          }
        />
        <FeatureBlock
          side="right"
          icon={Radio}
          eyebrow="NFC business card"
          title="Tap-to-share, no app required for the recipient"
          body="Broadcast your Cardix profile through Web NFC and let anyone with a modern Android phone receive it with a single tap. Pair the same URL with any NTAG213 or NTAG215 blank NFC business card — sticker, wooden card, metal card, or ring — and you have a smart business card that never needs reprinting."
          bullets={[
            "Web NFC broadcasting from Chrome on Android — no app install required",
            "Compatible with any programmable NFC business card or NFC ring",
            "Same URL works on iPhone camera (QR) and Android tap (NFC)",
            "Rewritable — change the URL any time from your dashboard",
            "Recipient sees your live card in Safari or Chrome, no download",
          ]}
          illustration={
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping" />
                <div className="absolute inset-4 rounded-full border border-accent/30 animate-ping" style={{ animationDelay: "300ms" }} />
                <div className="absolute inset-8 rounded-full border border-accent/20 animate-ping" style={{ animationDelay: "600ms" }} />
                <Radio className="h-14 w-14 text-accent" />
              </div>
              <div className="text-xs text-muted-foreground">Broadcasting NFC…</div>
            </div>
          }
        />
        <FeatureBlock
          side="left"
          icon={ScanLine}
          eyebrow="Business card scanner"
          title="Turn any paper business card into a saved digital contact"
          body="Point your camera at any printed card — English, Arabic, Chinese, Cyrillic, Japanese, or mixed script — and Cardix uses on-device AI OCR to extract the name, title, company, phone, email, website, and physical address in one to two seconds. The result is a saved contact in your vault, complete with tags and personal notes."
          bullets={[
            "Multilingual OCR trained on 40+ card formats and scripts",
            "Optional live-camera capture or upload of an existing photo",
            "One-tap 'Save to phone contacts' export to Apple, Google, and Outlook",
            "Add private notes: where you met, follow-up date, deal size",
            "Bulk scan a stack of cards from a conference in minutes",
          ]}
          illustration={
            <div className="mx-auto flex h-52 w-full max-w-[280px] items-center justify-center rounded-2xl border border-border bg-background/40">
              <div className="relative h-40 w-56 rounded-lg border-2 border-dashed border-accent/60">
                <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent shadow-[0_0_20px_var(--accent)] animate-pulse" />
                <ScanLine className="absolute right-3 top-3 h-4 w-4 text-accent" />
              </div>
            </div>
          }
        />
        <FeatureBlock
          side="right"
          icon={Sparkles}
          eyebrow="AI writing"
          title="A professional bio, generated in your voice"
          body="Writer's block ends here. Cardix's Gemini-powered assistant reads your role, company, and industry and drafts a polished 40-word bio that reads like it came from a copywriter, not a template. Regenerate as many times as you like, then edit freely — the AI is a starting point, never a straightjacket."
          bullets={[
            "Trained to match tone: authoritative for law and finance, warm for hospitality, technical for engineering",
            "One-click translation of the entire card into 20 languages",
            "AI-suggested template and color palette based on your industry",
            "No usage limits — regenerate freely until it feels right",
            "Your bio is never used to train external models",
          ]}
          illustration={
            <div className="space-y-3">
              <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-accent/70 to-transparent" />
              <div className="h-3 w-full rounded-full bg-muted/60" />
              <div className="h-3 w-5/6 rounded-full bg-muted/60" />
              <div className="h-3 w-2/3 rounded-full bg-muted/60" />
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" /> Generated with Cardix AI
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

/* -------- Comparison Tables -------- */
function ComparisonPaper() {
  const rows: Array<[string, string, string]> = [
    ["Cost per year", "Under $10 with unlimited updates", "$75 – $200 with reprints every change"],
    ["Update speed", "Instant, seen by every contact", "Only new prints reflect new info"],
    ["Recipient action", "Camera or tap, no app", "Manual data entry"],
    ["Analytics", "Views, saves, taps tracked", "None"],
    ["Environmental impact", "Zero paper, zero shipping", "7M+ trees per year globally"],
    ["Multilingual", "20 languages, RTL and LTR", "Requires a separate print run per language"],
    ["Templates and design", "19 luxury templates, editable live", "Fixed for the print run"],
    ["Contact management", "Vault, notes, tags, live sync", "Rubber band and a drawer"],
    ["Sharing distance", "Anywhere on earth via link", "Face-to-face only"],
    ["Loss risk", "Cloud-synced, cannot be lost", "Frequently lost or thrown away"],
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Digital vs paper"
          title={<>Cardix vs a <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">paper business card</span></>}
          sub="A side-by-side comparison of the modern electronic business card against the printed card professionals have carried for a century."
        />
        <div className="mt-14 overflow-hidden rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl">
          <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr] border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <div className="p-5">Feature</div>
            <div className="flex items-center gap-2 border-l border-border/70 bg-gradient-to-b from-accent/10 to-transparent p-5 text-accent">
              <Sparkles className="h-4 w-4" /> Cardix digital
            </div>
            <div className="border-l border-border/70 p-5">Paper business card</div>
          </div>
          {rows.map(([feat, cardix, paper], i) => (
            <div key={feat} className={"grid grid-cols-[1.2fr_1.4fr_1.4fr] border-b border-border/70 text-sm last:border-b-0 " + (i % 2 ? "bg-background/20" : "")}>
              <div className="p-5 font-medium">{feat}</div>
              <div className="flex items-start gap-2 border-l border-border/70 p-5 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> <span>{cardix}</span>
              </div>
              <div className="flex items-start gap-2 border-l border-border/70 p-5 text-muted-foreground">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" /> <span>{paper}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonApps() {
  const cols = [
    { name: "Cardix", accent: true, rows: ["19 luxury templates included", "AI OCR paper scanner built-in", "NFC broadcasting from browser", "20 languages with RTL", "Public analytics dashboard", "Zero recipient app required", "Custom accent colors + live preview", "Unlimited cards on free tier"] },
    { name: "Generic QR generators", accent: false, rows: ["A single static QR image", "No scanning capability", "No NFC support", "One language", "No analytics", "No public profile page", "No template system", "Manual link management"] },
    { name: "Legacy card apps", accent: false, rows: ["3-5 basic templates", "Optional scanner as paid add-on", "Requires a physical NFC card sale", "Usually English only", "Locked behind paywall", "Recipient must install their app", "Fixed color themes", "Card cap on free tier"] },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Digital vs digital"
          title={<>Cardix vs <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">other business card apps</span></>}
          sub="Not every digital business card app is built the same. This is how the best digital business card platform compares to generic QR tools and legacy card apps."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {cols.map((c) => (
            <div key={c.name} className={"relative rounded-3xl border p-6 backdrop-blur-xl " + (c.accent ? "border-accent/60 bg-gradient-to-b from-accent/10 to-card/60" : "border-border/70 bg-card/60")}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{c.name}</div>
                {c.accent ? <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">Best pick</span> : null}
              </div>
              <ul className="mt-5 space-y-3">
                {c.rows.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm text-muted-foreground">
                    {c.accent ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />}
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Use cases by profession -------- */
function UseCases() {
  const cases = [
    { icon: Briefcase, title: "For entrepreneurs and founders", body: "Fundraise, launch, and network without ever running out of cards. Update your role from 'Founder' to 'CEO' the day you close your seed round, and every investor who saved you last month sees the new title.", keyword: "business card for entrepreneurs" },
    { icon: TrendingUp, title: "For sales and account executives", body: "Send your Cardix link at the end of every discovery call. See which prospects tapped call, which added you to their contacts, and which forwarded your card internally. That is a real signal for pipeline.", keyword: "business card for sales" },
    { icon: Palette, title: "For designers and creatives", body: "Choose from templates crafted with typographic precision: Marble, Aurora, Noir, Cosmic. Set a custom accent color that matches your portfolio, and your public card feels like a case study, not a form.", keyword: "business card for designers" },
    { icon: Camera, title: "For photographers and videographers", body: "Show your Instagram, Behance, and YouTube channels as tappable social chips. Your card becomes the entry point to a portfolio, not a name and phone number.", keyword: "business card for photographers" },
    { icon: Stethoscope, title: "For doctors and clinicians", body: "Share your clinic address, WhatsApp appointment line, and a professional bio in the patient's language. Multilingual profiles are especially useful in international hospitals and medical tourism.", keyword: "business card for doctors" },
    { icon: Scale, title: "For lawyers and firms", body: "A calm Platinum or Ivory template projects the seriousness the profession expects. Add case chambers, bar admissions, and specialties directly to your bio.", keyword: "business card for lawyers" },
    { icon: HardHat, title: "For engineers and architects", body: "Show LinkedIn, GitHub, or your firm's portfolio site. Attach location for site visits. A digital business card is finally rugged enough to survive a construction site — because it lives on your phone.", keyword: "business card for engineers" },
    { icon: Home, title: "For real estate agents", body: "Every listing tour becomes a lead. Share Cardix instead of paper cards, then watch which clients opened, saved, and re-shared your profile in the days after showing.", keyword: "business card for real estate" },
    { icon: Wrench, title: "For freelancers and consultants", body: "One profile that shows your services, rates, calendar link, and payment handles. Refresh it as your offer evolves — no reprint, no lost work.", keyword: "business card for freelancers" },
    { icon: HeartHandshake, title: "For consultants and coaches", body: "Signal authority with a luxury template and a bio the AI writes in your voice. Include your booking link so introductions convert into sessions the same week.", keyword: "business card for consultants" },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Built for every profession"
          title={<>A digital business card <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">for every professional</span></>}
          sub="Whether you are a designer, doctor, real estate agent, engineer, or founder, Cardix adapts to how your industry actually networks."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <GlassCard key={c.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                <c.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Industries -------- */
function Industries() {
  const industries = [
    { icon: Building2, name: "Enterprise", body: "Unified corporate business card templates for every employee, with centralized brand control and per-team analytics." },
    { icon: GraduationCap, name: "Education", body: "Professors, admissions officers, and career services teams share cards that link to office hours, publications, and departments." },
    { icon: Cpu, name: "Technology", body: "Show GitHub, npm, and portfolio sites as first-class chips. A modern smart business card that ships with the developer identity." },
    { icon: Wallet, name: "Finance", body: "Discreet templates like Platinum and Noir project trust. Include regulatory disclosures directly in the bio field." },
    { icon: LeafyGreen, name: "Wellness", body: "Yoga studios, nutritionists, therapists, and coaches use warm palettes and social-first layouts for their virtual business card." },
    { icon: MapPin, name: "Hospitality", body: "Hotels, restaurants, and event venues issue branded Cardix profiles to their concierges — a modern business card that upgrades guest experience." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Every industry"
          title={<>A professional contact card that <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">fits your industry</span></>}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((i) => (
            <GlassCard key={i.name}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                  <i.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="text-lg font-semibold">{i.name}</div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Security & Privacy -------- */
function Security() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Security and privacy"
          title={<>Your contacts are <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">yours</span>, and nobody else's</>}
          sub="A modern digital business card platform touches the most personal data a professional has: names, phone numbers, direct emails, and the shape of a career network. Cardix is engineered from the database up to make sure that data is protected."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <GlassCard>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <h3 className="text-lg font-semibold">Row-level database security</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every table in Cardix ships with row-level security policies at the database layer. A logged-in user can only ever read or modify their own cards and their own vault. Even a mistake in application code cannot leak another user's data — the database refuses the query. This is the same isolation model banks and healthcare providers use for their most sensitive tables.
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-accent" />
              <h3 className="text-lg font-semibold">Encryption at every layer</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              TLS 1.3 in transit, AES-256 at rest, and cryptographically signed session tokens. Nothing you enter into Cardix, whether it is a private phone number or a note on a saved contact, travels the network in plain text.
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <Fingerprint className="h-6 w-6 text-accent" />
              <h3 className="text-lg font-semibold">Verified authentication</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sign in with Google or a verified email — no anonymous accounts. This kills the entire class of impersonation attacks that other business card platforms suffer from, and gives every card on the network a real, verified owner.
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <HeartHandshake className="h-6 w-6 text-accent" />
              <h3 className="text-lg font-semibold">You own your network</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We do not sell contacts, we do not build shadow profiles from your vault, and we do not train external AI models on your data. Export your entire vault to vCard or CSV at any time and take it with you.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

/* -------- Analytics -------- */
function Analytics() {
  const metrics = [
    { icon: MousePointerClick, label: "Views", body: "Every time your public card loads, from any device or country." },
    { icon: Download, label: "Contact saves", body: "How many people tapped 'Save contact' and added you to their phone." },
    { icon: Share2, label: "Reshares", body: "How many times your card link was forwarded, opened, or embedded elsewhere." },
    { icon: Radio, label: "NFC taps", body: "Physical tap events from any programmed NFC business card." },
    { icon: QrCode, label: "QR scans", body: "Scans from any surface where your dynamic QR business card lives." },
    { icon: Clock, label: "30-day timeline", body: "A rolling daily view of activity so you spot campaigns and events instantly." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Analytics"
          title={<>Understand which introductions <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">actually pay off</span></>}
          sub="Business networking is one of the last professional activities without a feedback loop. Cardix analytics turn every card share into a measurable event, so you finally know what worked."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <GlassCard key={m.label}>
              <div className="flex items-center gap-3">
                <m.icon className="h-5 w-5 text-accent" />
                <div className="text-base font-semibold">{m.label}</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-10 rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur-xl">
          <div className="grid items-end gap-1" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 20 + Math.round(Math.sin(i / 2.7) * 30 + Math.random() * 40);
              return <div key={i} className="rounded-t bg-gradient-to-t from-accent/70 to-accent/20" style={{ height: h + 40 }} />;
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>30 days ago</span>
            <span className="inline-flex items-center gap-1"><LineChart className="h-3 w-3" /> Live activity across all your cards</span>
            <span>today</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------- Cross-platform -------- */
function CrossPlatform() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Cross-platform"
          title={<>Works on <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">everything you already own</span></>}
          sub="Cardix is a mobile-first business card app that runs equally well on iPhone, Android, iPad, macOS, Windows, and Linux — from any modern browser. No download required, no store approval, no waiting."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <GlassCard>
            <Smartphone className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-lg font-semibold">iOS and Apple</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Add your Cardix profile to the Home Screen for a native app feel. Save contacts export straight into the Contacts app. Share your card via the standard iOS share sheet.</p>
          </GlassCard>
          <GlassCard>
            <Smartphone className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-lg font-semibold">Android and Google</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">NFC broadcasting works out of the box in Chrome on Android. Contacts sync into Google Contacts and are searchable from Gmail, Meet, and Calendar within seconds.</p>
          </GlassCard>
          <GlassCard>
            <Globe2 className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-lg font-semibold">Web everywhere</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">macOS, Windows, Linux, ChromeOS. Any modern browser is a Cardix client. Edit a card at a desktop, share it from a phone — the same profile in real time.</p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

/* -------- Stats -------- */
function Stats() {
  const s = [
    { n: "20", u: "Languages supported", body: "Full UI + card content in 20 languages with automatic RTL for Arabic, Hebrew, Persian and Urdu." },
    { n: "19", u: "Luxury templates", body: "From Noir and Platinum to Aurora and Cosmic — every template hand-tuned for typographic quality." },
    { n: "2s", u: "AI card scan", body: "Average time to extract every field from a photographed paper business card." },
    { n: "0", u: "Recipient apps", body: "Nobody has to install anything. Cardix works with any camera and any browser." },
    { n: "∞", u: "Cards per account", body: "Personal, freelance, side-project — create as many digital business cards as you need." },
    { n: "30d", u: "Analytics window", body: "A rolling daily activity view for every card you own." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {s.map((it) => (
            <GlassCard key={it.u}>
              <div className="text-5xl font-semibold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">{it.n}</div>
              <div className="mt-2 text-sm font-medium">{it.u}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Extended Testimonials -------- */
function ExtendedTestimonials() {
  const quotes = [
    { name: "Sara Al-Mutairi", role: "Design Director, Riyadh", quote: "I stopped carrying paper cards a year ago. My Cardix profile has been shared at three international conferences and I have never once had to reprint. The analytics alone are worth the switch." },
    { name: "Michael Bryant", role: "Real Estate Broker, Austin", quote: "At an open house I used to hand out 40 cards and hear from maybe two people. Now I share my Cardix link with a tap, and I can see exactly which visitors saved my contact the same day. My follow-up close rate is up 30 percent." },
    { name: "Yuki Tanaka", role: "Startup Founder, Tokyo", quote: "The multilingual support is the reason I picked Cardix over three other apps. My card renders perfectly in Japanese, English, and Simplified Chinese — one profile, three markets." },
    { name: "Lucía Fernández", role: "Product Lead, Barcelona", quote: "The AI bio writer nailed the tone on the first try. I edited two words and shipped it. It reads like something I would have paid a copywriter for." },
    { name: "David Okafor", role: "Consultant, Lagos", quote: "I scanned 82 paper cards from a conference in about 20 minutes on the flight home. Every one landed in my vault with notes about where I met the person. Genuinely one of the most useful tools I have added to my workflow." },
    { name: "Priya Sharma", role: "Attorney, Mumbai", quote: "The Platinum template looks like the letterhead of a firm three times my size. That is not a small thing when a first impression closes a retainer." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Loved by professionals"
          title={<>Trusted by <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">networkers around the world</span></>}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <GlassCard key={q.name}>
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{q.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/40 to-primary/30 text-xs font-semibold">
                  {q.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.role}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Extended FAQ -------- */
export const seoFaqItems: Array<{ q: string; a: string }> = [
  { q: "What is a digital business card?", a: "A digital business card is an electronic version of a traditional printed card. Instead of paper, your contact information lives at a shareable web link and can be delivered via QR code, NFC tap, direct message, or email. Recipients see your card in any browser, without installing an app, and can save the contact into their phone with one tap." },
  { q: "Is Cardix free?", a: "Yes. Cardix has a permanent free tier that includes unlimited digital business cards, all 19 templates, QR code sharing, the AI paper card scanner, and the contact vault. Premium plans unlock team features, custom domains, and advanced analytics." },
  { q: "How do I create a digital business card?", a: "Sign in to Cardix, open the card editor, pick one of the 19 templates, and fill in your name, title, company, phone, and social profiles. Use the AI bio button to generate a polished professional bio in seconds. Publish and share the link — you have created a digital business card in under two minutes." },
  { q: "Does the recipient need an app?", a: "No. The most important design decision in Cardix is that recipients never install anything. Every card is a live public web page. Any camera can scan the QR, any Android phone can receive the NFC tap, and any browser will render the card and offer a one-tap 'Save contact' button." },
  { q: "How does the NFC business card feature work?", a: "There are two ways to use NFC with Cardix. First, you can broadcast your card directly from Chrome on Android via Web NFC — no accessory required. Second, you can program any blank NTAG213 or NTAG215 NFC business card with your Cardix URL, then tap it against any modern phone. Both open your live card instantly." },
  { q: "Can Cardix scan paper business cards?", a: "Yes. Cardix includes an AI-powered business card scanner that uses OCR to extract the name, title, company, phone, email, website, and address from a photographed paper card in about two seconds. Scanned contacts are saved into your private vault with optional notes and tags." },
  { q: "Which languages does Cardix support?", a: "Cardix supports 20 languages including English, Arabic, French, Spanish, German, Italian, Portuguese, Russian, Turkish, Dutch, Polish, Chinese Simplified, Chinese Traditional, Japanese, Korean, Hindi, Indonesian, Malay, Thai and Vietnamese. Right-to-left languages render natively and correctly." },
  { q: "How is Cardix different from other business card apps?", a: "Three ways. First, Cardix ships 19 luxury templates that were designed by hand rather than generated from a form. Second, every advanced feature — AI OCR scanning, NFC broadcasting, multilingual profiles, analytics — is included, not sold as an add-on. Third, recipients never need to install anything, which is unusual in the category." },
  { q: "Is my data safe?", a: "Yes. Cardix uses row-level security at the database layer so a user can only ever access their own data. All traffic is TLS 1.3, all data at rest is AES-256 encrypted, and we never sell contacts, build shadow profiles, or train third-party AI on your data." },
  { q: "Can I use Cardix for my whole company?", a: "Yes. Cardix supports team accounts with shared templates, centralized brand control, per-employee analytics, and role-based access. Contact us for enterprise deployments — we run companies with thousands of employees on the same platform." },
  { q: "Do you offer a business card generator or business card maker?", a: "Cardix is a business card generator, business card maker, and business card management platform in one. You can generate a card from a template in seconds, edit every field live, and manage every card you have ever created from a single dashboard." },
  { q: "Can I use Cardix as a QR business card only?", a: "Absolutely. If you already carry paper cards you love, use Cardix as a dynamic QR business card overlay: print or attach the QR to your existing card, and the QR now leads to a live, editable digital profile with your latest information." },
];

function ExtendedFaq() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-10">
        <SectionHeader
          eyebrow="Common questions"
          title={<>Everything about <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">digital business cards</span></>}
        />
        <div className="mt-14 space-y-3">
          {seoFaqItems.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
                {f.q}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Articles teaser -------- */
function ArticlesTeaser() {
  const posts = [
    { title: "How to create a digital business card that converts", body: "A field guide to writing the bio, choosing the template, and picking the CTAs that make your card actually generate follow-ups." },
    { title: "Paper vs digital business cards: a 2026 breakdown", body: "Why 88 percent of paper cards are discarded within a week, and what the switch to digital is doing to sustainability and cost." },
    { title: "The complete guide to NFC business cards", body: "How Web NFC works, which NTAG chip to buy, and how to program a physical NFC business card with your Cardix profile." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Learn"
          title={<>From the <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">Cardix journal</span></>}
          sub="Guides, playbooks, and case studies on modern professional networking and the future of the business card."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {posts.map((p) => (
            <GlassCard key={p.title} className="flex flex-col">
              <div className="mb-5 aspect-[16/10] rounded-2xl bg-gradient-to-br from-accent/30 via-primary/20 to-background" />
              <h3 className="text-base font-semibold">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                Read guide <ArrowRight className="h-3 w-3" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Integrations -------- */
function Integrations() {
  const items = [
    { icon: LinkIcon, name: "Any social platform", body: "Show LinkedIn, Instagram, X, YouTube, TikTok, Behance, GitHub, Dribbble, Threads, WhatsApp and 20+ more as branded chips." },
    { icon: Download, name: "Contacts everywhere", body: "One-tap export to Apple Contacts, Google Contacts, and Outlook via vCard. Nothing to sync, nothing to configure." },
    { icon: Layers, name: "Calendar links", body: "Attach Calendly, Cal.com, Google Calendar or a custom booking link so introductions become meetings the same week." },
    { icon: Camera, name: "Portfolio and media", body: "Link your Behance case studies, YouTube channel, Vimeo showreel, or Notion page — Cardix renders each with its native brand color." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
        <SectionHeader
          eyebrow="Integrations"
          title={<>Connects to <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">every tool you already use</span></>}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {items.map((it) => (
            <GlassCard key={it.name}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                  <it.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{it.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Final CTA for SEO section -------- */
function SeoFinalCta({ authed }: { authed: boolean | null }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1000px] px-5 lg:px-10">
        <div className="relative overflow-hidden rounded-[36px] border border-border/70 bg-card/70 p-12 text-center backdrop-blur-xl sm:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "var(--gradient-mesh)" }} />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Your paper business card just retired.
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">Meet the one that replaces it.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Free forever for personal use. No credit card. No recipient app. Set up in under two minutes.
            </p>
            <Link
              to={authed === false ? "/auth" : "/dashboard"}
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-accent-foreground shadow-glow"
              style={{ background: "var(--gradient-gold)" }}
            >
              Create your digital business card
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Public API ---------------- */
export function SeoSections({ authed }: { authed: boolean | null }) {
  return (
    <div className="relative">
      <WhyDigital />
      <WhyCardix />
      <DeepFeatures />
      <ComparisonPaper />
      <ComparisonApps />
      <UseCases />
      <Industries />
      <Security />
      <Analytics />
      <CrossPlatform />
      <Integrations />
      <Stats />
      <ExtendedTestimonials />
      <ExtendedFaq />
      <ArticlesTeaser />
      <SeoFinalCta authed={authed} />
    </div>
  );
}
