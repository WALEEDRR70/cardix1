import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "ar";

const dict = {
  en: {
    brand: "Cardix",
    tagline: "The world's most refined digital business card.",
    subtagline: "Create, share, scan and save premium digital cards. Built for the modern professional.",
    getStarted: "Get started",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    dashboard: "Dashboard",
    myCards: "My cards",
    newCard: "New card",
    createCard: "Create card",
    editCard: "Edit card",
    deleteCard: "Delete",
    save: "Save changes",
    share: "Share",
    view: "View public page",
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
    noCards: "No cards yet. Create your first one.",
    vault: "Vault",
    scanCard: "Scan card",
    scanCardDesc: "Snap a paper business card. AI extracts the details in seconds.",
    uploadImage: "Upload image",
    takePhoto: "Take photo",
    scanning: "Reading card…",
    scanFailed: "Could not read that card. Try a clearer photo.",
    saveToVault: "Save to vault",
    savedToVault: "Saved to your vault",
    emptyVault: "Your vault is empty. Scan or save a card to get started.",
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
    nfcTap: "Tap an NFC tag to your phone…",
    nfcWritten: "Written to tag",
    nfcUnsupported: "NFC not supported on this device",
    downloadQr: "Download QR",


    features: [
      { t: "Instant sharing", d: "QR, NFC, link, WhatsApp, AirDrop." },
      { t: "Made to be beautiful", d: "Curated luxury templates and typography." },
      { t: "Yours forever", d: "Cloud sync, backups, and lifetime updates." },
    ],
  },
  ar: {
    brand: "كارديكس",
    tagline: "أرقى بطاقة أعمال رقمية في العالم.",
    subtagline: "أنشئ وشارك وامسح واحفظ بطاقاتك الرقمية بجودة استثنائية. مصمّمة للمحترف العصري.",
    getStarted: "ابدأ الآن",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    dashboard: "لوحة التحكم",
    myCards: "بطاقاتي",
    newCard: "بطاقة جديدة",
    createCard: "إنشاء بطاقة",
    editCard: "تعديل البطاقة",
    deleteCard: "حذف",
    save: "حفظ التغييرات",
    share: "مشاركة",
    view: "عرض الصفحة العامة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    continueWithGoogle: "المتابعة عبر Google",
    or: "أو",
    name: "الاسم الكامل",
    title: "المسمى الوظيفي",
    company: "الشركة",
    bio: "نبذة",
    phone: "الهاتف",
    whatsapp: "واتساب",
    website: "الموقع الإلكتروني",
    address: "العنوان",
    slug: "الرابط العام",
    accent: "اللون المميز",
    template: "القالب",
    published: "منشورة",
    call: "اتصال",
    saveContact: "حفظ جهة الاتصال",
    scan: "امسح للفتح",
    noCards: "لا توجد بطاقات بعد. أنشئ أول بطاقة.",
    vault: "الخزنة",
    scanCard: "مسح بطاقة",
    scanCardDesc: "التقط صورة لبطاقة ورقية وسيستخرج الذكاء الاصطناعي بياناتها في ثوانٍ.",
    uploadImage: "رفع صورة",
    takePhoto: "التقاط صورة",
    scanning: "جارٍ قراءة البطاقة…",
    scanFailed: "تعذّرت قراءة هذه البطاقة. جرّب صورة أوضح.",
    saveToVault: "حفظ في الخزنة",
    savedToVault: "تم الحفظ في خزنتك",
    emptyVault: "خزنتك فارغة. امسح أو احفظ بطاقة للبدء.",
    notes: "ملاحظات",
    tags: "الوسوم",
    delete: "حذف",
    contactInfo: "التواصل",
    analytics: "التحليلات",
    totalViews: "إجمالي المشاهدات",
    last7days: "آخر 7 أيام",
    last30days: "آخر 30 يومًا",
    contactSaves: "حفظ جهات الاتصال",
    noAnalytics: "لا يوجد نشاط بعد. شارك بطاقتك لرؤية التحليلات.",
    generateBio: "توليد بالذكاء الاصطناعي",
    generating: "جارٍ التوليد…",
    avatar: "الصورة",
    uploadPhoto: "رفع صورة",
    uploading: "جارٍ الرفع…",
    writeNfc: "كتابة على NFC",
    nfcTap: "قرّب بطاقة NFC من الجهاز…",
    nfcWritten: "تمت الكتابة على البطاقة",
    nfcUnsupported: "NFC غير مدعوم على هذا الجهاز",
    downloadQr: "تحميل رمز QR",


    features: [
      { t: "مشاركة فورية", d: "رمز QR، NFC، رابط، واتساب، AirDrop." },
      { t: "جمال استثنائي", d: "قوالب فاخرة وطباعة راقية." },
      { t: "ملكك للأبد", d: "مزامنة سحابية ونسخ احتياطي وتحديثات مدى الحياة." },
    ],
  },
};

type Dict = typeof dict.en;

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({
  lang: "en",
  t: dict.en,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
