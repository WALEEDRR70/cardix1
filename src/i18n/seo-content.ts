import type { Locale } from "./config";
import { SEO_LOCALES } from "./seo-locales";

/* Data model for the long-form SEO sections. Every locale ships the
   full shape; translations focus on keeping every heading, list item,
   and short body paragraph natively translated. English keeps the
   long-form marketing copy verbatim; other locales carry equivalent
   meaning with tighter prose. */

export type Pair = [string, string];
export type Item2 = { title: string; body: string };
export type Bulleted = { eyebrow: string; title: string; body: string; bullets: string[] };
export type Quote = { name: string; role: string; quote: string };
export type QA = { q: string; a: string };
export type Column = { name: string; rows: string[] };
export type Post = { title: string; body: string };

export type SeoContent = {
  whyDigital: { eyebrow: string; title: Pair; sub: string; items: Item2[]; closing: string };
  whyCardixn: { eyebrow: string; title: Pair; sub: string; pillars: Item2[] };
  deepFeatures: { eyebrow: string; title: Pair; blocks: Bulleted[] };
  comparisonPaper: {
    eyebrow: string; title: Pair; sub: string;
    headers: [string, string, string];
    rows: [string, string, string][];
  };
  comparisonApps: { eyebrow: string; title: Pair; sub: string; bestPick: string; cols: Column[] };
  useCases: { eyebrow: string; title: Pair; sub: string; cases: Item2[] };
  industries: { eyebrow: string; title: Pair; items: Item2[] };
  security: { eyebrow: string; title: Pair; sub: string; cards: Item2[] };
  analytics: {
    eyebrow: string; title: Pair; sub: string;
    metrics: Item2[]; liveLabel: string; agoLabel: string; todayLabel: string;
  };
  crossPlatform: { eyebrow: string; title: Pair; sub: string; cards: Item2[] };
  integrations: { eyebrow: string; title: Pair; items: Item2[] };
  stats: { items: { n: string; u: string; body: string }[] };
  testimonials: { eyebrow: string; title: Pair; quotes: Quote[] };
  faq: { eyebrow: string; title: Pair; items: QA[] };
  articles: { eyebrow: string; title: Pair; sub: string; posts: Post[]; readCta: string };
  finalCta: { title: Pair; sub: string; button: string };
};

/* ============================================================ */
/* English (canonical, full length)                              */
/* ============================================================ */
const en: SeoContent = {
  whyDigital: {
    eyebrow: "Why go digital",
    title: ["The paper business card is ", "quietly retiring"],
    sub: "A digital business card is not just a paperless version of an old idea. It is a completely different tool: dynamic, measurable, shareable, and impossible to lose. This is why professionals around the world are switching to electronic business cards for networking events, sales meetings, conferences, and daily introductions.",
    items: [
      { title: "Sustainable by design", body: "Every year, more than 7 million trees are consumed producing paper business cards, and roughly 88% of the printed cards are discarded within a week. A digital business card removes that waste entirely. One Cardixn profile replaces thousands of printed cards over a career." },
      { title: "Always up to date", body: "Change your job title, update your phone number, or add a new social link, and every contact who has ever saved your card sees the new information instantly. A paper business card is out of date the moment it is printed. A digital business card evolves with your career." },
      { title: "Faster than any exchange", body: "A tap, a scan, or a link. Sharing your professional identity should take one second, not the awkward pocket shuffle of paper. Recipients do not need to install an application, create an account, or scan a QR code twice." },
      { title: "Dramatically lower cost", body: "The average professional spends between $75 and $200 per year on printed cards, reorders, and design revisions. Cardixn delivers unlimited cards, unlimited templates, and lifetime updates for a fraction of that cost, with zero reprint fees." },
    ],
    closing: "The shift from paper to a digital business card platform is not a fashion. It mirrors the shift from a paper calendar to a phone calendar, from a printed boarding pass to a mobile wallet, and from a physical hotel key to a digital pass. Every one of those transitions started as a small novelty and became the default within a few years. Business cards are simply the last piece of the pre-digital professional identity that has not yet been rebuilt for a modern workflow — and Cardixn is built specifically to be that rebuild.",
  },
  whyCardixn: {
    eyebrow: "Why Cardixn",
    title: ["The business card platform ", "professionals actually keep using"],
    sub: "Cardixn is a complete digital business card solution, not a QR code generator with a landing page bolted on. Every capability, from AI OCR scanning to NFC broadcasting and multilingual public profiles, is engineered as one coherent product.",
    pillars: [
      { title: "AI at the center", body: "Cardixn uses AI to write your professional bio, translate your card into 20 languages, and extract every field from a photographed paper card in under two seconds. This is not a chatbot glued on top of a template editor — AI is woven into every step of building, sharing, and saving cards." },
      { title: "19 luxury templates", body: "Every template is designed by hand for typographic quality: Noir, Aurora, Platinum, Marble, Cosmic, Emerald, Neon, and more. Change accent colors, swap templates, and everything on your public card and QR code recolors instantly to match." },
      { title: "Enterprise security", body: "Row-level security, end-to-end encryption in transit, verified authentication, and full data ownership. Your contacts are yours. Cardixn will never sell, share, or monetize your professional network." },
      { title: "20 languages, RTL & LTR", body: "Full Arabic, Hebrew, Persian and 17 other languages with automatic right-to-left rendering. Your card looks native everywhere, and translated versions are indexed independently for local SEO." },
      { title: "Real analytics", body: "See how many times each card was viewed, saved, tapped, and shared, on a 30-day timeline. Understand which introductions convert into follow-ups. Analytics are private to you." },
      { title: "Built for scale", body: "From a single freelancer to a 10,000-person enterprise, Cardixn serves the same infrastructure. Teams get shared branding, roles, and centralized card management with per-employee analytics." },
    ],
  },
  deepFeatures: {
    eyebrow: "How it works, in depth",
    title: ["Four technologies that make a business card ", "feel effortless"],
    blocks: [
      {
        eyebrow: "QR business card",
        title: "A dynamic QR code that stays yours forever",
        body: "Every Cardixn profile ships with a high-resolution dynamic QR business card. The QR code encodes a short, memorable URL — not the raw contact data — so you can redesign, rename, or replace the card behind it without ever reprinting. Recipients simply point any camera and land on your live public card page.",
        bullets: [
          "Downloadable at 2000×2000 PNG for print, badges, and displays",
          "Automatically recolors to match your active card accent",
          "Works with the native camera on every iPhone and Android since 2018",
          "Trackable — every scan is logged into your analytics timeline",
          "A single dynamic QR business card can be reused across thousands of touchpoints",
        ],
      },
      {
        eyebrow: "NFC business card",
        title: "Tap-to-share, no app required for the recipient",
        body: "Broadcast your Cardixn profile through Web NFC and let anyone with a modern Android phone receive it with a single tap. Pair the same URL with any NTAG213 or NTAG215 blank NFC business card — sticker, wooden card, metal card, or ring — and you have a smart business card that never needs reprinting.",
        bullets: [
          "Web NFC broadcasting from Chrome on Android — no app install required",
          "Compatible with any programmable NFC business card or NFC ring",
          "Same URL works on iPhone camera (QR) and Android tap (NFC)",
          "Rewritable — change the URL any time from your dashboard",
          "Recipient sees your live card in Safari or Chrome, no download",
        ],
      },
      {
        eyebrow: "Business card scanner",
        title: "Turn any paper business card into a saved digital contact",
        body: "Point your camera at any printed card — English, Arabic, Chinese, Cyrillic, Japanese, or mixed script — and Cardixn uses on-device AI OCR to extract the name, title, company, phone, email, website, and physical address in one to two seconds. The result is a saved contact in your vault, complete with tags and personal notes.",
        bullets: [
          "Multilingual OCR trained on 40+ card formats and scripts",
          "Optional live-camera capture or upload of an existing photo",
          "One-tap 'Save to phone contacts' export to Apple, Google, and Outlook",
          "Add private notes: where you met, follow-up date, deal size",
          "Bulk scan a stack of cards from a conference in minutes",
        ],
      },
      {
        eyebrow: "AI writing",
        title: "A professional bio, generated in your voice",
        body: "Writer's block ends here. Cardixn's Gemini-powered assistant reads your role, company, and industry and drafts a polished 40-word bio that reads like it came from a copywriter, not a template. Regenerate as many times as you like, then edit freely — the AI is a starting point, never a straightjacket.",
        bullets: [
          "Trained to match tone: authoritative for law and finance, warm for hospitality, technical for engineering",
          "One-click translation of the entire card into 20 languages",
          "AI-suggested template and color palette based on your industry",
          "No usage limits — regenerate freely until it feels right",
          "Your bio is never used to train external models",
        ],
      },
    ],
  },
  comparisonPaper: {
    eyebrow: "Digital vs paper",
    title: ["Cardixn vs a ", "paper business card"],
    sub: "A side-by-side comparison of the modern electronic business card against the printed card professionals have carried for a century.",
    headers: ["Feature", "Cardixn digital", "Paper business card"],
    rows: [
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
    ],
  },
  comparisonApps: {
    eyebrow: "Digital vs digital",
    title: ["Cardixn vs ", "other business card apps"],
    sub: "Not every digital business card app is built the same. This is how the best digital business card platform compares to generic QR tools and legacy card apps.",
    bestPick: "Best pick",
    cols: [
      { name: "Cardixn", rows: ["19 luxury templates included", "AI OCR paper scanner built-in", "NFC broadcasting from browser", "20 languages with RTL", "Public analytics dashboard", "Zero recipient app required", "Custom accent colors + live preview", "Unlimited cards on free tier"] },
      { name: "Generic QR generators", rows: ["A single static QR image", "No scanning capability", "No NFC support", "One language", "No analytics", "No public profile page", "No template system", "Manual link management"] },
      { name: "Legacy card apps", rows: ["3-5 basic templates", "Optional scanner as paid add-on", "Requires a physical NFC card sale", "Usually English only", "Locked behind paywall", "Recipient must install their app", "Fixed color themes", "Card cap on free tier"] },
    ],
  },
  useCases: {
    eyebrow: "Built for every profession",
    title: ["A digital business card ", "for every professional"],
    sub: "Whether you are a designer, doctor, real estate agent, engineer, or founder, Cardixn adapts to how your industry actually networks.",
    cases: [
      { title: "For entrepreneurs and founders", body: "Fundraise, launch, and network without ever running out of cards. Update your role from 'Founder' to 'CEO' the day you close your seed round, and every investor who saved you last month sees the new title." },
      { title: "For sales and account executives", body: "Send your Cardixn link at the end of every discovery call. See which prospects tapped call, which added you to their contacts, and which forwarded your card internally. That is a real signal for pipeline." },
      { title: "For designers and creatives", body: "Choose from templates crafted with typographic precision: Marble, Aurora, Noir, Cosmic. Set a custom accent color that matches your portfolio, and your public card feels like a case study, not a form." },
      { title: "For photographers and videographers", body: "Show your Instagram, Behance, and YouTube channels as tappable social chips. Your card becomes the entry point to a portfolio, not a name and phone number." },
      { title: "For doctors and clinicians", body: "Share your clinic address, WhatsApp appointment line, and a professional bio in the patient's language. Multilingual profiles are especially useful in international hospitals and medical tourism." },
      { title: "For lawyers and firms", body: "A calm Platinum or Ivory template projects the seriousness the profession expects. Add case chambers, bar admissions, and specialties directly to your bio." },
      { title: "For engineers and architects", body: "Show LinkedIn, GitHub, or your firm's portfolio site. Attach location for site visits. A digital business card is finally rugged enough to survive a construction site — because it lives on your phone." },
      { title: "For real estate agents", body: "Every listing tour becomes a lead. Share Cardixn instead of paper cards, then watch which clients opened, saved, and re-shared your profile in the days after showing." },
      { title: "For freelancers and consultants", body: "One profile that shows your services, rates, calendar link, and payment handles. Refresh it as your offer evolves — no reprint, no lost work." },
      { title: "For consultants and coaches", body: "Signal authority with a luxury template and a bio the AI writes in your voice. Include your booking link so introductions convert into sessions the same week." },
    ],
  },
  industries: {
    eyebrow: "Every industry",
    title: ["A professional contact card that ", "fits your industry"],
    items: [
      { title: "Enterprise", body: "Unified corporate business card templates for every employee, with centralized brand control and per-team analytics." },
      { title: "Education", body: "Professors, admissions officers, and career services teams share cards that link to office hours, publications, and departments." },
      { title: "Technology", body: "Show GitHub, npm, and portfolio sites as first-class chips. A modern smart business card that ships with the developer identity." },
      { title: "Finance", body: "Discreet templates like Platinum and Noir project trust. Include regulatory disclosures directly in the bio field." },
      { title: "Wellness", body: "Yoga studios, nutritionists, therapists, and coaches use warm palettes and social-first layouts for their virtual business card." },
      { title: "Hospitality", body: "Hotels, restaurants, and event venues issue branded Cardixn profiles to their concierges — a modern business card that upgrades guest experience." },
    ],
  },
  security: {
    eyebrow: "Security and privacy",
    title: ["Your contacts are ", "yours, and nobody else's"],
    sub: "A modern digital business card platform touches the most personal data a professional has: names, phone numbers, direct emails, and the shape of a career network. Cardixn is engineered from the database up to make sure that data is protected.",
    cards: [
      { title: "Row-level database security", body: "Every table in Cardixn ships with row-level security policies at the database layer. A logged-in user can only ever read or modify their own cards and their own vault. Even a mistake in application code cannot leak another user's data — the database refuses the query." },
      { title: "Encryption at every layer", body: "TLS 1.3 in transit, AES-256 at rest, and cryptographically signed session tokens. Nothing you enter into Cardixn, whether it is a private phone number or a note on a saved contact, travels the network in plain text." },
      { title: "Verified authentication", body: "Sign in with Google or a verified email — no anonymous accounts. This kills the entire class of impersonation attacks that other business card platforms suffer from, and gives every card on the network a real, verified owner." },
      { title: "You own your network", body: "We do not sell contacts, we do not build shadow profiles from your vault, and we do not train external AI models on your data. Export your entire vault to vCard or CSV at any time and take it with you." },
    ],
  },
  analytics: {
    eyebrow: "Analytics",
    title: ["Understand which introductions ", "actually pay off"],
    sub: "Business networking is one of the last professional activities without a feedback loop. Cardixn analytics turn every card share into a measurable event, so you finally know what worked.",
    metrics: [
      { title: "Views", body: "Every time your public card loads, from any device or country." },
      { title: "Contact saves", body: "How many people tapped 'Save contact' and added you to their phone." },
      { title: "Reshares", body: "How many times your card link was forwarded, opened, or embedded elsewhere." },
      { title: "NFC taps", body: "Physical tap events from any programmed NFC business card." },
      { title: "QR scans", body: "Scans from any surface where your dynamic QR business card lives." },
      { title: "30-day timeline", body: "A rolling daily view of activity so you spot campaigns and events instantly." },
    ],
    liveLabel: "Live activity across all your cards",
    agoLabel: "30 days ago",
    todayLabel: "today",
  },
  crossPlatform: {
    eyebrow: "Cross-platform",
    title: ["Works on ", "everything you already own"],
    sub: "Cardixn is a mobile-first business card app that runs equally well on iPhone, Android, iPad, macOS, Windows, and Linux — from any modern browser. No download required, no store approval, no waiting.",
    cards: [
      { title: "iOS and Apple", body: "Add your Cardixn profile to the Home Screen for a native app feel. Save contacts export straight into the Contacts app. Share your card via the standard iOS share sheet." },
      { title: "Android and Google", body: "NFC broadcasting works out of the box in Chrome on Android. Contacts sync into Google Contacts and are searchable from Gmail, Meet, and Calendar within seconds." },
      { title: "Web everywhere", body: "macOS, Windows, Linux, ChromeOS. Any modern browser is a Cardixn client. Edit a card at a desktop, share it from a phone — the same profile in real time." },
    ],
  },
  integrations: {
    eyebrow: "Integrations",
    title: ["Connects to ", "every tool you already use"],
    items: [
      { title: "Any social platform", body: "Show LinkedIn, Instagram, X, YouTube, TikTok, Behance, GitHub, Dribbble, Threads, WhatsApp and 20+ more as branded chips." },
      { title: "Contacts everywhere", body: "One-tap export to Apple Contacts, Google Contacts, and Outlook via vCard. Nothing to sync, nothing to configure." },
      { title: "Calendar links", body: "Attach Calendly, Cal.com, Google Calendar or a custom booking link so introductions become meetings the same week." },
      { title: "Portfolio and media", body: "Link your Behance case studies, YouTube channel, Vimeo showreel, or Notion page — Cardixn renders each with its native brand color." },
    ],
  },
  stats: {
    items: [
      { n: "20", u: "Languages supported", body: "Full UI + card content in 20 languages with automatic RTL for Arabic, Hebrew, Persian and Urdu." },
      { n: "19", u: "Luxury templates", body: "From Noir and Platinum to Aurora and Cosmic — every template hand-tuned for typographic quality." },
      { n: "2s", u: "AI card scan", body: "Average time to extract every field from a photographed paper business card." },
      { n: "0", u: "Recipient apps", body: "Nobody has to install anything. Cardixn works with any camera and any browser." },
      { n: "∞", u: "Cards per account", body: "Personal, freelance, side-project — create as many digital business cards as you need." },
      { n: "30d", u: "Analytics window", body: "A rolling daily activity view for every card you own." },
    ],
  },
  testimonials: {
    eyebrow: "Loved by professionals",
    title: ["Trusted by ", "networkers around the world"],
    quotes: [
      { name: "Sara Al-Mutairi", role: "Design Director, Riyadh", quote: "I stopped carrying paper cards a year ago. My Cardixn profile has been shared at three international conferences and I have never once had to reprint. The analytics alone are worth the switch." },
      { name: "Michael Bryant", role: "Real Estate Broker, Austin", quote: "At an open house I used to hand out 40 cards and hear from maybe two people. Now I share my Cardixn link with a tap, and I can see exactly which visitors saved my contact the same day. My follow-up close rate is up 30 percent." },
      { name: "Yuki Tanaka", role: "Startup Founder, Tokyo", quote: "The multilingual support is the reason I picked Cardixn over three other apps. My card renders perfectly in Japanese, English, and Simplified Chinese — one profile, three markets." },
      { name: "Lucía Fernández", role: "Product Lead, Barcelona", quote: "The AI bio writer nailed the tone on the first try. I edited two words and shipped it. It reads like something I would have paid a copywriter for." },
      { name: "David Okafor", role: "Consultant, Lagos", quote: "I scanned 82 paper cards from a conference in about 20 minutes on the flight home. Every one landed in my vault with notes about where I met the person. Genuinely one of the most useful tools I have added to my workflow." },
      { name: "Priya Sharma", role: "Attorney, Mumbai", quote: "The Platinum template looks like the letterhead of a firm three times my size. That is not a small thing when a first impression closes a retainer." },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    title: ["Everything about ", "digital business cards"],
    items: [
      { q: "What is a digital business card?", a: "A digital business card is an electronic version of a traditional printed card. Instead of paper, your contact information lives at a shareable web link and can be delivered via QR code, NFC tap, direct message, or email. Recipients see your card in any browser, without installing an app, and can save the contact into their phone with one tap." },
      { q: "Is Cardixn free?", a: "Yes. Cardixn has a permanent free tier that includes unlimited digital business cards, all 19 templates, QR code sharing, the AI paper card scanner, and the contact vault. Premium plans unlock team features, custom domains, and advanced analytics." },
      { q: "How do I create a digital business card?", a: "Sign in to Cardixn, open the card editor, pick one of the 19 templates, and fill in your name, title, company, phone, and social profiles. Use the AI bio button to generate a polished professional bio in seconds. Publish and share the link — you have created a digital business card in under two minutes." },
      { q: "Does the recipient need an app?", a: "No. The most important design decision in Cardixn is that recipients never install anything. Every card is a live public web page. Any camera can scan the QR, any Android phone can receive the NFC tap, and any browser will render the card and offer a one-tap 'Save contact' button." },
      { q: "How does the NFC business card feature work?", a: "There are two ways to use NFC with Cardixn. First, you can broadcast your card directly from Chrome on Android via Web NFC — no accessory required. Second, you can program any blank NTAG213 or NTAG215 NFC business card with your Cardixn URL, then tap it against any modern phone. Both open your live card instantly." },
      { q: "Can Cardixn scan paper business cards?", a: "Yes. Cardixn includes an AI-powered business card scanner that uses OCR to extract the name, title, company, phone, email, website, and address from a photographed paper card in about two seconds. Scanned contacts are saved into your private vault with optional notes and tags." },
      { q: "Which languages does Cardixn support?", a: "Cardixn supports 20 languages including English, Arabic, French, Spanish, German, Italian, Portuguese, Russian, Turkish, Dutch, Polish, Chinese Simplified, Chinese Traditional, Japanese, Korean, Hindi, Indonesian, Malay, Thai and Vietnamese. Right-to-left languages render natively and correctly." },
      { q: "How is Cardixn different from other business card apps?", a: "Three ways. First, Cardixn ships 19 luxury templates that were designed by hand rather than generated from a form. Second, every advanced feature — AI OCR scanning, NFC broadcasting, multilingual profiles, analytics — is included, not sold as an add-on. Third, recipients never need to install anything, which is unusual in the category." },
      { q: "Is my data safe?", a: "Yes. Cardixn uses row-level security at the database layer so a user can only ever access their own data. All traffic is TLS 1.3, all data at rest is AES-256 encrypted, and we never sell contacts, build shadow profiles, or train third-party AI on your data." },
      { q: "Can I use Cardixn for my whole company?", a: "Yes. Cardixn supports team accounts with shared templates, centralized brand control, per-employee analytics, and role-based access. Contact us for enterprise deployments — we run companies with thousands of employees on the same platform." },
      { q: "Do you offer a business card generator or business card maker?", a: "Cardixn is a business card generator, business card maker, and business card management platform in one. You can generate a card from a template in seconds, edit every field live, and manage every card you have ever created from a single dashboard." },
      { q: "Can I use Cardixn as a QR business card only?", a: "Absolutely. If you already carry paper cards you love, use Cardixn as a dynamic QR business card overlay: print or attach the QR to your existing card, and the QR now leads to a live, editable digital profile with your latest information." },
    ],
  },
  articles: {
    eyebrow: "Learn",
    title: ["From the ", "Cardixn journal"],
    sub: "Guides, playbooks, and case studies on modern professional networking and the future of the business card.",
    posts: [
      { title: "How to create a digital business card that converts", body: "A field guide to writing the bio, choosing the template, and picking the CTAs that make your card actually generate follow-ups." },
      { title: "Paper vs digital business cards: a 2026 breakdown", body: "Why 88 percent of paper cards are discarded within a week, and what the switch to digital is doing to sustainability and cost." },
      { title: "The complete guide to NFC business cards", body: "How Web NFC works, which NTAG chip to buy, and how to program a physical NFC business card with your Cardixn profile." },
    ],
    readCta: "Read guide",
  },
  finalCta: {
    title: ["Your paper business card just retired.", "Meet the one that replaces it."],
    sub: "Free forever for personal use. No credit card. No recipient app. Set up in under two minutes.",
    button: "Create your digital business card",
  },
};

/* ============================================================ */
/* Translation helper: for locales where a hand-authored          */
/* translation is not yet supplied, we auto-generate by taking     */
/* the English shape and applying a per-locale label map so at     */
/* least every visible headline/eyebrow reads in the local        */
/* language and the JSON-LD FAQ still ships in that locale.       */
/* ============================================================ */

type Labels = {
  // sections/eyebrows
  whyGoDigital: string; retiring: string; whyCardixn: string; keepUsing: string;
  howItWorks: string; effortless: string; digitalVsPaper: string; paperCard: string;
  digitalVsDigital: string; otherApps: string; everyProfession: string; forEveryProfessional: string;
  everyIndustry: string; fitsYourIndustry: string; securityPrivacy: string; yoursAndNobody: string;
  analytics: string; payOff: string; crossPlatform: string; everythingYouOwn: string;
  integrations: string; everyTool: string; loved: string; networkersWorld: string;
  commonQuestions: string; everythingAbout: string; learn: string; journal: string;
  bestPick: string; readCta: string;
  // final cta
  ctaTitle: string; ctaTitleAccent: string; ctaSub: string; ctaButton: string;
  // Analytics chart labels
  live: string; ago30: string; today: string;
  // Comparison headers
  hFeature: string; hCardixn: string; hPaper: string;
};

/* We keep the EN as the source of truth. Overlay applies only the       */
/* strings the given locale supplies; anything missing falls back to EN. */
function overlay(base: SeoContent, ov: DeepPartial<SeoContent>): SeoContent {
  const merged = JSON.parse(JSON.stringify(base)) as SeoContent;
  deepMerge(merged as unknown as Record<string, unknown>, ov as unknown as Record<string, unknown>);
  return merged;
}
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
function deepMerge(dst: Record<string, unknown>, src: Record<string, unknown>): void {
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (Array.isArray(v)) {
      dst[k] = v;
    } else if (v && typeof v === "object") {
      if (!dst[k] || typeof dst[k] !== "object") dst[k] = {};
      deepMerge(dst[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else if (v !== undefined) {
      dst[k] = v;
    }
  }
}

/* Helper to build a whole SeoContent from a compact per-locale spec.
   Every locale below supplies the full set of translated
   headings/eyebrows/lists in its language. Bodies are compact but
   native. If a body is omitted for a specific item it stays in English,
   preserving keyword density while still shipping a genuinely
   localized page. */
function tr(o: DeepPartial<SeoContent>): SeoContent { return overlay(en, o); }

/* ============================================================ */
/* Arabic (RTL)                                                  */
/* ============================================================ */
const ar: SeoContent = tr({
  whyDigital: {
    eyebrow: "لماذا تنتقل للرقمي",
    title: ["البطاقة الورقية تتقاعد ", "بهدوء"],
    sub: "البطاقة الرقمية ليست مجرد نسخة بلا ورق من فكرة قديمة، بل أداة مختلفة كلياً: ديناميكية، قابلة للقياس، سهلة المشاركة، ومستحيلة الفقدان. لهذا يتحوّل المحترفون حول العالم إلى بطاقات العمل الإلكترونية في المؤتمرات، الاجتماعات، والتعارف اليومي.",
    items: [
      { title: "صديقة للبيئة بطبيعتها", body: "تُستهلك سنوياً أكثر من 7 ملايين شجرة لإنتاج بطاقات ورقية، ويُرمى نحو 88% منها خلال أسبوع. بطاقة Cardixn واحدة تُلغي هذا الهدر تماماً وتحلّ محل آلاف البطاقات على مدى مهنة كاملة." },
      { title: "دائماً محدّثة", body: "غيّر مسمّاك الوظيفي أو رقمك أو أضف رابطاً جديداً، فيرى كل من حفظ بطاقتك التحديث لحظياً. البطاقة الورقية قديمة لحظة طباعتها؛ الرقمية تنمو مع مسيرتك." },
      { title: "أسرع من أي تبادل", body: "لمسة، مسح، أو رابط. مشاركة هويتك المهنية يجب أن تستغرق ثانية واحدة لا مناورة جيب محرجة. المستلم لا يحتاج تطبيقاً ولا حساباً." },
      { title: "تكلفة أقل بشكل جذري", body: "المحترف العادي ينفق 75 إلى 200 دولار سنوياً على الطباعة والتعديلات. Cardixn يمنحك بطاقات لا محدودة وقوالب لا محدودة وتحديثات مدى الحياة بجزء بسيط من هذه التكلفة." },
    ],
    closing: "الانتقال من الورق إلى منصة بطاقات رقمية ليس موضة، بل يعكس الانتقال من التقويم الورقي إلى تقويم الهاتف، ومن بطاقة الصعود المطبوعة إلى المحفظة الرقمية. البطاقات ببساطة آخر قطعة من الهوية المهنية لم تُعَد بناؤها للعمل الحديث — وCardixn صُمم ليكون هذا التجديد.",
  },
  whyCardixn: {
    eyebrow: "لماذا Cardixn",
    title: ["منصّة بطاقات الأعمال ", "التي يستخدمها المحترفون فعلاً"],
    sub: "Cardixn حلّ متكامل للبطاقات الرقمية، لا مجرد مولّد باركود بصفحة هبوط. كل قدرة، من مسح OCR بالذكاء الاصطناعي إلى بثّ NFC والملفات متعدّدة اللغات، مصمّمة كمنتج واحد متماسك.",
    pillars: [
      { title: "الذكاء الاصطناعي في المركز", body: "يكتب Cardixn سيرتك المهنية، يترجم بطاقتك إلى 20 لغة، ويستخرج كل حقل من صورة بطاقة ورقية في أقل من ثانيتين. الذكاء الاصطناعي منسوج في كل خطوة." },
      { title: "19 قالباً فاخراً", body: "كل قالب مصمّم يدوياً بجودة طباعية: نوار، أورورا، بلاتينيوم، ماربل، كوزميك، إميرالد، نيون، وأكثر. غيّر اللون فيتغيّر كل شيء لحظياً." },
      { title: "أمان بمستوى المؤسسات", body: "أمان على مستوى الصفوف، تشفير كامل، مصادقة موثّقة، وملكية كاملة لبياناتك. جهات اتصالك ملكك، ولن نبيعها أبداً." },
      { title: "20 لغة، RTL و LTR", body: "دعم كامل للعربية والعبرية والفارسية و17 لغة أخرى مع عرض تلقائي من اليمين لليسار. النسخ المترجمة مفهرسة بشكل مستقل لتحسين SEO محلياً." },
      { title: "تحليلات حقيقية", body: "شاهد عدد مرات المشاهدة والحفظ والنقر والمشاركة على مدى 30 يوماً. تحليلاتك خاصة بك وحدك." },
      { title: "مبني للنمو", body: "من مستقل فردي إلى مؤسسة بعشرة آلاف موظف، Cardixn يخدم الجميع بنفس البنية التحتية، مع أدوار وعلامة موحّدة." },
    ],
  },
  deepFeatures: {
    eyebrow: "كيف يعمل، بعمق",
    title: ["أربع تقنيات تجعل بطاقة العمل ", "تبدو سهلة"],
    blocks: [
      { eyebrow: "بطاقة QR", title: "باركود ديناميكي يبقى ملكك للأبد",
        body: "كل ملف Cardixn يأتي مع باركود ديناميكي عالي الدقة. يشفّر الباركود رابطاً قصيراً بدلاً من البيانات نفسها، لتغيّر البطاقة خلفه دون إعادة طباعة أبداً.",
        bullets: ["قابل للتنزيل بدقة 2000×2000 للطباعة والشارات", "يعيد التلوين تلقائياً ليطابق لون بطاقتك", "يعمل مع كاميرا كل iPhone وAndroid منذ 2018", "قابل للتتبّع — كل مسح يُسجَّل في تحليلاتك", "باركود واحد يُستخدم عبر آلاف نقاط الاتصال"] },
      { eyebrow: "بطاقة NFC", title: "شارك بلمسة، دون تطبيق للمستلم",
        body: "ابثّ ملفك عبر Web NFC ليستلمه أي هاتف Android حديث بلمسة. اربط نفس الرابط بأي بطاقة NFC فارغة (NTAG213/215) — ملصق، خشب، معدن، أو خاتم — فتحصل على بطاقة ذكية لا تحتاج إعادة طباعة.",
        bullets: ["بثّ NFC من Chrome على Android بلا تطبيق", "متوافق مع أي بطاقة أو خاتم NFC قابل للبرمجة", "نفس الرابط يعمل مع كاميرا iPhone (QR) ولمسة Android (NFC)", "قابل لإعادة الكتابة من لوحة تحكّمك", "المستلم يرى البطاقة في Safari أو Chrome دون تنزيل"] },
      { eyebrow: "ماسح البطاقات", title: "حوّل أي بطاقة ورقية إلى جهة اتصال محفوظة",
        body: "وجّه الكاميرا لأي بطاقة مطبوعة — عربية، إنجليزية، صينية، يابانية أو مختلطة — ويستخرج Cardixn الاسم والمسمى والشركة والهاتف والبريد والعنوان في ثانية أو اثنتين.",
        bullets: ["OCR متعدّد اللغات مدرَّب على 40+ تنسيقاً", "التقاط مباشر أو رفع صورة موجودة", "تصدير بلمسة إلى Apple وGoogle وOutlook", "أضف ملاحظات خاصة: مكان اللقاء، الموعد، الحجم", "امسح كومة بطاقات مؤتمر في دقائق"] },
      { eyebrow: "الكتابة بالذكاء الاصطناعي", title: "سيرة مهنية بصوتك",
        body: "انتهى حاجز الكاتب. مساعد Cardixn يقرأ دورك وشركتك ويصوغ سيرة أنيقة من 40 كلمة كأنها من كاتب محترف.",
        bullets: ["يطابق النبرة: رسمية للقانون، دافئة للضيافة، تقنية للهندسة", "ترجمة كل البطاقة إلى 20 لغة بنقرة", "قوالب وألوان مقترحة بناءً على قطاعك", "بلا حدود استخدام", "سيرتك لن تُستخدم لتدريب نماذج خارجية"] },
    ],
  },
  comparisonPaper: {
    eyebrow: "الرقمي مقابل الورقي",
    title: ["Cardixn مقابل ", "البطاقة الورقية"],
    sub: "مقارنة جنباً إلى جنب بين البطاقة الإلكترونية الحديثة والبطاقة المطبوعة التي حملها المحترفون لقرن.",
    headers: ["الميزة", "Cardixn رقمي", "بطاقة ورقية"],
    rows: [
      ["التكلفة السنوية", "أقل من 10 دولارات مع تحديثات لا محدودة", "75 – 200 دولار مع إعادة طباعة"],
      ["سرعة التحديث", "فوري، يراه كل جهات اتصالك", "فقط الطباعة الجديدة تعكس التغيير"],
      ["إجراء المستلم", "كاميرا أو لمسة، دون تطبيق", "إدخال يدوي"],
      ["التحليلات", "مشاهدات، حفظ، نقرات مُتتبَّعة", "لا يوجد"],
      ["الأثر البيئي", "صفر ورق، صفر شحن", "أكثر من 7 ملايين شجرة سنوياً"],
      ["تعدّد اللغات", "20 لغة، RTL و LTR", "تحتاج طباعة منفصلة لكل لغة"],
      ["القوالب والتصميم", "19 قالباً فاخراً قابلاً للتعديل حياً", "ثابت للطباعة"],
      ["إدارة جهات الاتصال", "خزنة، ملاحظات، وسوم، مزامنة حية", "شريط مطاطي في درج"],
      ["مدى المشاركة", "أي مكان في العالم عبر رابط", "وجهاً لوجه فقط"],
      ["خطر الفقدان", "متزامنة سحابياً", "تُفقد وتُرمى غالباً"],
    ],
  },
  comparisonApps: {
    eyebrow: "رقمي مقابل رقمي",
    title: ["Cardixn مقابل ", "تطبيقات البطاقات الأخرى"],
    sub: "ليست كل تطبيقات البطاقات الرقمية متساوية. هذه مقارنة أفضل منصّة رقمية بأدوات QR العامة والتطبيقات القديمة.",
    bestPick: "الاختيار الأفضل",
    cols: [
      { name: "Cardixn", rows: ["19 قالباً فاخراً مضمّناً", "ماسح OCR للبطاقات الورقية", "بثّ NFC من المتصفح", "20 لغة مع RTL", "لوحة تحليلات", "بلا تطبيق للمستلم", "ألوان مخصّصة + معاينة حية", "بطاقات لا محدودة مجاناً"] },
      { name: "مولّدات QR عامة", rows: ["صورة QR ثابتة واحدة", "لا قدرة مسح", "لا دعم NFC", "لغة واحدة", "لا تحليلات", "لا صفحة ملف عامة", "لا نظام قوالب", "إدارة روابط يدوية"] },
      { name: "تطبيقات بطاقات قديمة", rows: ["3-5 قوالب أساسية", "ماسح إضافة مدفوعة", "يشترط بيع بطاقة NFC", "غالباً بالإنجليزية فقط", "خلف جدار دفع", "المستلم يحتاج تطبيقهم", "ألوان ثابتة", "حدّ للبطاقات في الخطة المجانية"] },
    ],
  },
  useCases: {
    eyebrow: "لكل مهنة",
    title: ["بطاقة عمل رقمية ", "لكل محترف"],
    sub: "سواء كنت مصمّماً أو طبيباً أو وسيط عقارات أو مهندساً أو مؤسّساً، يتكيّف Cardixn مع طريقة تواصل قطاعك.",
    cases: [
      { title: "لروّاد الأعمال والمؤسّسين", body: "اجمع تمويلاً، أطلق، وتواصل دون أن تنفد بطاقاتك. حدّث دورك من 'مؤسّس' إلى 'رئيس تنفيذي' يوم إغلاق جولتك، وسيرى كل مستثمر التحديث." },
      { title: "لمديري المبيعات", body: "أرسل رابط Cardixn بعد كل مكالمة اكتشاف. اعرف من ضغط اتصال، ومن أضافك، ومن أعاد المشاركة داخلياً. إشارة حقيقية للـ pipeline." },
      { title: "للمصمّمين والمبدعين", body: "قوالب بدقة طباعية: ماربل، أورورا، نوار، كوزميك. اضبط لوناً مخصّصاً يطابق أعمالك فتبدو بطاقتك كدراسة حالة." },
      { title: "للمصوّرين ومنتجي الفيديو", body: "أظهر Instagram وBehance وYouTube كأزرار قابلة للضغط. تصبح بطاقتك بوابة لمعرض أعمالك." },
      { title: "للأطباء والعاملين في الصحّة", body: "شارك عنوان العيادة، خط WhatsApp للحجز، وسيرة بلغة المريض. مفيد جداً في السياحة العلاجية." },
      { title: "للمحامين والمكاتب", body: "قوالب هادئة كـ Platinum أو Ivory تعكس الجدّية. أضف تخصّصك وقيدك المهني مباشرة في السيرة." },
      { title: "للمهندسين والمعماريين", body: "أظهر LinkedIn وGitHub وموقع المكتب. أرفق الموقع لزيارات المواقع. أخيراً بطاقة تصمد بجانب موقع البناء لأنها في جيبك." },
      { title: "لوسطاء العقارات", body: "كل جولة عرض تصبح فرصة. شارك Cardixn بدل الورق، وتابع من فتح، حفظ، وأعاد المشاركة." },
      { title: "للمستقلين والمستشارين", body: "ملف واحد يعرض خدماتك، أسعارك، رابط تقويمك، ووسائل الدفع. حدّثه كلما تطوّرت عروضك." },
      { title: "للمدرّبين والاستشاريين", body: "قالب فاخر وسيرة بصوتك، مع رابط الحجز ليتحوّل التعارف إلى جلسات نفس الأسبوع." },
    ],
  },
  industries: {
    eyebrow: "كل صناعة",
    title: ["بطاقة تواصل مهنية ", "تناسب قطاعك"],
    items: [
      { title: "مؤسسات", body: "قوالب موحّدة لكل موظف، مع تحكّم مركزي بالعلامة وتحليلات لكل فريق." },
      { title: "التعليم", body: "الأساتذة، مسؤولو القبول، وخدمات التوظيف يشاركون بطاقات تربط بساعات المكتب والمنشورات." },
      { title: "التقنية", body: "GitHub، npm، ومواقع الأعمال كأزرار من الدرجة الأولى. بطاقة ذكية لهوية المطوّر." },
      { title: "المالية", body: "قوالب هادئة كـ Platinum وNoir تعكس الثقة. أضف الإفصاحات التنظيمية في السيرة." },
      { title: "العافية", body: "استوديوهات اليوغا، أخصّائيّو التغذية، والمعالجون يستخدمون لوحات دافئة." },
      { title: "الضيافة", body: "الفنادق والمطاعم تُصدر ملفات Cardixn لموظفي الاستقبال — بطاقة عصرية ترفع تجربة الضيف." },
    ],
  },
  security: {
    eyebrow: "الأمان والخصوصية",
    title: ["جهات اتصالك ", "ملكك لا ملك أحد آخر"],
    sub: "المنصّة تلمس أكثر البيانات الشخصية للمحترف: الأسماء، الأرقام، البريد المباشر، وشكل الشبكة المهنية. Cardixn مهندَس من قاعدة البيانات لأعلى لحماية هذا كله.",
    cards: [
      { title: "أمان على مستوى الصفوف", body: "كل جدول يشحن مع سياسات RLS على مستوى قاعدة البيانات. المستخدم لا يقرأ أو يعدّل إلا بياناته. حتى خطأ في الشيفرة لا يُسرّب بيانات آخرين." },
      { title: "تشفير في كل طبقة", body: "TLS 1.3 نقلاً، AES-256 تخزيناً، ورموز جلسة موقّعة. لا شيء تُدخله يمرّ نصّاً واضحاً." },
      { title: "مصادقة موثّقة", body: "دخول بـ Google أو بريد مُوثَّق — لا حسابات مجهولة. يقتل هذا فئة كاملة من هجمات انتحال الهوية." },
      { title: "أنت تملك شبكتك", body: "لا نبيع جهات الاتصال، لا نبني ملفات ظلّ، ولا ندرّب نماذج AI خارجية على بياناتك. صدّر خزنتك متى أردت." },
    ],
  },
  analytics: {
    eyebrow: "التحليلات",
    title: ["افهم أيّ تعارف ", "يؤتي ثماره فعلاً"],
    sub: "التواصل المهني من آخر الأنشطة بلا حلقة تغذية راجعة. تحليلات Cardixn تحوّل كل مشاركة إلى حدث قابل للقياس.",
    metrics: [
      { title: "المشاهدات", body: "كل مرة تُحمَّل بطاقتك، من أي جهاز أو بلد." },
      { title: "حفظ جهات الاتصال", body: "كم شخصاً ضغط 'حفظ جهة اتصال' وأضافك إلى هاتفه." },
      { title: "إعادة المشاركة", body: "كم مرة أُعيد إرسال رابطك أو فُتح في مكان آخر." },
      { title: "لمسات NFC", body: "أحداث اللمس الفعلية من أي بطاقة NFC مبرمجة." },
      { title: "مسحات QR", body: "المسحات من أي سطح تظهر عليه بطاقتك." },
      { title: "خط زمن 30 يوماً", body: "عرض يومي متجدّد لتلاحظ الحملات والفعاليات فوراً." },
    ],
    liveLabel: "نشاط حي عبر كل بطاقاتك",
    agoLabel: "قبل 30 يوماً",
    todayLabel: "اليوم",
  },
  crossPlatform: {
    eyebrow: "متعدّد المنصّات",
    title: ["يعمل على ", "كل ما تملكه"],
    sub: "Cardixn تطبيق بطاقات يعمل بالكفاءة نفسها على iPhone وAndroid وiPad وmacOS وWindows وLinux — من أي متصفّح حديث. بلا تنزيل أو انتظار موافقة متجر.",
    cards: [
      { title: "iOS وApple", body: "أضف ملفك إلى الشاشة الرئيسية لتجربة أشبه بتطبيق أصلي. تصدير جهات الاتصال مباشرة إلى تطبيق Contacts." },
      { title: "Android وGoogle", body: "بثّ NFC جاهز في Chrome على Android. جهات الاتصال تُزامَن مع Google Contacts وتظهر في Gmail وMeet." },
      { title: "الويب في كل مكان", body: "macOS، Windows، Linux، ChromeOS. أي متصفّح حديث عميل Cardixn. عدّل من سطح المكتب وشارك من الهاتف." },
    ],
  },
  integrations: {
    eyebrow: "التكاملات",
    title: ["يتصل بكل ", "أداة تستخدمها"],
    items: [
      { title: "أي منصّة اجتماعية", body: "LinkedIn، Instagram، X، YouTube، TikTok، Behance، GitHub، Dribbble، Threads، WhatsApp و20+ أخرى كأزرار مميّزة." },
      { title: "جهات اتصال في كل مكان", body: "تصدير بلمسة إلى Apple وGoogle وOutlook عبر vCard. لا مزامنة ولا تهيئة." },
      { title: "روابط التقويم", body: "أرفق Calendly، Cal.com، Google Calendar أو رابط حجز مخصّص لتتحوّل التعارفات إلى اجتماعات." },
      { title: "الأعمال والوسائط", body: "اربط Behance وYouTube وVimeo وNotion — يعرضها Cardixn بألوانها الأصلية." },
    ],
  },
  stats: {
    items: [
      { n: "20", u: "لغة مدعومة", body: "واجهة ومحتوى بطاقات في 20 لغة مع RTL تلقائي للعربية والعبرية والفارسية والأردية." },
      { n: "19", u: "قالب فاخر", body: "من Noir وPlatinum إلى Aurora وCosmic — كل قالب مضبوط بجودة طباعية." },
      { n: "٢ث", u: "مسح بطاقة بالذكاء الاصطناعي", body: "متوسط وقت استخراج الحقول من صورة بطاقة ورقية." },
      { n: "0", u: "تطبيقات للمستلم", body: "لا أحد يحتاج تنزيل شيء. Cardixn يعمل مع أي كاميرا وأي متصفّح." },
      { n: "∞", u: "بطاقات لكل حساب", body: "شخصية، مستقلّة، مشاريع جانبية — أنشئ ما تحتاج." },
      { n: "٣٠ي", u: "نافذة تحليلات", body: "عرض نشاط يومي متجدّد لكل بطاقاتك." },
    ],
  },
  testimonials: {
    eyebrow: "محبوب من المحترفين",
    title: ["يثق به ", "المتواصلون حول العالم"],
    quotes: [
      { name: "سارة المطيري", role: "مديرة تصميم، الرياض", quote: "توقّفت عن حمل البطاقات الورقية قبل عام. شاركت ملف Cardixn في ثلاثة مؤتمرات دولية ولم أُعِد الطباعة أبداً. التحليلات وحدها تستحق التحوّل." },
      { name: "مايكل براينت", role: "وسيط عقارات، أوستن", quote: "كنت أوزّع 40 بطاقة وأسمع من اثنين. الآن أشارك رابطي بلمسة، وأرى من حفظ. نسبة إغلاق المتابعة ارتفعت 30٪." },
      { name: "يوكي تاناكا", role: "مؤسّس شركة ناشئة، طوكيو", quote: "الدعم متعدّد اللغات هو السبب. بطاقتي تظهر بالكامل باليابانية والإنجليزية والصينية — ملف واحد وثلاثة أسواق." },
      { name: "لوسيا فرنانديز", role: "قائدة منتج، برشلونة", quote: "كاتب السيرة بالذكاء الاصطناعي أصاب النبرة من أول محاولة. عدّلت كلمتين ونشرت." },
      { name: "ديفيد أوكافور", role: "مستشار، لاغوس", quote: "مسحت 82 بطاقة ورقية من مؤتمر خلال 20 دقيقة في الطائرة. كلّها في خزنتي مع ملاحظاتي." },
      { name: "بريا شارما", role: "محامية، مومباي", quote: "قالب Platinum يبدو كترويسة مكتب أكبر بثلاث مرات. ليست تفصيلة صغيرة حين ينفذ الانطباع الأول عقداً." },
    ],
  },
  faq: {
    eyebrow: "أسئلة شائعة",
    title: ["كل شيء عن ", "بطاقات الأعمال الرقمية"],
    items: [
      { q: "ما هي بطاقة العمل الرقمية؟", a: "نسخة إلكترونية من البطاقة المطبوعة التقليدية. معلوماتك تعيش على رابط قابل للمشاركة وتُرسَل عبر QR أو لمسة NFC أو رسالة. يراها المستلم في أي متصفّح دون تطبيق." },
      { q: "هل Cardixn مجاني؟", a: "نعم. خطة مجانية دائمة تتضمّن بطاقات لا محدودة، كل الـ 19 قالباً، مشاركة QR، ماسح البطاقات، وخزنة جهات الاتصال. الخطط المدفوعة تفتح ميزات الفرق." },
      { q: "كيف أنشئ بطاقة رقمية؟", a: "سجّل الدخول، افتح المحرّر، اختر قالباً، واملأ بياناتك. استخدم زر السيرة الذكية للحصول على سيرة مصقولة خلال ثوان. انشر وشارك." },
      { q: "هل يحتاج المستلم تطبيقاً؟", a: "لا. أهم قرار تصميمي: المستلم لا يثبّت شيئاً. كل بطاقة صفحة ويب حية." },
      { q: "كيف تعمل ميزة NFC؟", a: "طريقتان: بثّ من Chrome على Android دون ملحق، أو برمجة بطاقة NTAG213/215 برابطك ثم لمسها بأي هاتف." },
      { q: "هل يمسح Cardixn البطاقات الورقية؟", a: "نعم. ماسح OCR ذكي يستخرج الاسم والمسمى والشركة والهاتف والبريد والعنوان في نحو ثانيتين." },
      { q: "ما اللغات المدعومة؟", a: "20 لغة تشمل العربية والإنجليزية والفرنسية والإسبانية والألمانية والإيطالية والبرتغالية والروسية والتركية والصينية واليابانية والكورية وغيرها. لغات RTL تُعرَض بشكل أصلي." },
      { q: "كيف يختلف Cardixn عن غيره؟", a: "قوالب فاخرة يدوية، كل الميزات المتقدّمة مضمّنة، والمستلم لا يحتاج تطبيقاً." },
      { q: "هل بياناتي آمنة؟", a: "نعم. RLS على قاعدة البيانات، TLS 1.3، AES-256، ولا نبيع البيانات أو نتدرّب عليها." },
      { q: "هل أستخدمه لشركتي كلها؟", a: "نعم. حسابات فرق، قوالب مشتركة، تحكّم مركزي، تحليلات لكل موظف." },
      { q: "هل تقدّمون مولّد بطاقات؟", a: "Cardixn مولّد ومحرّر ومدير بطاقات في منصّة واحدة." },
      { q: "هل أستخدمه كبطاقة QR فقط؟", a: "بالتأكيد. اطبع QR على بطاقتك الحالية ليقود إلى ملف حي قابل للتعديل." },
    ],
  },
  articles: {
    eyebrow: "تعلّم",
    title: ["من ", "مدوّنة Cardixn"],
    sub: "أدلّة ودراسات حالة عن التواصل المهني الحديث ومستقبل بطاقة العمل.",
    posts: [
      { title: "كيف تُنشئ بطاقة رقمية تحوّل", body: "دليل ميداني لكتابة السيرة واختيار القالب وأزرار الدعوة التي تُنتج متابعات فعلية." },
      { title: "الورقي مقابل الرقمي: تحليل 2026", body: "لماذا يُرمى 88٪ من البطاقات الورقية خلال أسبوع، وأثر التحوّل الرقمي على الاستدامة والتكلفة." },
      { title: "الدليل الشامل لبطاقات NFC", body: "كيف يعمل Web NFC، أي شريحة NTAG تشتري، وكيف تبرمج بطاقة NFC فعلية." },
    ],
    readCta: "اقرأ الدليل",
  },
  finalCta: {
    title: ["بطاقتك الورقية تقاعدت للتو.", "قابل التي تحلّ محلّها."],
    sub: "مجاني للاستخدام الشخصي إلى الأبد. بلا بطاقة ائتمان. بلا تطبيق للمستلم. الإعداد في أقل من دقيقتين.",
    button: "أنشئ بطاقتك الرقمية",
  },
});

/* ============================================================ */
/* French                                                        */
/* ============================================================ */
const fr: SeoContent = tr({
  whyDigital: {
    eyebrow: "Pourquoi passer au numérique",
    title: ["La carte de visite papier prend ", "discrètement sa retraite"],
    sub: "Une carte de visite numérique n'est pas la version sans papier d'une vieille idée. C'est un outil totalement différent : dynamique, mesurable, partageable et impossible à perdre. C'est pourquoi les professionnels du monde entier passent à la carte de visite électronique pour les événements, les rendez-vous commerciaux et leurs présentations quotidiennes.",
    items: [
      { title: "Durable par conception", body: "Plus de 7 millions d'arbres sont abattus chaque année pour produire des cartes papier, et près de 88 % sont jetées en une semaine. Une carte Cardixn supprime ce gaspillage." },
      { title: "Toujours à jour", body: "Modifiez votre titre, votre numéro ou un lien : tous vos contacts voient l'information mise à jour instantanément. Une carte papier est obsolète dès son impression." },
      { title: "Plus rapide que tout échange", body: "Un tap, un scan, un lien. Partager votre identité professionnelle doit prendre une seconde, pas la fouille embarrassante d'une poche." },
      { title: "Coût radicalement inférieur", body: "Un professionnel dépense entre 75 et 200 $ par an en cartes papier et retirages. Cardixn offre des cartes et des mises à jour illimitées pour une fraction de ce coût." },
    ],
    closing: "Le passage du papier à une plateforme de cartes de visite numériques n'est pas une mode. Il reflète le passage de l'agenda papier au calendrier téléphone, de la carte d'embarquement imprimée au portefeuille mobile. La carte de visite est simplement la dernière pièce de l'identité professionnelle pré-numérique — et Cardixn est conçu pour être précisément cette refonte.",
  },
  whyCardixn: {
    eyebrow: "Pourquoi Cardixn",
    title: ["La plateforme de cartes que ", "les pros utilisent vraiment"],
    sub: "Cardixn est une solution complète de carte de visite numérique, pas un générateur de QR avec une page d'accueil. De l'OCR IA au NFC en passant par les profils multilingues, tout forme un produit cohérent.",
    pillars: [
      { title: "L'IA au cœur", body: "Cardixn rédige votre bio, traduit votre carte en 20 langues et extrait chaque champ d'une carte photographiée en moins de deux secondes." },
      { title: "19 modèles de luxe", body: "Noir, Aurora, Platinum, Marble, Cosmic, Emerald, Neon… Changez la couleur d'accent et tout se recolore instantanément." },
      { title: "Sécurité entreprise", body: "Sécurité au niveau des lignes, chiffrement en transit, authentification vérifiée. Vos contacts vous appartiennent." },
      { title: "20 langues, RTL & LTR", body: "Arabe, hébreu, persan et 17 autres langues avec rendu automatique de droite à gauche. Chaque version est indexée séparément." },
      { title: "Analytique réelle", body: "Vues, sauvegardes, taps et partages sur 30 jours. Vos statistiques restent privées." },
      { title: "Conçu pour l'échelle", body: "Du freelance à l'entreprise de 10 000 personnes, même infrastructure, avec rôles et charte partagés." },
    ],
  },
  deepFeatures: {
    eyebrow: "Comment ça marche, en détail",
    title: ["Quatre technologies pour rendre la carte ", "sans effort"],
    blocks: [
      { eyebrow: "Carte QR", title: "Un QR dynamique qui reste à vous pour toujours",
        body: "Chaque profil Cardixn inclut un QR dynamique en haute résolution. Le code encode une URL courte, pas les données, ce qui permet de refondre la carte sans jamais réimprimer.",
        bullets: ["Téléchargeable en PNG 2000×2000", "Recoloré automatiquement selon votre accent", "Compatible avec l'appareil photo natif iPhone/Android depuis 2018", "Traçable — chaque scan est journalisé", "Un seul QR réutilisable sur des milliers de supports"] },
      { eyebrow: "Carte NFC", title: "Partagez d'un tap, sans app pour le destinataire",
        body: "Diffusez votre profil via Web NFC et laissez tout Android moderne le recevoir d'un tap. Associez la même URL à toute carte NFC vierge (NTAG213/215).",
        bullets: ["Diffusion Web NFC depuis Chrome Android — sans app", "Compatible avec toute carte ou bague NFC programmable", "Même URL pour QR iPhone et NFC Android", "Réinscriptible depuis le tableau de bord", "Le destinataire voit la carte dans Safari/Chrome, sans téléchargement"] },
      { eyebrow: "Scanner de cartes", title: "Transformez toute carte papier en contact numérique",
        body: "Pointez l'appareil photo sur toute carte imprimée — français, arabe, chinois, japonais, cyrillique ou mixte — et Cardixn extrait chaque champ en une à deux secondes.",
        bullets: ["OCR multilingue entraîné sur 40+ formats", "Capture caméra ou upload d'une photo", "Export en un tap vers Apple, Google, Outlook", "Notes privées : lieu, date de relance, taille du deal", "Scannez une pile entière en quelques minutes"] },
      { eyebrow: "Écriture IA", title: "Une bio pro dans votre voix",
        body: "L'assistant Gemini de Cardixn lit votre rôle et rédige une bio soignée de 40 mots. Régénérez autant que vous voulez, puis éditez librement.",
        bullets: ["Ton adapté : autoritaire (droit/finance), chaleureux (hospitalité), technique (ingénierie)", "Traduction en 20 langues d'un clic", "Modèle et palette suggérés selon votre secteur", "Aucune limite d'usage", "Votre bio n'entraîne aucun modèle externe"] },
    ],
  },
  comparisonPaper: {
    eyebrow: "Numérique vs papier",
    title: ["Cardixn face à ", "la carte de visite papier"],
    sub: "Comparaison directe entre la carte électronique moderne et la carte imprimée que les pros portent depuis un siècle.",
    headers: ["Fonction", "Cardixn numérique", "Carte papier"],
    rows: [
      ["Coût annuel", "Moins de 10 $, mises à jour illimitées", "75 – 200 $ avec réimpressions"],
      ["Vitesse de mise à jour", "Instantané, vu par tous vos contacts", "Seules les nouvelles impressions"],
      ["Action du destinataire", "Caméra ou tap, sans app", "Saisie manuelle"],
      ["Analytique", "Vues, saves, taps suivis", "Aucune"],
      ["Impact environnemental", "Zéro papier, zéro envoi", "7 M+ arbres/an"],
      ["Multilingue", "20 langues, RTL et LTR", "Impression séparée par langue"],
      ["Modèles et design", "19 modèles éditables en direct", "Figé à l'impression"],
      ["Gestion des contacts", "Coffre, notes, tags, sync live", "Un élastique dans un tiroir"],
      ["Portée du partage", "Partout via un lien", "En présentiel seulement"],
      ["Risque de perte", "Synchronisé cloud", "Souvent perdue ou jetée"],
    ],
  },
  comparisonApps: {
    eyebrow: "Numérique vs numérique",
    title: ["Cardixn face aux ", "autres apps de cartes"],
    sub: "Toutes les apps de cartes numériques ne se valent pas. Voici Cardixn comparé aux générateurs QR génériques et aux apps historiques.",
    bestPick: "Meilleur choix",
    cols: [
      { name: "Cardixn", rows: ["19 modèles de luxe inclus", "Scanner OCR IA intégré", "Diffusion NFC depuis le navigateur", "20 langues avec RTL", "Tableau de bord d'analytique", "Aucune app pour le destinataire", "Couleurs personnalisées + preview live", "Cartes illimitées en gratuit"] },
      { name: "Générateurs QR génériques", rows: ["Une image QR statique", "Aucun scan", "Pas de NFC", "Une langue", "Pas d'analytique", "Pas de profil public", "Pas de modèles", "Gestion manuelle des liens"] },
      { name: "Apps historiques", rows: ["3-5 modèles basiques", "Scanner en option payante", "Vente forcée d'une carte NFC", "Souvent anglais uniquement", "Derrière un paywall", "Le destinataire doit installer l'app", "Thèmes fixes", "Plafond en gratuit"] },
    ],
  },
  useCases: {
    eyebrow: "Pour chaque profession",
    title: ["Une carte numérique ", "pour chaque professionnel"],
    sub: "Designer, médecin, agent immobilier, ingénieur, fondateur : Cardixn s'adapte à la façon dont votre secteur réseaute.",
    cases: [
      { title: "Pour entrepreneurs et fondateurs", body: "Levez, lancez, réseautez sans jamais tomber en rupture. Passez de 'Fondateur' à 'CEO' le jour du closing — chaque investisseur voit la mise à jour." },
      { title: "Pour commerciaux et key accounts", body: "Envoyez votre lien après chaque discovery. Voyez qui a tapé, sauvegardé, transféré votre carte — un vrai signal pipeline." },
      { title: "Pour designers et créatifs", body: "Modèles taillés typographiquement : Marble, Aurora, Noir. Une couleur d'accent alignée à votre portfolio." },
      { title: "Pour photographes et vidéastes", body: "Instagram, Behance, YouTube en chips cliquables. Votre carte devient l'entrée d'un portfolio." },
      { title: "Pour médecins et cliniciens", body: "Adresse du cabinet, WhatsApp rendez-vous, bio dans la langue du patient — précieux en tourisme médical." },
      { title: "Pour avocats et cabinets", body: "Un Platinum ou Ivory sobre projette le sérieux attendu. Ajoutez inscriptions au barreau et spécialités." },
      { title: "Pour ingénieurs et architectes", body: "LinkedIn, GitHub, portfolio du cabinet, adresse pour visites. Enfin une carte qui survit à un chantier — elle vit sur le téléphone." },
      { title: "Pour agents immobiliers", body: "Chaque visite devient un lead. Voyez qui a ouvert, sauvegardé et repartagé votre profil." },
      { title: "Pour freelances et consultants", body: "Un profil qui montre services, tarifs, calendrier, paiements. Rafraîchissez-le à mesure que l'offre évolue." },
      { title: "Pour coachs et consultants", body: "Autorité par un modèle luxe et une bio IA dans votre voix. Le lien de réservation transforme la rencontre en session." },
    ],
  },
  industries: {
    eyebrow: "Chaque secteur",
    title: ["Une carte pro adaptée ", "à votre industrie"],
    items: [
      { title: "Entreprise", body: "Modèles unifiés pour chaque employé, contrôle centralisé de la marque, analytique par équipe." },
      { title: "Éducation", body: "Professeurs, admissions, orientation partagent des cartes vers permanences et publications." },
      { title: "Technologie", body: "GitHub, npm, portfolios en chips de premier plan. Une carte pour l'identité développeur." },
      { title: "Finance", body: "Modèles Platinum et Noir discrets qui projettent la confiance. Mentions réglementaires dans la bio." },
      { title: "Bien-être", body: "Yoga, nutrition, thérapie : palettes chaleureuses et layouts sociaux-first." },
      { title: "Hôtellerie", body: "Hôtels et restaurants équipent leurs concierges — une carte moderne qui améliore l'expérience client." },
    ],
  },
  security: {
    eyebrow: "Sécurité et confidentialité",
    title: ["Vos contacts sont ", "à vous, et à personne d'autre"],
    sub: "Une plateforme de cartes numériques touche aux données les plus personnelles d'un pro : noms, téléphones, emails, forme du réseau. Cardixn est conçu de la base de données vers le haut pour les protéger.",
    cards: [
      { title: "Sécurité au niveau des lignes", body: "Chaque table applique des politiques RLS. Un utilisateur ne peut lire ou modifier que ses données ; même une erreur applicative n'expose rien." },
      { title: "Chiffrement à toutes les couches", body: "TLS 1.3 en transit, AES-256 au repos, tokens signés. Rien ne circule en clair." },
      { title: "Authentification vérifiée", body: "Connexion Google ou email vérifié — pas d'anonymat. Cela tue la classe entière des attaques d'usurpation." },
      { title: "Vous possédez votre réseau", body: "Nous ne vendons pas les contacts et n'entraînons aucun modèle IA externe. Export vCard/CSV à tout moment." },
    ],
  },
  analytics: {
    eyebrow: "Analytique",
    title: ["Comprenez quelles rencontres ", "paient vraiment"],
    sub: "Le networking pro est l'une des dernières activités sans feedback loop. Cardixn rend chaque partage mesurable.",
    metrics: [
      { title: "Vues", body: "Chaque chargement de votre carte publique, depuis n'importe quel appareil ou pays." },
      { title: "Sauvegardes", body: "Combien ont tapé « Enregistrer » et vous ont ajouté à leur téléphone." },
      { title: "Repartages", body: "Combien de fois votre lien a été transféré, ouvert ou embarqué ailleurs." },
      { title: "Taps NFC", body: "Événements de tap depuis toute carte NFC programmée." },
      { title: "Scans QR", body: "Scans depuis chaque surface où vit votre QR dynamique." },
      { title: "Chronologie 30 jours", body: "Vue quotidienne roulante pour repérer campagnes et événements." },
    ],
    liveLabel: "Activité en direct sur toutes vos cartes",
    agoLabel: "il y a 30 jours",
    todayLabel: "aujourd'hui",
  },
  crossPlatform: {
    eyebrow: "Multiplateforme",
    title: ["Fonctionne sur ", "tout ce que vous possédez déjà"],
    sub: "Cardixn est une app de cartes de visite mobile-first qui tourne aussi bien sur iPhone, Android, iPad, macOS, Windows et Linux — depuis n'importe quel navigateur moderne.",
    cards: [
      { title: "iOS et Apple", body: "Ajoutez votre profil à l'écran d'accueil pour un effet natif. Sauvegarde directe dans Contacts." },
      { title: "Android et Google", body: "Diffusion NFC prête dans Chrome Android. Sync avec Google Contacts en quelques secondes." },
      { title: "Web partout", body: "macOS, Windows, Linux, ChromeOS. Édition sur desktop, partage sur mobile, en temps réel." },
    ],
  },
  integrations: {
    eyebrow: "Intégrations",
    title: ["Se connecte à ", "tous les outils que vous utilisez"],
    items: [
      { title: "Toute plateforme sociale", body: "LinkedIn, Instagram, X, YouTube, TikTok, Behance, GitHub, Dribbble, Threads, WhatsApp et 20+ en chips brandées." },
      { title: "Contacts partout", body: "Export en un tap vers Apple, Google et Outlook via vCard." },
      { title: "Liens de calendrier", body: "Calendly, Cal.com, Google Calendar ou lien perso : la rencontre devient réunion la semaine même." },
      { title: "Portfolio et médias", body: "Behance, YouTube, Vimeo, Notion — chacun rendu avec sa couleur native." },
    ],
  },
  stats: {
    items: [
      { n: "20", u: "Langues supportées", body: "UI et contenu en 20 langues avec RTL automatique pour l'arabe, l'hébreu, le persan et l'ourdou." },
      { n: "19", u: "Modèles de luxe", body: "De Noir à Cosmic — chacun réglé typographiquement à la main." },
      { n: "2s", u: "Scan IA", body: "Temps moyen pour extraire tous les champs d'une carte papier." },
      { n: "0", u: "App requise", body: "Personne n'installe rien. Toute caméra, tout navigateur." },
      { n: "∞", u: "Cartes par compte", body: "Perso, freelance, side-project — créez-en autant que nécessaire." },
      { n: "30j", u: "Fenêtre d'analytique", body: "Vue d'activité quotidienne roulante pour chaque carte." },
    ],
  },
  testimonials: {
    eyebrow: "Adoré par les pros",
    title: ["Adopté par des ", "networkeurs du monde entier"],
    quotes: [
      { name: "Sara Al-Mutairi", role: "Directrice design, Riyad", quote: "J'ai arrêté le papier il y a un an. Mon Cardixn a été partagé à trois conférences, aucune réimpression. L'analytique seule vaut la bascule." },
      { name: "Michael Bryant", role: "Agent immobilier, Austin", quote: "En open house je distribuais 40 cartes et j'avais deux retours. Avec Cardixn je vois qui a sauvegardé — mes closings sont +30 %." },
      { name: "Yuki Tanaka", role: "Fondateur, Tokyo", quote: "Le multilingue m'a fait choisir Cardixn. Ma carte s'affiche parfaitement en japonais, anglais et chinois simplifié." },
      { name: "Lucía Fernández", role: "Product Lead, Barcelone", quote: "L'IA a trouvé le ton au premier essai. Deux mots édités, publié." },
      { name: "David Okafor", role: "Consultant, Lagos", quote: "82 cartes papier scannées en 20 minutes dans l'avion, toutes annotées." },
      { name: "Priya Sharma", role: "Avocate, Mumbai", quote: "Le modèle Platinum ressemble à l'en-tête d'un cabinet trois fois plus grand — décisif pour un premier retainer." },
    ],
  },
  faq: {
    eyebrow: "Questions fréquentes",
    title: ["Tout sur les ", "cartes de visite numériques"],
    items: [
      { q: "Qu'est-ce qu'une carte de visite numérique ?", a: "Une version électronique de la carte imprimée. Vos infos vivent à un lien partageable, envoyé par QR, NFC, message ou email. Aucune app requise pour le destinataire." },
      { q: "Cardixn est-il gratuit ?", a: "Oui. Offre gratuite permanente : cartes illimitées, 19 modèles, partage QR, scanner IA, coffre." },
      { q: "Comment créer ma carte ?", a: "Connectez-vous, ouvrez l'éditeur, choisissez un modèle, remplissez vos infos, générez votre bio avec l'IA, publiez." },
      { q: "Le destinataire a-t-il besoin d'une app ?", a: "Non. Chaque carte est une page web publique lisible par tout navigateur." },
      { q: "Comment fonctionne le NFC ?", a: "Diffusion Web NFC depuis Chrome Android, ou programmation d'une carte NTAG213/215 vierge." },
      { q: "Cardixn scanne-t-il les cartes papier ?", a: "Oui. OCR IA en environ deux secondes, sauvegardé dans votre coffre." },
      { q: "Quelles langues ?", a: "20 langues, dont l'arabe, le chinois, le japonais. RTL natif." },
      { q: "En quoi Cardixn diffère ?", a: "19 modèles luxe faits main, toutes les fonctions avancées incluses, aucun app côté destinataire." },
      { q: "Mes données sont-elles sûres ?", a: "Oui. RLS, TLS 1.3, AES-256, aucune revente, aucun entraînement de modèles externes." },
      { q: "Puis-je l'utiliser pour toute ma société ?", a: "Oui. Comptes équipe, modèles partagés, contrôle marque, analytique par employé." },
      { q: "Un générateur de cartes ?", a: "Cardixn est générateur, créateur et gestionnaire de cartes en une plateforme." },
      { q: "L'utiliser uniquement comme QR ?", a: "Oui. Imprimez le QR sur votre carte actuelle : il pointe vers un profil dynamique." },
    ],
  },
  articles: {
    eyebrow: "Apprendre",
    title: ["Depuis le ", "journal Cardixn"],
    sub: "Guides et études de cas sur le networking pro moderne et l'avenir de la carte de visite.",
    posts: [
      { title: "Créer une carte numérique qui convertit", body: "Un guide de terrain pour la bio, le modèle et les CTAs." },
      { title: "Papier vs numérique : le bilan 2026", body: "Pourquoi 88 % du papier finit à la poubelle en une semaine." },
      { title: "Le guide complet des cartes NFC", body: "Web NFC, choix de la puce NTAG, programmation." },
    ],
    readCta: "Lire le guide",
  },
  finalCta: {
    title: ["Votre carte papier vient de prendre sa retraite.", "Voici celle qui la remplace."],
    sub: "Gratuit à vie pour l'usage personnel. Sans carte de crédit. Sans app pour le destinataire. Prêt en moins de deux minutes.",
    button: "Créer ma carte numérique",
  },
});

/* ============================================================ */
/* Spanish                                                        */
/* ============================================================ */
const es: SeoContent = tr({
  whyDigital: {
    eyebrow: "Por qué pasar a lo digital",
    title: ["La tarjeta de visita en papel ", "se está jubilando"],
    sub: "Una tarjeta de visita digital no es solo la versión sin papel de una vieja idea. Es una herramienta completamente distinta: dinámica, medible, compartible e imposible de perder. Por eso los profesionales de todo el mundo cambian a la tarjeta electrónica para eventos, reuniones comerciales y presentaciones diarias.",
    items: [
      { title: "Sostenible por diseño", body: "Cada año se talan más de 7 millones de árboles para producir tarjetas de papel y el 88 % se descarta en una semana. Una tarjeta Cardixn elimina ese desperdicio." },
      { title: "Siempre al día", body: "Cambia tu cargo, tu número o un enlace: cada contacto ve la actualización al instante. Una tarjeta de papel queda obsoleta al imprimirse." },
      { title: "Más rápido que cualquier intercambio", body: "Un toque, un escaneo, un enlace. Compartir tu identidad debe llevar un segundo, no la incómoda búsqueda en el bolsillo." },
      { title: "Coste drásticamente menor", body: "Un profesional gasta 75-200 $ al año en impresiones. Cardixn ofrece tarjetas y actualizaciones ilimitadas por una fracción." },
    ],
    closing: "El paso del papel a una plataforma de tarjetas digitales no es moda. Refleja el cambio del calendario en papel al del móvil, del billete impreso a la cartera digital. La tarjeta de visita es simplemente la última pieza de la identidad profesional pre-digital — y Cardixn está construido para ser esa renovación.",
  },
  whyCardixn: {
    eyebrow: "Por qué Cardixn",
    title: ["La plataforma de tarjetas que ", "los profesionales sí usan"],
    sub: "Cardixn es una solución completa, no un generador de QR con una landing. Todo, de OCR IA a NFC y perfiles multilingües, está diseñado como un único producto coherente.",
    pillars: [
      { title: "IA en el centro", body: "Cardixn redacta tu bio, traduce tu tarjeta a 20 idiomas y extrae cada campo de una tarjeta fotografiada en menos de dos segundos." },
      { title: "19 plantillas de lujo", body: "Noir, Aurora, Platinum, Marble, Cosmic, Emerald, Neon y más. Cambia el color y todo se recolorea al instante." },
      { title: "Seguridad empresarial", body: "Seguridad a nivel de fila, cifrado en tránsito, autenticación verificada. Tus contactos son tuyos." },
      { title: "20 idiomas, RTL y LTR", body: "Árabe, hebreo, persa y 17 más con renderizado automático de derecha a izquierda. Cada versión se indexa por separado." },
      { title: "Analítica real", body: "Vistas, guardados, taps y compartidos en 30 días. Privados para ti." },
      { title: "Diseñado para escalar", body: "Del freelancer a la empresa de 10.000 personas, misma infraestructura, roles y marca compartida." },
    ],
  },
  deepFeatures: {
    eyebrow: "Cómo funciona, a fondo",
    title: ["Cuatro tecnologías para que la tarjeta ", "resulte sin esfuerzo"],
    blocks: [
      { eyebrow: "Tarjeta QR", title: "Un QR dinámico que sigue siendo tuyo para siempre",
        body: "Cada perfil incluye un QR dinámico de alta resolución. Codifica una URL corta y no los datos, así puedes rediseñar la tarjeta sin volver a imprimir.",
        bullets: ["Descargable en PNG 2000×2000", "Se recolorea con tu color de acento", "Compatible con la cámara nativa de iPhone/Android desde 2018", "Rastreable — cada escaneo se registra", "Un solo QR reutilizable en miles de puntos"] },
      { eyebrow: "Tarjeta NFC", title: "Comparte con un toque, sin app para el receptor",
        body: "Emite tu perfil por Web NFC para que cualquier Android moderno lo reciba con un toque. Vincula la misma URL a cualquier tarjeta NTAG213/215 vacía.",
        bullets: ["Emisión Web NFC desde Chrome Android sin app", "Compatible con cualquier tarjeta o anillo NFC programable", "Misma URL para QR iPhone y NFC Android", "Regrabable desde el panel", "El receptor la ve en Safari o Chrome"] },
      { eyebrow: "Escáner de tarjetas", title: "Convierte cualquier tarjeta de papel en contacto digital",
        body: "Apunta la cámara a cualquier tarjeta impresa — español, árabe, chino, japonés, cirílico o mixto — y Cardixn extrae cada campo en uno o dos segundos.",
        bullets: ["OCR multilingüe entrenado en 40+ formatos", "Cámara en vivo o subida de foto", "Exporta a Apple, Google y Outlook con un toque", "Notas privadas: dónde, cuándo, tamaño del deal", "Escanea una pila de un congreso en minutos"] },
      { eyebrow: "Escritura IA", title: "Una bio profesional con tu voz",
        body: "El asistente Gemini de Cardixn lee tu rol y redacta una bio pulida de 40 palabras. Regenera cuanto quieras y edita libremente.",
        bullets: ["Adapta tono: autoritario (derecho/finanzas), cálido (hospitalidad), técnico (ingeniería)", "Traducción a 20 idiomas de un clic", "Plantilla y paleta sugeridas por sector", "Sin límites de uso", "Tu bio no entrena modelos externos"] },
    ],
  },
  comparisonPaper: {
    eyebrow: "Digital vs papel",
    title: ["Cardixn frente a la ", "tarjeta de papel"],
    sub: "Comparación directa entre la tarjeta electrónica moderna y la tarjeta impresa que se ha usado durante un siglo.",
    headers: ["Característica", "Cardixn digital", "Tarjeta de papel"],
    rows: [
      ["Coste anual", "Menos de 10 $, actualizaciones ilimitadas", "75-200 $ con reimpresiones"],
      ["Velocidad de actualización", "Instantánea para todos tus contactos", "Solo las nuevas impresiones"],
      ["Acción del receptor", "Cámara o toque, sin app", "Introducción manual"],
      ["Analítica", "Vistas, guardados y taps", "Ninguna"],
      ["Impacto ambiental", "Cero papel, cero envío", "7M+ árboles/año"],
      ["Multilingüe", "20 idiomas, RTL y LTR", "Impresión aparte por idioma"],
      ["Plantillas y diseño", "19 plantillas editables en vivo", "Fijo al imprimir"],
      ["Gestión de contactos", "Bóveda, notas, tags, sync", "Una goma en un cajón"],
      ["Alcance", "Todo el mundo por enlace", "Solo en persona"],
      ["Riesgo de pérdida", "Sync en la nube", "A menudo se pierde"],
    ],
  },
  comparisonApps: {
    eyebrow: "Digital vs digital",
    title: ["Cardixn frente a ", "otras apps de tarjetas"],
    sub: "No todas las apps son iguales. Así compara la mejor plataforma frente a generadores QR y apps antiguas.",
    bestPick: "Mejor elección",
    cols: [
      { name: "Cardixn", rows: ["19 plantillas de lujo incluidas", "Escáner OCR IA integrado", "Emisión NFC desde el navegador", "20 idiomas con RTL", "Panel de analítica", "Sin app para el receptor", "Colores personalizados + preview live", "Tarjetas ilimitadas en gratis"] },
      { name: "Generadores QR genéricos", rows: ["Una imagen QR estática", "Sin escaneo", "Sin NFC", "Un idioma", "Sin analítica", "Sin perfil público", "Sin plantillas", "Enlaces manuales"] },
      { name: "Apps antiguas", rows: ["3-5 plantillas básicas", "Escáner de pago aparte", "Requiere venta de tarjeta NFC física", "Habitualmente solo inglés", "Detrás de un paywall", "El receptor debe instalar su app", "Colores fijos", "Límite en gratis"] },
    ],
  },
  useCases: {
    eyebrow: "Para cada profesión",
    title: ["Una tarjeta digital ", "para cada profesional"],
    sub: "Diseñador, médico, agente inmobiliario, ingeniero o founder: Cardixn se adapta a cómo hace networking tu sector.",
    cases: [
      { title: "Emprendedores y founders", body: "Levanta capital y expande sin quedarte sin tarjetas. Pasa de 'Founder' a 'CEO' el día del cierre y cada inversor ve la actualización." },
      { title: "Ventas y ejecutivos de cuenta", body: "Envía tu enlace al final de cada discovery. Ve quién guardó, quién llamó, quién reenvió — señal real de pipeline." },
      { title: "Diseñadores y creativos", body: "Plantillas con precisión tipográfica: Marble, Aurora, Noir. Un color acorde a tu portfolio." },
      { title: "Fotógrafos y videógrafos", body: "Instagram, Behance, YouTube como chips. Tu tarjeta es la entrada a un portfolio." },
      { title: "Médicos y clínicos", body: "Dirección, WhatsApp de citas y bio en el idioma del paciente — útil en turismo médico." },
      { title: "Abogados y despachos", body: "Un Platinum o Ivory sobrio proyecta la seriedad esperada. Añade colegiaciones y especialidades." },
      { title: "Ingenieros y arquitectos", body: "LinkedIn, GitHub, portfolio del estudio. Al fin una tarjeta que sobrevive en obra — vive en el móvil." },
      { title: "Agentes inmobiliarios", body: "Cada visita es un lead. Ve quién abrió, guardó y compartió." },
      { title: "Freelancers y consultores", body: "Un perfil con servicios, tarifas, calendario y pagos. Actualízalo cuando cambie la oferta." },
      { title: "Coaches y consultores", body: "Autoridad con una plantilla de lujo y una bio IA con tu voz. Enlace de reservas para convertir." },
    ],
  },
  industries: {
    eyebrow: "Cada industria",
    title: ["Una tarjeta profesional ", "para tu sector"],
    items: [
      { title: "Empresa", body: "Plantillas corporativas para cada empleado, control central de marca y analítica por equipo." },
      { title: "Educación", body: "Profesores, admisiones y orientación comparten tarjetas con horarios y publicaciones." },
      { title: "Tecnología", body: "GitHub, npm y portfolios como chips de primer nivel. Identidad de desarrollador integrada." },
      { title: "Finanzas", body: "Plantillas discretas como Platinum y Noir proyectan confianza. Incluye avisos regulatorios en la bio." },
      { title: "Bienestar", body: "Yoga, nutrición, terapia: paletas cálidas y layouts sociales." },
      { title: "Hospitalidad", body: "Hoteles y restaurantes equipan a sus concierges — mejor experiencia de huésped." },
    ],
  },
  security: {
    eyebrow: "Seguridad y privacidad",
    title: ["Tus contactos son ", "tuyos, de nadie más"],
    sub: "Una plataforma de tarjetas digitales toca los datos más personales: nombres, teléfonos, emails, la forma de la red. Cardixn está diseñado desde la base de datos para protegerlos.",
    cards: [
      { title: "Seguridad a nivel de fila", body: "Cada tabla lleva políticas RLS. Un usuario solo lee o modifica sus datos; ni un fallo de aplicación filtra a otro." },
      { title: "Cifrado en cada capa", body: "TLS 1.3, AES-256, tokens firmados. Nada viaja en claro." },
      { title: "Autenticación verificada", body: "Login con Google o email verificado — sin cuentas anónimas." },
      { title: "Tu red te pertenece", body: "No vendemos contactos ni entrenamos modelos IA externos. Exporta vCard/CSV cuando quieras." },
    ],
  },
  analytics: {
    eyebrow: "Analítica",
    title: ["Entiende qué presentaciones ", "realmente rinden"],
    sub: "El networking es de las últimas actividades sin feedback. Cardixn convierte cada compartido en un evento medible.",
    metrics: [
      { title: "Vistas", body: "Cada vez que tu tarjeta se carga, desde cualquier dispositivo." },
      { title: "Contactos guardados", body: "Cuántos tocaron 'Guardar' y te añadieron al teléfono." },
      { title: "Recomparticiones", body: "Cuántas veces tu enlace fue reenviado." },
      { title: "Taps NFC", body: "Eventos físicos de tap desde cualquier tarjeta NFC programada." },
      { title: "Escaneos QR", body: "Escaneos desde cualquier superficie con tu QR." },
      { title: "Línea de 30 días", body: "Vista diaria rodante para detectar campañas y eventos." },
    ],
    liveLabel: "Actividad en vivo en todas tus tarjetas",
    agoLabel: "hace 30 días",
    todayLabel: "hoy",
  },
  crossPlatform: {
    eyebrow: "Multiplataforma",
    title: ["Funciona en ", "todo lo que ya tienes"],
    sub: "Cardixn es mobile-first pero rinde igual en iPhone, Android, iPad, macOS, Windows y Linux — desde cualquier navegador moderno.",
    cards: [
      { title: "iOS y Apple", body: "Añade el perfil a la pantalla de inicio y exporta contactos directo a Contactos." },
      { title: "Android y Google", body: "Emisión NFC lista en Chrome. Los contactos se sincronizan con Google Contacts." },
      { title: "Web en todas partes", body: "macOS, Windows, Linux, ChromeOS. Edita en escritorio y comparte desde el móvil." },
    ],
  },
  integrations: {
    eyebrow: "Integraciones",
    title: ["Conecta con ", "todas las herramientas que ya usas"],
    items: [
      { title: "Cualquier red social", body: "LinkedIn, Instagram, X, YouTube, TikTok, Behance, GitHub, Dribbble, Threads, WhatsApp y 20+ como chips." },
      { title: "Contactos en todas partes", body: "Exporta a Apple, Google y Outlook con un toque vía vCard." },
      { title: "Enlaces de calendario", body: "Calendly, Cal.com, Google Calendar o enlace propio para convertir contactos en reuniones." },
      { title: "Portfolio y medios", body: "Behance, YouTube, Vimeo, Notion — cada uno con su color de marca nativo." },
    ],
  },
  stats: {
    items: [
      { n: "20", u: "Idiomas soportados", body: "UI y contenido en 20 idiomas con RTL automático." },
      { n: "19", u: "Plantillas de lujo", body: "De Noir a Cosmic — cada plantilla afinada a mano." },
      { n: "2s", u: "Escaneo IA", body: "Tiempo medio para extraer todos los campos de una tarjeta de papel." },
      { n: "0", u: "Apps del receptor", body: "Nadie instala nada. Cualquier cámara y cualquier navegador." },
      { n: "∞", u: "Tarjetas por cuenta", body: "Personal, freelance, side-project — crea las que necesites." },
      { n: "30d", u: "Ventana de analítica", body: "Vista diaria rodante para cada tarjeta." },
    ],
  },
  testimonials: {
    eyebrow: "Amado por profesionales",
    title: ["De confianza para ", "networkers de todo el mundo"],
    quotes: [
      { name: "Sara Al-Mutairi", role: "Directora de Diseño, Riad", quote: "Dejé el papel hace un año. Mi Cardixn se ha compartido en tres congresos y no he reimpreso nunca." },
      { name: "Michael Bryant", role: "Broker inmobiliario, Austin", quote: "Antes repartía 40 tarjetas y me llamaban dos. Ahora veo quién guardó — mi tasa de cierre subió 30 %." },
      { name: "Yuki Tanaka", role: "Founder, Tokio", quote: "El soporte multilingüe fue decisivo. Mi tarjeta se ve perfecta en japonés, inglés y chino simplificado." },
      { name: "Lucía Fernández", role: "Product Lead, Barcelona", quote: "La bio IA clavó el tono a la primera. Edité dos palabras y a producción." },
      { name: "David Okafor", role: "Consultor, Lagos", quote: "Escaneé 82 tarjetas en 20 minutos en el vuelo. Todas anotadas." },
      { name: "Priya Sharma", role: "Abogada, Mumbai", quote: "El Platinum parece el membrete de un despacho tres veces más grande — decisivo para un primer retainer." },
    ],
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: ["Todo sobre ", "las tarjetas de visita digitales"],
    items: [
      { q: "¿Qué es una tarjeta de visita digital?", a: "Versión electrónica de la tarjeta impresa. Tus datos viven en un enlace compartible por QR, NFC, mensaje o email. Sin app para el receptor." },
      { q: "¿Es Cardixn gratis?", a: "Sí. Plan gratuito permanente con tarjetas ilimitadas, 19 plantillas, QR, escáner IA y bóveda." },
      { q: "¿Cómo creo una tarjeta?", a: "Inicia sesión, abre el editor, elige plantilla, rellena tus datos, genera la bio con IA y publica." },
      { q: "¿El receptor necesita una app?", a: "No. Cada tarjeta es una web pública." },
      { q: "¿Cómo funciona el NFC?", a: "Emisión Web NFC desde Chrome Android o programación de una tarjeta NTAG213/215 con tu URL." },
      { q: "¿Cardixn escanea tarjetas de papel?", a: "Sí. OCR IA en unos dos segundos, guardado en tu bóveda." },
      { q: "¿Qué idiomas soporta?", a: "20 idiomas, incluidos árabe, chino, japonés. RTL nativo." },
      { q: "¿En qué se diferencia?", a: "19 plantillas de lujo hechas a mano, todas las funciones avanzadas incluidas, sin app para el receptor." },
      { q: "¿Mis datos están seguros?", a: "Sí. RLS, TLS 1.3, AES-256, sin venta de contactos ni entrenamiento externo." },
      { q: "¿Puedo usarlo para toda mi empresa?", a: "Sí. Cuentas de equipo, plantillas compartidas y analítica por empleado." },
      { q: "¿Ofrecen generador de tarjetas?", a: "Cardixn es generador, creador y gestor en una sola plataforma." },
      { q: "¿Solo como QR?", a: "Sí. Imprime el QR en tu tarjeta actual y apuntará a un perfil editable." },
    ],
  },
  articles: {
    eyebrow: "Aprender",
    title: ["Del ", "diario Cardixn"],
    sub: "Guías y casos sobre networking moderno y el futuro de la tarjeta.",
    posts: [
      { title: "Cómo crear una tarjeta digital que convierte", body: "Guía práctica para bio, plantilla y CTAs." },
      { title: "Papel vs digital: balance 2026", body: "Por qué el 88 % del papel se tira en una semana." },
      { title: "Guía completa de tarjetas NFC", body: "Web NFC, chip NTAG y programación." },
    ],
    readCta: "Leer guía",
  },
  finalCta: {
    title: ["Tu tarjeta de papel acaba de jubilarse.", "Conoce la que la reemplaza."],
    sub: "Gratis para siempre para uso personal. Sin tarjeta de crédito. Sin app para el receptor. Listo en menos de dos minutos.",
    button: "Crea tu tarjeta digital",
  },
});

/* ============================================================ */
/* German                                                        */
/* ============================================================ */
const de: SeoContent = tr({
  whyDigital: {
    eyebrow: "Warum digital",
    title: ["Die Papiervisitenkarte ", "geht leise in Rente"],
    sub: "Eine digitale Visitenkarte ist keine papierlose Version einer alten Idee, sondern ein völlig anderes Werkzeug: dynamisch, messbar, teilbar und unverlierbar. Deshalb wechseln Profis weltweit für Networking, Vertriebstermine und den Alltag zur elektronischen Visitenkarte.",
    items: [
      { title: "Nachhaltig by design", body: "Jährlich fallen über 7 Millionen Bäume für Papierkarten; rund 88 % landen binnen einer Woche im Müll. Eine Cardixn-Karte ersetzt Tausende gedruckte über eine Karriere." },
      { title: "Immer aktuell", body: "Ändere Titel, Nummer oder Link — jeder Kontakt sieht die Info sofort. Eine Papierkarte ist veraltet, sobald sie gedruckt ist." },
      { title: "Schneller als jeder Austausch", body: "Ein Tap, ein Scan, ein Link. Deine Identität teilst du in einer Sekunde." },
      { title: "Drastisch günstiger", body: "75-200 $ pro Jahr für Druck sind Standard. Cardixn bietet unbegrenzt Karten und Updates zu einem Bruchteil." },
    ],
    closing: "Der Wechsel von Papier zur digitalen Visitenkartenplattform ist keine Mode. Er spiegelt den Wechsel vom Papierkalender zum Handykalender, vom gedruckten Boarding-Pass zur Wallet. Die Visitenkarte ist schlicht das letzte Stück vordigitaler Berufsidentität — und Cardixn ist genau dafür gebaut.",
  },
  whyCardixn: {
    eyebrow: "Warum Cardixn",
    title: ["Die Visitenkartenplattform, ", "die Profis tatsächlich nutzen"],
    sub: "Cardixn ist eine komplette Lösung, kein QR-Generator mit Landing Page. Von KI-OCR über NFC bis zu mehrsprachigen Profilen — alles ist ein kohärentes Produkt.",
    pillars: [
      { title: "KI im Zentrum", body: "Cardixn schreibt deine Bio, übersetzt in 20 Sprachen und extrahiert alle Felder einer fotografierten Karte in unter zwei Sekunden." },
      { title: "19 Luxus-Templates", body: "Noir, Aurora, Platinum, Marble, Cosmic, Emerald, Neon und mehr. Farbwechsel färbt alles sofort um." },
      { title: "Enterprise-Sicherheit", body: "Row-Level Security, Verschlüsselung, verifizierte Auth. Deine Kontakte gehören dir." },
      { title: "20 Sprachen, RTL & LTR", body: "Arabisch, Hebräisch, Persisch und 17 weitere mit automatischem RTL. Jede Version wird separat indexiert." },
      { title: "Echte Analytics", body: "Views, Saves, Taps und Shares über 30 Tage. Privat für dich." },
      { title: "Skalierbar", body: "Vom Freelancer bis 10.000-Personen-Enterprise — gleiche Infrastruktur mit Rollen und geteiltem Branding." },
    ],
  },
  deepFeatures: {
    eyebrow: "Wie es funktioniert, im Detail",
    title: ["Vier Technologien, die die Visitenkarte ", "mühelos machen"],
    blocks: [
      { eyebrow: "QR-Visitenkarte", title: "Ein dynamischer QR, der dir für immer gehört",
        body: "Jedes Cardixn-Profil enthält einen hochauflösenden dynamischen QR. Er kodiert eine kurze URL statt Rohdaten — Karte hinter dem QR beliebig ändern.",
        bullets: ["Als 2000×2000-PNG herunterladbar", "Recoloriert automatisch mit deinem Akzent", "Funktioniert mit iPhone/Android-Kamera seit 2018", "Nachverfolgbar — jeder Scan geloggt", "Ein QR, tausendfach verwendbar"] },
      { eyebrow: "NFC-Visitenkarte", title: "Per Tap teilen — ohne App für den Empfänger",
        body: "Sende dein Profil per Web NFC an jedes moderne Android-Handy. Verknüpfe dieselbe URL mit jeder NTAG213/215-Karte.",
        bullets: ["Web-NFC-Broadcast aus Chrome Android — ohne App", "Kompatibel mit allen programmierbaren NFC-Karten/Ringen", "Gleiche URL für iPhone-QR und Android-Tap", "Vom Dashboard aus überschreibbar", "Empfänger sieht die Karte in Safari/Chrome — kein Download"] },
      { eyebrow: "Visitenkarten-Scanner", title: "Jede Papierkarte wird zum gespeicherten Kontakt",
        body: "Kamera auf jede gedruckte Karte richten — Deutsch, Arabisch, Chinesisch, Japanisch, Kyrillisch oder gemischt — Cardixn extrahiert alle Felder in 1-2 Sekunden.",
        bullets: ["Mehrsprachiges OCR auf 40+ Formaten trainiert", "Live-Kamera oder Foto-Upload", "Ein-Tap-Export zu Apple, Google, Outlook", "Private Notizen: Ort, Follow-up, Deal-Size", "Konferenzstapel in Minuten scannen"] },
      { eyebrow: "KI-Schreiben", title: "Eine professionelle Bio in deiner Stimme",
        body: "Der Gemini-Assistent liest Rolle, Firma, Branche und formuliert eine geschliffene 40-Wort-Bio. Beliebig oft neu generieren, frei editieren.",
        bullets: ["Passt Tonalität: seriös (Recht/Finanzen), warm (Hotellerie), technisch (Engineering)", "Übersetzung in 20 Sprachen mit einem Klick", "KI-Vorschläge für Template und Farbe je Branche", "Keine Nutzungslimits", "Deine Bio trainiert keine externen Modelle"] },
    ],
  },
  comparisonPaper: {
    eyebrow: "Digital vs Papier",
    title: ["Cardixn gegen die ", "Papiervisitenkarte"],
    sub: "Direkter Vergleich zwischen der modernen elektronischen Karte und der gedruckten Karte, die Profis seit einem Jahrhundert tragen.",
    headers: ["Merkmal", "Cardixn digital", "Papiervisitenkarte"],
    rows: [
      ["Kosten pro Jahr", "Unter 10 $ mit unbegrenzten Updates", "75-200 $ mit Nachdrucken"],
      ["Update-Geschwindigkeit", "Sofort für alle Kontakte", "Nur Neudruck spiegelt Änderungen"],
      ["Aktion des Empfängers", "Kamera oder Tap, keine App", "Manuelle Eingabe"],
      ["Analytics", "Views, Saves, Taps getrackt", "Keine"],
      ["Umwelt", "Null Papier, null Versand", "7 Mio+ Bäume pro Jahr"],
      ["Mehrsprachig", "20 Sprachen, RTL und LTR", "Extra Druck pro Sprache"],
      ["Templates & Design", "19 Luxus-Templates, live editierbar", "Beim Druck fixiert"],
      ["Kontaktverwaltung", "Vault, Notizen, Tags, Live-Sync", "Gummiband in der Schublade"],
      ["Reichweite", "Weltweit per Link", "Nur persönlich"],
      ["Verlustrisiko", "Cloud-synchron", "Häufig verloren oder entsorgt"],
    ],
  },
  comparisonApps: {
    eyebrow: "Digital vs Digital",
    title: ["Cardixn gegen ", "andere Visitenkarten-Apps"],
    sub: "Nicht jede digitale Visitenkarten-App ist gleich. So schlägt sich die beste Plattform gegen generische QR-Tools und ältere Apps.",
    bestPick: "Beste Wahl",
    cols: [
      { name: "Cardixn", rows: ["19 Luxus-Templates inklusive", "KI-OCR-Scanner eingebaut", "NFC-Broadcast aus dem Browser", "20 Sprachen mit RTL", "Analytics-Dashboard", "Keine App beim Empfänger", "Custom-Akzentfarben + Live-Preview", "Unbegrenzte Karten kostenlos"] },
      { name: "Generische QR-Generatoren", rows: ["Ein statisches QR-Bild", "Kein Scannen", "Kein NFC", "Eine Sprache", "Keine Analytics", "Kein Profil", "Keine Templates", "Manuelles Link-Management"] },
      { name: "Alte Karten-Apps", rows: ["3-5 Basic-Templates", "Scanner als Bezahl-Add-on", "Verkauf einer NFC-Karte nötig", "Meist nur Englisch", "Hinter Paywall", "Empfänger muss App installieren", "Fixe Farben", "Karten-Limit im Free-Tier"] },
    ],
  },
  useCases: {
    eyebrow: "Für jeden Beruf",
    title: ["Eine digitale Karte ", "für jeden Profi"],
    sub: "Ob Designer, Arzt, Makler, Ingenieur oder Founder — Cardixn passt sich an, wie deine Branche wirklich netzwerkt.",
    cases: [
      { title: "Für Gründer & Founder", body: "Fundraise, launche, netzwerke, ohne dass Karten ausgehen. Ändere 'Founder' zu 'CEO' — jeder Investor sieht es." },
      { title: "Für Sales & Key Accounts", body: "Sende deinen Link nach jedem Discovery-Call. Sieh, wer speicherte oder weiterleitete — echtes Pipeline-Signal." },
      { title: "Für Designer & Kreative", body: "Marble, Aurora, Noir mit typografischer Präzision. Akzentfarbe passend zum Portfolio." },
      { title: "Für Fotografen & Videografen", body: "Instagram, Behance, YouTube als anklickbare Chips. Die Karte wird der Portfolio-Zugang." },
      { title: "Für Ärzte & Kliniker", body: "Praxisadresse, WhatsApp-Termin und Bio in der Patientensprache — nützlich im Medizintourismus." },
      { title: "Für Anwälte & Kanzleien", body: "Ruhiges Platinum oder Ivory strahlt Ernst aus. Zulassungen und Spezialisierungen in der Bio." },
      { title: "Für Ingenieure & Architekten", body: "LinkedIn, GitHub, Büroportfolio. Endlich robust genug fürs Baustellenumfeld — sie lebt auf dem Handy." },
      { title: "Für Makler", body: "Jede Besichtigung wird Lead. Sieh, wer öffnete, speicherte und teilte." },
      { title: "Für Freelancer & Consultants", body: "Ein Profil mit Services, Preisen, Kalender und Payment. Aktualisiere frei." },
      { title: "Für Coaches & Berater", body: "Autorität mit Luxus-Template und KI-Bio deiner Stimme. Buchungslink verwandelt Kontakte in Sitzungen." },
    ],
  },
  industries: {
    eyebrow: "Jede Branche",
    title: ["Eine Business-Karte, die ", "zu deiner Branche passt"],
    items: [
      { title: "Enterprise", body: "Einheitliche Templates für jeden Mitarbeiter, zentrale Markenkontrolle, Team-Analytics." },
      { title: "Bildung", body: "Professoren, Zulassung, Career Services teilen Karten mit Sprechzeiten und Publikationen." },
      { title: "Technologie", body: "GitHub, npm, Portfolios als First-Class-Chips." },
      { title: "Finanzen", body: "Platinum und Noir signalisieren Vertrauen. Compliance-Hinweise in der Bio." },
      { title: "Wellness", body: "Yoga, Ernährung, Therapie — warme Paletten und social-first Layouts." },
      { title: "Hospitality", body: "Hotels und Restaurants statten Concierges aus — bessere Gästeerfahrung." },
    ],
  },
  security: {
    eyebrow: "Sicherheit & Privatsphäre",
    title: ["Deine Kontakte sind ", "deine, nicht die von anderen"],
    sub: "Eine moderne Visitenkartenplattform berührt persönlichste Daten. Cardixn ist von der Datenbank an dafür entwickelt, sie zu schützen.",
    cards: [
      { title: "Row-Level Security", body: "Jede Tabelle mit RLS-Policies. Ein User liest nur seine Daten — selbst App-Fehler leaken nichts." },
      { title: "Verschlüsselung auf jeder Ebene", body: "TLS 1.3, AES-256, signierte Tokens. Nichts geht im Klartext raus." },
      { title: "Verifizierte Authentifizierung", body: "Login per Google oder verifizierter E-Mail — keine anonymen Accounts." },
      { title: "Du besitzt dein Netzwerk", body: "Kein Verkauf, keine Schatten-Profile, kein Modell-Training auf deinen Daten. vCard/CSV-Export jederzeit." },
    ],
  },
  analytics: {
    eyebrow: "Analytics",
    title: ["Verstehe, welche Kontakte ", "sich wirklich lohnen"],
    sub: "Networking ist eine der letzten Profi-Aktivitäten ohne Feedback-Loop. Cardixn macht jedes Teilen messbar.",
    metrics: [
      { title: "Views", body: "Jedes Laden deiner Karte, von jedem Gerät und Land." },
      { title: "Kontaktspeicherungen", body: "Wie viele auf 'Speichern' tippten und dich in ihre Kontakte übernahmen." },
      { title: "Reshares", body: "Wie oft dein Link weitergeleitet oder eingebettet wurde." },
      { title: "NFC-Taps", body: "Physische Tap-Events von jeder programmierten NFC-Karte." },
      { title: "QR-Scans", body: "Scans von jeder Fläche, auf der dein QR lebt." },
      { title: "30-Tage-Timeline", body: "Tägliche Rolling-View für Kampagnen und Events." },
    ],
    liveLabel: "Live-Aktivität über alle Karten",
    agoLabel: "vor 30 Tagen",
    todayLabel: "heute",
  },
  crossPlatform: {
    eyebrow: "Plattformübergreifend",
    title: ["Läuft auf ", "allem, was du bereits besitzt"],
    sub: "Cardixn ist mobile-first, läuft aber gleich gut auf iPhone, Android, iPad, macOS, Windows und Linux — in jedem modernen Browser.",
    cards: [
      { title: "iOS & Apple", body: "Profil auf den Home-Screen für App-Feel. Kontakt-Export direkt in Kontakte." },
      { title: "Android & Google", body: "NFC-Broadcast in Chrome sofort. Kontakte in Google Contacts synchron." },
      { title: "Web überall", body: "macOS, Windows, Linux, ChromeOS. Am Desktop bearbeiten, am Handy teilen." },
    ],
  },
  integrations: {
    eyebrow: "Integrationen",
    title: ["Verbindet sich mit ", "allen Tools, die du schon nutzt"],
    items: [
      { title: "Jede Social-Plattform", body: "LinkedIn, Instagram, X, YouTube, TikTok, Behance, GitHub, Dribbble, Threads, WhatsApp und 20+ mehr." },
      { title: "Kontakte überall", body: "Ein-Tap-Export zu Apple, Google und Outlook via vCard." },
      { title: "Kalender-Links", body: "Calendly, Cal.com, Google Calendar oder eigener Link." },
      { title: "Portfolio & Medien", body: "Behance, YouTube, Vimeo, Notion — jeweils in Markenfarbe." },
    ],
  },
  stats: {
    items: [
      { n: "20", u: "Sprachen unterstützt", body: "UI und Kartenspalten in 20 Sprachen mit RTL." },
      { n: "19", u: "Luxus-Templates", body: "Von Noir bis Cosmic — handjustiert." },
      { n: "2s", u: "KI-Karten-Scan", body: "Durchschnitt für alle Felder einer Papierkarte." },
      { n: "0", u: "Empfänger-Apps", body: "Niemand installiert etwas. Jede Kamera, jeder Browser." },
      { n: "∞", u: "Karten pro Konto", body: "Persönlich, freiberuflich, Side-Project — beliebig viele." },
      { n: "30T", u: "Analytics-Fenster", body: "Tägliche Rolling-View pro Karte." },
    ],
  },
  testimonials: {
    eyebrow: "Von Profis geliebt",
    title: ["Vertraut von ", "Networkern weltweit"],
    quotes: [
      { name: "Sara Al-Mutairi", role: "Design Director, Riad", quote: "Seit einem Jahr kein Papier mehr. Auf drei Konferenzen geteilt, nie nachgedruckt." },
      { name: "Michael Bryant", role: "Makler, Austin", quote: "Früher 40 Karten pro Open House, zwei Rückmeldungen. Heute sehe ich, wer speicherte — Abschlüsse +30 %." },
      { name: "Yuki Tanaka", role: "Gründer, Tokio", quote: "Wegen der Mehrsprachigkeit gewählt. Perfekt in Japanisch, Englisch, vereinfachtem Chinesisch." },
      { name: "Lucía Fernández", role: "Product Lead, Barcelona", quote: "Die KI-Bio traf sofort den Ton. Zwei Wörter geändert, veröffentlicht." },
      { name: "David Okafor", role: "Consultant, Lagos", quote: "82 Papierkarten in 20 Minuten im Flieger gescannt — alle im Vault mit Notizen." },
      { name: "Priya Sharma", role: "Anwältin, Mumbai", quote: "Das Platinum sieht aus wie der Briefkopf einer dreimal so großen Kanzlei." },
    ],
  },
  faq: {
    eyebrow: "Häufige Fragen",
    title: ["Alles über ", "digitale Visitenkarten"],
    items: [
      { q: "Was ist eine digitale Visitenkarte?", a: "Eine elektronische Version der gedruckten Karte. Deine Daten leben unter einem teilbaren Link, via QR, NFC, Nachricht oder E-Mail. Keine App für den Empfänger." },
      { q: "Ist Cardixn kostenlos?", a: "Ja. Dauerhaft kostenloser Tarif mit unbegrenzten Karten, 19 Templates, QR, KI-Scanner und Vault." },
      { q: "Wie erstelle ich eine Karte?", a: "Anmelden, Editor öffnen, Template wählen, Daten eintragen, Bio per KI generieren, veröffentlichen." },
      { q: "Braucht der Empfänger eine App?", a: "Nein. Jede Karte ist eine öffentliche Webseite." },
      { q: "Wie funktioniert NFC?", a: "Web-NFC-Broadcast aus Chrome Android oder Programmierung einer NTAG213/215-Karte." },
      { q: "Scannt Cardixn Papierkarten?", a: "Ja. KI-OCR in etwa zwei Sekunden, im Vault gespeichert." },
      { q: "Welche Sprachen?", a: "20 Sprachen inklusive Arabisch, Chinesisch, Japanisch. Natives RTL." },
      { q: "Wie unterscheidet sich Cardixn?", a: "Handgemachte Luxus-Templates, alle Advanced-Features inklusive, keine Empfänger-App." },
      { q: "Sind meine Daten sicher?", a: "Ja. RLS, TLS 1.3, AES-256, kein Verkauf, kein Modelltraining." },
      { q: "Für die ganze Firma nutzbar?", a: "Ja. Team-Accounts, geteilte Templates, zentrale Kontrolle, Analytics pro Mitarbeiter." },
      { q: "Gibt es einen Kartengenerator?", a: "Cardixn ist Generator, Editor und Manager in einer Plattform." },
      { q: "Nur als QR nutzbar?", a: "Ja. QR auf deiner bestehenden Karte drucken — er führt zum editierbaren Profil." },
    ],
  },
  articles: {
    eyebrow: "Lernen",
    title: ["Aus dem ", "Cardixn-Journal"],
    sub: "Guides und Case Studies zu modernem Networking und der Zukunft der Visitenkarte.",
    posts: [
      { title: "Eine digitale Visitenkarte, die konvertiert", body: "Feldguide für Bio, Template und CTAs." },
      { title: "Papier vs Digital: 2026", body: "Warum 88 % Papierkarten binnen einer Woche entsorgt werden." },
      { title: "Der komplette NFC-Guide", body: "Wie Web NFC funktioniert, welcher NTAG, wie programmiert." },
    ],
    readCta: "Guide lesen",
  },
  finalCta: {
    title: ["Deine Papierkarte ist in Rente.", "Lerne die Nachfolgerin kennen."],
    sub: "Für den persönlichen Gebrauch dauerhaft kostenlos. Keine Kreditkarte. Keine Empfänger-App. In unter zwei Minuten fertig.",
    button: "Digitale Visitenkarte erstellen",
  },
});

/* ============================================================ */
/* Portuguese                                                     */
/* ============================================================ */
const pt: SeoContent = tr({
  whyDigital: {
    eyebrow: "Por que ir digital",
    title: ["O cartão de visita em papel ", "está se aposentando"],
    sub: "Um cartão de visita digital não é apenas a versão sem papel de uma ideia antiga. É uma ferramenta completamente diferente: dinâmica, mensurável, compartilhável e impossível de perder. Por isso profissionais no mundo todo migram para o cartão eletrônico em eventos, reuniões e apresentações diárias.",
    items: [
      { title: "Sustentável por design", body: "Mais de 7 milhões de árvores são consumidas por ano em cartões impressos e ~88 % são descartados em uma semana. Um cartão Cardixn elimina esse desperdício." },
      { title: "Sempre atualizado", body: "Mude cargo, telefone ou link — todos os contatos veem a atualização na hora." },
      { title: "Mais rápido que qualquer troca", body: "Um toque, um scan ou um link. Compartilhar sua identidade profissional deve levar um segundo." },
      { title: "Custo drasticamente menor", body: "75 a 200 $ por ano em cartões impressos. Cardixn entrega cartões e updates ilimitados por uma fração." },
    ],
    closing: "A migração para uma plataforma de cartões digitais não é moda — espelha a migração da agenda de papel para o celular e do cartão de embarque impresso para a carteira digital. O cartão de visita é simplesmente a última peça da identidade pré-digital, e o Cardixn foi construído para essa reformulação.",
  },
  whyCardixn: {
    eyebrow: "Por que Cardixn",
    title: ["A plataforma de cartões que ", "profissionais realmente usam"],
    sub: "O Cardixn é uma solução completa, não um gerador de QR com landing page. De OCR com IA a NFC e perfis multilíngues, tudo é um único produto coeso.",
    pillars: [
      { title: "IA no centro", body: "Escreve sua bio, traduz o cartão em 20 idiomas e extrai cada campo de uma foto em menos de dois segundos." },
      { title: "19 templates premium", body: "Noir, Aurora, Platinum, Marble, Cosmic e mais. Mude a cor e tudo se recolore." },
      { title: "Segurança de empresa", body: "RLS, criptografia em trânsito, autenticação verificada. Seus contatos são seus." },
      { title: "20 idiomas, RTL e LTR", body: "Árabe, hebraico, persa e 17 outros com renderização automática RTL." },
      { title: "Analytics real", body: "Views, saves, taps e shares em 30 dias — privados para você." },
      { title: "Feito para escalar", body: "Do freelancer à empresa de 10 000 pessoas na mesma infra." },
    ],
  },
  deepFeatures: {
    eyebrow: "Como funciona, em detalhe",
    title: ["Quatro tecnologias que tornam o cartão ", "sem esforço"],
    blocks: [
      { eyebrow: "Cartão QR", title: "Um QR dinâmico que continua seu para sempre",
        body: "Cada perfil vem com QR dinâmico em alta resolução. Codifica uma URL curta — mude o cartão sem reimprimir.",
        bullets: ["Baixe em PNG 2000×2000", "Recolore automaticamente com seu acento", "Compatível com câmera nativa iPhone/Android desde 2018", "Rastreável — cada scan registrado", "Um único QR reutilizável em milhares de pontos"] },
      { eyebrow: "Cartão NFC", title: "Compartilhe com um toque, sem app para o destinatário",
        body: "Transmita seu perfil via Web NFC e faça qualquer Android moderno recebê-lo. Combine a mesma URL com qualquer cartão NTAG213/215.",
        bullets: ["Broadcast Web NFC do Chrome Android sem app", "Compatível com qualquer cartão/anel NFC programável", "Mesma URL para QR iPhone e NFC Android", "Regravável pelo painel", "Destinatário vê no Safari/Chrome, sem download"] },
      { eyebrow: "Scanner de cartões", title: "Transforme qualquer cartão de papel em contato digital",
        body: "Aponte a câmera para qualquer cartão impresso e o Cardixn extrai nome, cargo, empresa, telefone, e-mail, site e endereço em 1-2s.",
        bullets: ["OCR multilíngue em 40+ formatos", "Câmera ao vivo ou upload de foto", "Exporte para Apple/Google/Outlook com um toque", "Notas privadas: onde, quando, tamanho do deal", "Escaneie uma pilha de congresso em minutos"] },
      { eyebrow: "Escrita IA", title: "Uma bio profissional na sua voz",
        body: "O assistente Gemini lê seu papel e redige uma bio polida de 40 palavras. Regenere e edite livremente.",
        bullets: ["Adapta tom: sério (direito/finanças), quente (hospitalidade), técnico (engenharia)", "Tradução para 20 idiomas em um clique", "Sugestão de template e paleta por setor", "Sem limites de uso", "Sua bio não treina modelos externos"] },
    ],
  },
  comparisonPaper: {
    eyebrow: "Digital vs papel",
    title: ["Cardixn vs o ", "cartão de visita em papel"],
    sub: "Comparação direta entre o cartão eletrônico moderno e o impresso usado há um século.",
    headers: ["Recurso", "Cardixn digital", "Cartão em papel"],
    rows: [
      ["Custo anual", "Menos de 10 $ com updates ilimitados", "75-200 $ com reimpressões"],
      ["Velocidade de update", "Instantânea para todos os contatos", "Só a nova impressão"],
      ["Ação do destinatário", "Câmera ou toque, sem app", "Digitação manual"],
      ["Analytics", "Views, saves, taps rastreados", "Nenhum"],
      ["Impacto ambiental", "Zero papel, zero envio", "7M+ árvores por ano"],
      ["Multilíngue", "20 idiomas, RTL e LTR", "Impressão separada por idioma"],
      ["Templates e design", "19 templates editáveis ao vivo", "Fixo na impressão"],
      ["Gestão de contatos", "Vault, notas, tags, sync", "Elástico numa gaveta"],
      ["Alcance", "Mundo todo via link", "Só presencial"],
      ["Risco de perda", "Sync na nuvem", "Frequentemente perdido"],
    ],
  },
  comparisonApps: {
    eyebrow: "Digital vs digital",
    title: ["Cardixn vs ", "outras apps de cartões"],
    sub: "Nem toda app é igual. Veja o Cardixn versus geradores QR genéricos e apps legadas.",
    bestPick: "Melhor escolha",
    cols: [
      { name: "Cardixn", rows: ["19 templates premium inclusos", "Scanner OCR IA integrado", "Broadcast NFC no browser", "20 idiomas com RTL", "Dashboard de analytics", "Sem app para o destinatário", "Cores customizadas + preview live", "Cartões ilimitados no grátis"] },
      { name: "Geradores QR genéricos", rows: ["Uma imagem QR estática", "Sem escaneamento", "Sem NFC", "Um idioma", "Sem analytics", "Sem perfil público", "Sem templates", "Gestão manual de links"] },
      { name: "Apps antigas", rows: ["3-5 templates básicos", "Scanner como add-on pago", "Requer venda de cartão NFC", "Geralmente só inglês", "Atrás de paywall", "Destinatário precisa instalar app", "Cores fixas", "Limite de cartões no grátis"] },
    ],
  },
  useCases: {
    eyebrow: "Para cada profissão",
    title: ["Um cartão digital ", "para cada profissional"],
    sub: "Designer, médico, corretor, engenheiro ou fundador: o Cardixn se adapta ao networking do seu setor.",
    cases: [
      { title: "Empreendedores e fundadores", body: "Levante capital, lance, networking sem acabar cartões. Mude 'Founder' para 'CEO' — cada investidor vê." },
      { title: "Vendas e executivos de contas", body: "Envie o link após cada discovery. Veja quem tocou 'ligar', salvou, encaminhou." },
      { title: "Designers e criativos", body: "Templates com precisão tipográfica: Marble, Aurora, Noir. Cor que combina com o portfólio." },
      { title: "Fotógrafos e videomakers", body: "Instagram, Behance e YouTube como chips clicáveis. O cartão vira porta do portfólio." },
      { title: "Médicos e clínicos", body: "Endereço da clínica, WhatsApp de agendamento e bio no idioma do paciente." },
      { title: "Advogados e escritórios", body: "Platinum ou Ivory sóbrio projeta seriedade. Insira OAB, cadeiras, especialidades." },
      { title: "Engenheiros e arquitetos", body: "LinkedIn, GitHub, site do escritório. Finalmente robusta para canteiro — vive no celular." },
      { title: "Corretores de imóveis", body: "Cada visita vira lead. Veja quem abriu, salvou, compartilhou." },
      { title: "Freelancers e consultores", body: "Um perfil com serviços, preços, calendário e pagamentos." },
      { title: "Coaches e consultores", body: "Autoridade com template premium e bio IA na sua voz. Link de reserva para converter." },
    ],
  },
  industries: {
    eyebrow: "Cada indústria",
    title: ["Um cartão profissional que ", "cabe no seu setor"],
    items: [
      { title: "Empresa", body: "Templates unificados por funcionário, controle central de marca e analytics por equipe." },
      { title: "Educação", body: "Professores e admissão compartilham cartões com horários e publicações." },
      { title: "Tecnologia", body: "GitHub, npm e portfólios como chips de primeira classe." },
      { title: "Finanças", body: "Platinum e Noir discretos projetam confiança. Avisos regulatórios na bio." },
      { title: "Bem-estar", body: "Yoga, nutrição e terapia com paletas quentes e layouts sociais." },
      { title: "Hospitalidade", body: "Hotéis e restaurantes equipam concierges — melhor experiência do hóspede." },
    ],
  },
  security: {
    eyebrow: "Segurança e privacidade",
    title: ["Seus contatos são ", "seus, de mais ninguém"],
    sub: "A plataforma toca nos dados mais pessoais do profissional. O Cardixn é engenhado do banco para cima para proteger tudo isso.",
    cards: [
      { title: "Segurança em nível de linha", body: "Políticas RLS no banco. Um usuário só lê seus dados; nem erro de app vaza." },
      { title: "Criptografia em cada camada", body: "TLS 1.3, AES-256, tokens assinados. Nada trafega em claro." },
      { title: "Autenticação verificada", body: "Login com Google ou e-mail verificado — sem contas anônimas." },
      { title: "Você possui sua rede", body: "Não vendemos contatos nem treinamos IA externa. Exporte vCard/CSV quando quiser." },
    ],
  },
  analytics: {
    eyebrow: "Analytics",
    title: ["Entenda quais apresentações ", "realmente valem a pena"],
    sub: "Networking é uma das últimas atividades sem feedback. O Cardixn torna cada compartilhamento mensurável.",
    metrics: [
      { title: "Views", body: "Cada carregamento do seu cartão." },
      { title: "Contatos salvos", body: "Quantos tocaram 'Salvar' e te adicionaram." },
      { title: "Recompartilhamentos", body: "Quantas vezes seu link foi reenviado." },
      { title: "Taps NFC", body: "Eventos físicos de qualquer cartão NFC programado." },
      { title: "Scans de QR", body: "Scans de qualquer superfície onde vive seu QR." },
      { title: "Linha de 30 dias", body: "Visão diária rolando para captar campanhas e eventos." },
    ],
    liveLabel: "Atividade ao vivo em todos os seus cartões",
    agoLabel: "30 dias atrás",
    todayLabel: "hoje",
  },
  crossPlatform: {
    eyebrow: "Multiplataforma",
    title: ["Funciona em ", "tudo o que você já tem"],
    sub: "Mobile-first, mas roda igual em iPhone, Android, iPad, macOS, Windows e Linux — em qualquer navegador moderno.",
    cards: [
      { title: "iOS e Apple", body: "Adicione à tela inicial para sensação de app. Exporta contatos direto para Contatos." },
      { title: "Android e Google", body: "NFC pronto no Chrome. Sincroniza com Google Contacts." },
      { title: "Web em todo lugar", body: "macOS, Windows, Linux, ChromeOS. Edite no desktop, compartilhe no celular." },
    ],
  },
  integrations: {
    eyebrow: "Integrações",
    title: ["Conecta a ", "todas as ferramentas que você usa"],
    items: [
      { title: "Qualquer rede social", body: "LinkedIn, Instagram, X, YouTube, TikTok, Behance, GitHub, Dribbble, Threads, WhatsApp e 20+." },
      { title: "Contatos em todo lugar", body: "Exporte para Apple/Google/Outlook via vCard." },
      { title: "Links de calendário", body: "Calendly, Cal.com, Google Calendar ou link próprio." },
      { title: "Portfólio e mídia", body: "Behance, YouTube, Vimeo, Notion — cada um na cor da marca." },
    ],
  },
  stats: {
    items: [
      { n: "20", u: "Idiomas suportados", body: "UI e conteúdo em 20 idiomas com RTL automático." },
      { n: "19", u: "Templates premium", body: "De Noir a Cosmic — ajustados à mão." },
      { n: "2s", u: "Scan IA", body: "Tempo médio para extrair campos de um cartão em papel." },
      { n: "0", u: "Apps do destinatário", body: "Ninguém instala nada." },
      { n: "∞", u: "Cartões por conta", body: "Pessoal, freelance, side project — quantos precisar." },
      { n: "30d", u: "Janela de analytics", body: "Visão diária rolando para cada cartão." },
    ],
  },
  testimonials: {
    eyebrow: "Amado por profissionais",
    title: ["Confiança de ", "networkers no mundo todo"],
    quotes: [
      { name: "Sara Al-Mutairi", role: "Diretora de Design, Riad", quote: "Parei o papel há um ano. Compartilhei em três conferências e nunca reimprimi." },
      { name: "Michael Bryant", role: "Corretor, Austin", quote: "Antes distribuía 40 cartões e ouvia dois. Agora vejo quem salvou — closings +30 %." },
      { name: "Yuki Tanaka", role: "Fundador, Tóquio", quote: "O multilíngue foi decisivo. Meu cartão em japonês, inglês e chinês simplificado." },
      { name: "Lucía Fernández", role: "Product Lead, Barcelona", quote: "A bio IA acertou o tom de primeira." },
      { name: "David Okafor", role: "Consultor, Lagos", quote: "82 cartões escaneados em 20 minutos no voo — todos anotados." },
      { name: "Priya Sharma", role: "Advogada, Mumbai", quote: "O Platinum parece papel timbrado de um escritório três vezes maior." },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    title: ["Tudo sobre ", "cartões de visita digitais"],
    items: [
      { q: "O que é um cartão de visita digital?", a: "Versão eletrônica do impresso. Informações num link compartilhável via QR, NFC, mensagem ou e-mail. Sem app para o destinatário." },
      { q: "O Cardixn é gratuito?", a: "Sim. Plano gratuito permanente com cartões ilimitados, 19 templates, QR, scanner IA e vault." },
      { q: "Como crio um cartão?", a: "Faça login, abra o editor, escolha template, preencha dados, gere bio com IA e publique." },
      { q: "O destinatário precisa de app?", a: "Não. Cada cartão é uma página web pública." },
      { q: "Como funciona o NFC?", a: "Broadcast Web NFC do Chrome Android ou programação de NTAG213/215 com sua URL." },
      { q: "Escaneia cartões de papel?", a: "Sim. OCR IA em cerca de dois segundos, salvo no vault." },
      { q: "Quais idiomas?", a: "20 idiomas incluindo árabe, chinês, japonês. RTL nativo." },
      { q: "Como se diferencia?", a: "Templates premium feitos à mão, todos os recursos inclusos, sem app do destinatário." },
      { q: "Meus dados estão seguros?", a: "Sim. RLS, TLS 1.3, AES-256, sem venda, sem treinamento externo." },
      { q: "Uso na empresa toda?", a: "Sim. Contas de equipe, templates compartilhados, analytics por funcionário." },
      { q: "Vocês oferecem gerador de cartões?", a: "Cardixn é gerador, editor e gestor em uma única plataforma." },
      { q: "Só como QR?", a: "Sim. Imprima o QR no cartão atual e ele leva ao perfil editável." },
    ],
  },
  articles: {
    eyebrow: "Aprender",
    title: ["Do ", "jornal Cardixn"],
    sub: "Guias e casos sobre networking moderno e o futuro do cartão de visita.",
    posts: [
      { title: "Como criar um cartão digital que converte", body: "Guia prático para bio, template e CTAs." },
      { title: "Papel vs digital: balanço 2026", body: "Por que 88 % dos cartões de papel viram lixo em uma semana." },
      { title: "Guia completo de cartões NFC", body: "Web NFC, escolha do chip NTAG e programação." },
    ],
    readCta: "Ler guia",
  },
  finalCta: {
    title: ["Seu cartão de papel se aposentou.", "Conheça o que o substitui."],
    sub: "Grátis para sempre para uso pessoal. Sem cartão de crédito. Sem app para o destinatário. Pronto em menos de dois minutos.",
    button: "Crie seu cartão digital",
  },
});

/* Registry — every locale must exist. Missing translations fall back
   to the English canonical content (still fully valid, keyword-dense). */
export const SEO_CONTENT: Record<Locale, SeoContent> = {
  en,
  ar,
  fr,
  de,
  es,
  pt,
  // Locales below use generated full translations of the English source.
  it: tr(SEO_LOCALES["it"] as DeepPartial<SeoContent>),
  ru: tr(SEO_LOCALES["ru"] as DeepPartial<SeoContent>),
  tr: tr(SEO_LOCALES["tr"] as DeepPartial<SeoContent>),
  nl: tr(SEO_LOCALES["nl"] as DeepPartial<SeoContent>),
  pl: tr(SEO_LOCALES["pl"] as DeepPartial<SeoContent>),
  zh: tr(SEO_LOCALES["zh"] as DeepPartial<SeoContent>),
  "zh-TW": tr(SEO_LOCALES["zh-TW"] as DeepPartial<SeoContent>),
  ja: tr(SEO_LOCALES["ja"] as DeepPartial<SeoContent>),
  ko: tr(SEO_LOCALES["ko"] as DeepPartial<SeoContent>),
  hi: tr(SEO_LOCALES["hi"] as DeepPartial<SeoContent>),
  id: tr(SEO_LOCALES["id"] as DeepPartial<SeoContent>),
  ms: tr(SEO_LOCALES["ms"] as DeepPartial<SeoContent>),
  th: tr(SEO_LOCALES["th"] as DeepPartial<SeoContent>),
  vi: tr(SEO_LOCALES["vi"] as DeepPartial<SeoContent>),
};

export function getSeoContent(lang: Locale): SeoContent {
  return SEO_CONTENT[lang] ?? SEO_CONTENT.en;
}
