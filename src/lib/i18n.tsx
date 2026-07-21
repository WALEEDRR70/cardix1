import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { DEFAULT_LOCALE, isRtl, isSupportedLocale, type Locale } from "@/i18n/config";
import { DICTIONARIES, type UIDict } from "@/i18n/dictionaries";

// Base English dictionary — canonical source of every UI key.
// All other locales override keys via src/i18n/dictionaries.ts; missing keys fall back here.
const en: UIDict = {
  brand: "Cardix",
  tagline: "Your card. Your identity.",
  subtagline: "Premium digital business cards. Share with a tap, a scan, or a link.",
  getStarted: "Get started",
  signIn: "Sign in",
  signUp: "Create account",
  signOut: "Sign out",
  dashboard: "Home",
  home: "Home",
  myCards: "My cards",
  newCard: "New card",
  createCard: "Create card",
  editCard: "Edit card",
  deleteCard: "Delete",
  save: "Save changes",
  share: "Share",
  view: "Preview",
  email: "Email",
  password: "Password",
  continueWithGoogle: "Continue with Google",
  or: "or",
  name: "Full name",
  title: "Job title",
  company: "Company",
  bio: "Bio",
  phone: "Phone",
  whatsapp: "WhatsApp",
  website: "Website",
  address: "Address",
  slug: "Public URL",
  accent: "Accent color",
  template: "Template",
  published: "Published",
  call: "Call",
  saveContact: "Save contact",
  scan: "Scan to open",
  scanShort: "Scan",
  settingsShort: "More",
  settings: "Settings",
  profile: "Profile",
  theme: "Theme",
  language: "Language",
  account: "Account",
  noCards: "No cards yet. Tap + to create your first.",
  vault: "Vault",
  scanCard: "Scan card",
  scanCardDesc: "Snap a paper card. AI extracts the details in seconds.",
  uploadImage: "Upload image",
  takePhoto: "Take photo",
  scanning: "Reading card…",
  scanFailed: "Could not read that card. Try a clearer photo.",
  saveToVault: "Save to vault",
  savedToVault: "Saved to your vault",
  saving: "Saving…",
  emptyVault: "Your vault is empty. Scan or save a card to start.",
  notes: "Notes",
  tags: "Tags",
  delete: "Delete",
  contactInfo: "Contact",
  analytics: "Analytics",
  totalViews: "Total views",
  last7days: "Last 7 days",
  last30days: "Last 30 days",
  contactSaves: "Contact saves",
  noAnalytics: "No activity yet. Share your card to see analytics.",
  generateBio: "Generate with AI",
  generating: "Generating…",
  avatar: "Photo",
  uploadPhoto: "Upload photo",
  uploading: "Uploading…",
  writeNfc: "Write to NFC",
  nfcTap: "Broadcasting… hold near another phone or an NFC tag",
  nfcWritten: "Card sent via NFC",
  nfcUnsupported: "NFC broadcasting requires Chrome on Android",
  downloadQr: "Download QR",
  shareCard: "Share your card",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  designs: "Designs",
  templates: {
    luxury: "Luxury", aurora: "Aurora", ivory: "Ivory", noir: "Noir", neon: "Neon",
    platinum: "Platinum", midnight: "Midnight", sunset: "Sunset", ocean: "Ocean", forest: "Forest",
    holographic: "Holo", executive: "Executive", mono: "Mono", marble: "Marble", carbon: "Carbon",
    sand: "Sand", rose: "Rose", emerald: "Emerald", cosmic: "Cosmic",
  },
  landingBadge: "Digital business cards, refined.",
  landingCta: "Open the app",
  featureShare: "One-tap share",
  featureShareDesc: "QR, NFC, or link. Nothing to install for the receiver.",
  featureScan: "AI paper scanner",
  featureScanDesc: "Snap a paper card. We save the contact in seconds.",
  featureTemplates: "19 luxury templates",
  featureTemplatesDesc: "From Noir gold to Aurora glass — every card feels intentional.",
  welcomeBack: "Welcome back.",
  startCraft: "Start crafting your card in seconds.",
  followMe: "Follow me",
  instantShare: "Instant share",
  scanQrDesc: "Scan my QR to view my card and save it instantly.",
  shareViaNfc: "Broadcast via NFC",
  stopNfc: "Stop broadcasting",
  nfcBroadcasting: "Broadcasting NFC signal",
  nfcResultSent: "Card sent",
  nfcResultFailed: "Broadcast failed",
  nfcResultStopped: "Broadcast stopped",
  nfcSentLabel: "Sent",
  nfcGuideTitle: "Ready to beam",
  nfcGuideSubtitle: "Follow these steps for a smooth handoff",
  nfcStep1Title: "Unlock the other phone",
  nfcStep1Desc: "The receiver's screen must be on and unlocked with NFC enabled.",
  nfcStep2Title: "Hold the phones back-to-back",
  nfcStep2Desc: "Align the upper backs of both phones — most NFC antennas sit near the top camera.",
  nfcStep3Title: "Wait for the vibration",
  nfcStep3Desc: "A short buzz means the card was received. Then pull them apart.",
  nfcAutoOpenTitle: "Opens the card automatically",
  nfcAutoOpenDesc: "The receiving phone unlocks straight to your Cardix page — no app install, no extra taps.",
  nfcLinkLabel: "Link the phone will open",
  nfcStopNow: "Stop broadcasting now",
  nfcHideGuide: "Hide guide",
  nfcShowGuide: "How it works",
  secondsAbbr: "s",
  expand: "Expand",
  download: "Download",
  location: "Location",
  addNote: "Add note",
  editNote: "Edit note",
  notePlaceholder: "Where you met, context, follow-up…",
  noteOptional: "Add a note (optional)",
  viewDetails: "View details",
  saveNote: "Save note",
  back: "Back",
  cancel: "Cancel",
  confirm: "Confirm",
  deleteConfirmTitle: "Delete this card?",
  deleteConfirmDesc: "This will permanently remove the card from your vault. This action can't be undone.",
  deleted: "Deleted",
  scanQr: "Scan QR",
  scanQrCardix: "Scan Cardix QR",
  scanPaper: "Scan paper card",
  pointAtQr: "Point the camera at a Cardix QR code.",
  invalidQr: "This QR is not a Cardix card.",
  alreadySaved: "This card is already in your vault.",
  ownCard: "This is your own card.",
  changeLanguage: "Change language",
  close: "Close",
  remove: "Remove",
  flipCamera: "Flip camera",
  capture: "Capture",
  cameraUnavailable: "Camera unavailable",
  uploadFailed: "Upload failed",
  aiError: "AI error",
  yourName: "Your Name",
  livePreview: "Live preview",
  nfcReady: "NFC ready",
  cardNotFound: "Card not found.",
  loading: "Loading…",
  tryAgain: "Try again",
  somethingWrong: "Something went wrong",
  positionCard: "Position the card inside the frame.",
  customColor: "Custom color",
};

type Dict = UIDict;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/* eslint-disable @typescript-eslint/no-explicit-any */
function merge<T extends object>(base: T, over: DeepPartial<T> | undefined): T {
  if (!over) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const k of Object.keys(over) as Array<keyof T>) {
    const v = (over as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object") {
      out[k] = merge(base[k] as any, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

const dictCache = new Map<Locale, Dict>();
function getDict(locale: Locale): Dict {
  if (dictCache.has(locale)) return dictCache.get(locale)!;
  const override = DICTIONARIES[locale] as DeepPartial<Dict> | undefined;
  const d = locale === "en" || !override ? en : merge(en, override);
  dictCache.set(locale, d);
  return d;
}

const Ctx = createContext<{ lang: Locale; t: Dict; dir: "ltr" | "rtl" }>({
  lang: DEFAULT_LOCALE,
  t: en,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const params = useParams({ strict: false }) as { lang?: string };
  const lang: Locale = isSupportedLocale(params?.lang) ? params.lang : DEFAULT_LOCALE;
  const dir: "ltr" | "rtl" = isRtl(lang) ? "rtl" : "ltr";
  const t = useMemo(() => getDict(lang), [lang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem("cardix_lang", lang); } catch { /* ignore */ }
  }, [lang, dir]);

  const value = useMemo(() => ({ lang, t, dir }), [lang, t, dir]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function useLocale() {
  return useContext(Ctx);
}
