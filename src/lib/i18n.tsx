import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { DEFAULT_LOCALE, isRtl, isSupportedLocale, type Locale } from "@/i18n/config";

// Base English dictionary — canonical source. Other locales override keys.
const en = {
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
};

type Dict = typeof en;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const ar: DeepPartial<Dict> = {
    brand: "كارديكس", tagline: "بطاقتك. هويتك.",
    subtagline: "بطاقات أعمال رقمية فاخرة. شاركها بلمسة أو مسح أو رابط.",
    getStarted: "ابدأ الآن", signIn: "تسجيل الدخول", signUp: "إنشاء حساب", signOut: "تسجيل الخروج",
    dashboard: "الرئيسية", home: "الرئيسية", myCards: "بطاقاتي", newCard: "بطاقة جديدة",
    createCard: "إنشاء بطاقة", editCard: "تعديل البطاقة", deleteCard: "حذف", save: "حفظ التغييرات",
    share: "مشاركة", view: "معاينة", email: "البريد الإلكتروني", password: "كلمة المرور",
    continueWithGoogle: "المتابعة عبر Google", or: "أو", name: "الاسم الكامل", title: "المسمى الوظيفي",
    company: "الشركة", bio: "نبذة", phone: "الهاتف", whatsapp: "واتساب", website: "الموقع الإلكتروني",
    address: "العنوان", slug: "الرابط العام", accent: "اللون المميز", template: "القالب",
    published: "منشورة", call: "اتصال", saveContact: "حفظ جهة الاتصال", scan: "امسح للفتح",
    scanShort: "مسح", settingsShort: "المزيد", settings: "الإعدادات", profile: "الملف الشخصي",
    theme: "المظهر", language: "اللغة", account: "الحساب",
    noCards: "لا توجد بطاقات بعد. اضغط + لإنشاء أول بطاقة.", vault: "الخزنة", scanCard: "مسح بطاقة",
    scanCardDesc: "التقط صورة لبطاقة ورقية ليستخرج الذكاء الاصطناعي بياناتها.",
    uploadImage: "رفع صورة", takePhoto: "التقاط صورة", scanning: "جارٍ قراءة البطاقة…",
    scanFailed: "تعذّرت قراءة هذه البطاقة. جرّب صورة أوضح.", saveToVault: "حفظ في الخزنة",
    savedToVault: "تم الحفظ في خزنتك", saving: "جارٍ الحفظ…",
    emptyVault: "خزنتك فارغة. امسح أو احفظ بطاقة للبدء.", notes: "ملاحظات", tags: "الوسوم",
    delete: "حذف", contactInfo: "التواصل", analytics: "التحليلات", totalViews: "إجمالي المشاهدات",
    last7days: "آخر 7 أيام", last30days: "آخر 30 يومًا", contactSaves: "حفظ جهات الاتصال",
    noAnalytics: "لا يوجد نشاط بعد. شارك بطاقتك لرؤية التحليلات.",
    generateBio: "توليد بالذكاء الاصطناعي", generating: "جارٍ التوليد…", avatar: "الصورة",
    uploadPhoto: "رفع صورة", uploading: "جارٍ الرفع…", writeNfc: "كتابة على NFC",
    nfcTap: "جارٍ البث… قرّب هاتفًا آخر أو تاق NFC", nfcWritten: "تم إرسال البطاقة عبر NFC",
    nfcUnsupported: "بث NFC يتطلب متصفح Chrome على Android", downloadQr: "تحميل رمز QR",
    shareCard: "شارك بطاقتك", copyLink: "نسخ الرابط", linkCopied: "تم نسخ الرابط",
    designs: "التصاميم",
    templates: {
      luxury: "فاخر", aurora: "شفق", ivory: "عاجي", noir: "أسود", neon: "نيون", platinum: "بلاتيني",
      midnight: "منتصف الليل", sunset: "غروب", ocean: "محيط", forest: "غابة", holographic: "هولو",
      executive: "تنفيذي", mono: "أحادي", marble: "رخام", carbon: "كربون", sand: "رملي",
      rose: "وردي", emerald: "زمردي", cosmic: "كوني",
    },
    landingBadge: "بطاقات الأعمال الرقمية، بلمسة راقية.", landingCta: "افتح التطبيق",
    featureShare: "مشاركة بلمسة", featureShareDesc: "QR أو NFC أو رابط. لا يحتاج المستلم لأي تطبيق.",
    featureScan: "ماسح ذكي", featureScanDesc: "التقط بطاقة ورقية وسنحفظ جهة الاتصال في ثوانٍ.",
    featureTemplates: "19 قالبًا فاخرًا",
    featureTemplatesDesc: "من أسود ذهبي إلى شفق زجاجي — كل بطاقة تبدو مقصودة.",
    welcomeBack: "أهلًا بعودتك.", startCraft: "ابدأ تصميم بطاقتك في ثوانٍ.", followMe: "تابعني على",
    instantShare: "مشاركة فورية", scanQrDesc: "امسح رمز QR لمشاهدة بطاقتي وحفظها مباشرة.",
    shareViaNfc: "بث عبر NFC", stopNfc: "إيقاف البث", nfcBroadcasting: "جارٍ بث إشارة NFC",
    nfcResultSent: "تم إرسال البطاقة", nfcResultFailed: "فشل البث", nfcResultStopped: "تم إيقاف البث",
    nfcSentLabel: "تم الإرسال", nfcGuideTitle: "جاهز للبث",
    nfcGuideSubtitle: "اتبع هذه الخطوات لنقل ناجح", nfcStep1Title: "افتح قفل الهاتف الآخر",
    nfcStep1Desc: "يجب أن تكون شاشة المستقبل مضاءة وغير مقفلة مع تفعيل NFC.",
    nfcStep2Title: "ضع الهاتفين ظهرًا لظهر",
    nfcStep2Desc: "قرّب الجزء العلوي من ظهر الهاتفين — عادةً هوائي NFC قرب الكاميرا.",
    nfcStep3Title: "انتظر الاهتزاز", nfcStep3Desc: "اهتزازة قصيرة تعني أن البطاقة وصلت. عندها أبعد الهاتفين.",
    nfcAutoOpenTitle: "يفتح البطاقة تلقائيًا",
    nfcAutoOpenDesc: "الهاتف المستقبِل سينتقل مباشرة إلى صفحة بطاقتك في Cardix — دون تثبيت تطبيق أو خطوات إضافية.",
    nfcLinkLabel: "الرابط الذي سيفتح", nfcStopNow: "أوقف البث الآن", nfcHideGuide: "إخفاء الدليل",
    nfcShowGuide: "كيف يعمل", secondsAbbr: "ث", expand: "تكبير", download: "تحميل", location: "الموقع",
    addNote: "إضافة ملاحظة", editNote: "تعديل الملاحظة",
    notePlaceholder: "أين التقيتم، السياق، خطوات المتابعة…", noteOptional: "أضف ملاحظة (اختياري)",
    viewDetails: "عرض التفاصيل", saveNote: "حفظ الملاحظة", back: "رجوع", cancel: "إلغاء",
    confirm: "تأكيد", deleteConfirmTitle: "حذف هذه البطاقة؟",
    deleteConfirmDesc: "سيتم حذف البطاقة من خزنتك بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.",
    deleted: "تم الحذف", scanQr: "مسح رمز QR", scanQrCardix: "مسح بطاقة كارديكس",
    scanPaper: "مسح بطاقة ورقية", pointAtQr: "وجّه الكاميرا نحو رمز QR الخاص ببطاقة كارديكس.",
    invalidQr: "هذا الرمز ليس بطاقة كارديكس.", alreadySaved: "هذه البطاقة محفوظة في خزنتك مسبقًا.",
    ownCard: "هذه بطاقتك الخاصة.",
};

// Minimal seed for other locales — nav/CTA overrides. Missing keys fall back to English.
// Real full translations land as JSON packs later.
const partial: Partial<Record<Locale, DeepPartial<Dict>>> = {
  fr: { signIn: "Connexion", signUp: "Créer un compte", signOut: "Déconnexion", getStarted: "Commencer",
    dashboard: "Accueil", home: "Accueil", myCards: "Mes cartes", newCard: "Nouvelle carte",
    settings: "Paramètres", vault: "Coffre", scanShort: "Scanner", settingsShort: "Plus",
    landingCta: "Ouvrir l'app", language: "Langue", save: "Enregistrer" },
  de: { signIn: "Anmelden", signUp: "Konto erstellen", signOut: "Abmelden", getStarted: "Loslegen",
    dashboard: "Start", home: "Start", myCards: "Meine Karten", newCard: "Neue Karte",
    settings: "Einstellungen", vault: "Tresor", scanShort: "Scannen", settingsShort: "Mehr",
    landingCta: "App öffnen", language: "Sprache", save: "Speichern" },
  es: { signIn: "Iniciar sesión", signUp: "Crear cuenta", signOut: "Cerrar sesión", getStarted: "Empezar",
    dashboard: "Inicio", home: "Inicio", myCards: "Mis tarjetas", newCard: "Nueva tarjeta",
    settings: "Ajustes", vault: "Bóveda", scanShort: "Escanear", settingsShort: "Más",
    landingCta: "Abrir app", language: "Idioma", save: "Guardar" },
  it: { signIn: "Accedi", signUp: "Crea account", signOut: "Esci", getStarted: "Inizia",
    dashboard: "Home", home: "Home", myCards: "Le mie carte", newCard: "Nuova carta",
    settings: "Impostazioni", vault: "Archivio", scanShort: "Scansiona", settingsShort: "Altro",
    landingCta: "Apri l'app", language: "Lingua", save: "Salva" },
  pt: { signIn: "Entrar", signUp: "Criar conta", signOut: "Sair", getStarted: "Começar",
    dashboard: "Início", home: "Início", myCards: "Meus cartões", newCard: "Novo cartão",
    settings: "Configurações", vault: "Cofre", scanShort: "Digitalizar", settingsShort: "Mais",
    landingCta: "Abrir app", language: "Idioma", save: "Salvar" },
  ru: { signIn: "Войти", signUp: "Создать аккаунт", signOut: "Выйти", getStarted: "Начать",
    dashboard: "Главная", home: "Главная", myCards: "Мои карты", newCard: "Новая карта",
    settings: "Настройки", vault: "Хранилище", scanShort: "Сканер", settingsShort: "Ещё",
    landingCta: "Открыть приложение", language: "Язык", save: "Сохранить" },
  tr: { signIn: "Giriş yap", signUp: "Hesap oluştur", signOut: "Çıkış yap", getStarted: "Başla",
    dashboard: "Ana sayfa", home: "Ana sayfa", myCards: "Kartlarım", newCard: "Yeni kart",
    settings: "Ayarlar", vault: "Kasa", scanShort: "Tara", settingsShort: "Daha",
    landingCta: "Uygulamayı aç", language: "Dil", save: "Kaydet" },
  nl: { signIn: "Inloggen", signUp: "Account maken", signOut: "Uitloggen", getStarted: "Beginnen",
    dashboard: "Start", home: "Start", myCards: "Mijn kaarten", newCard: "Nieuwe kaart",
    settings: "Instellingen", vault: "Kluis", scanShort: "Scannen", settingsShort: "Meer",
    landingCta: "App openen", language: "Taal", save: "Opslaan" },
  pl: { signIn: "Zaloguj się", signUp: "Załóż konto", signOut: "Wyloguj", getStarted: "Zacznij",
    dashboard: "Start", home: "Start", myCards: "Moje karty", newCard: "Nowa karta",
    settings: "Ustawienia", vault: "Skarbiec", scanShort: "Skanuj", settingsShort: "Więcej",
    landingCta: "Otwórz aplikację", language: "Język", save: "Zapisz" },
  zh: { signIn: "登录", signUp: "创建账户", signOut: "退出登录", getStarted: "开始",
    dashboard: "首页", home: "首页", myCards: "我的名片", newCard: "新建名片",
    settings: "设置", vault: "收藏", scanShort: "扫描", settingsShort: "更多",
    landingCta: "打开应用", language: "语言", save: "保存" },
  "zh-TW": { signIn: "登入", signUp: "建立帳戶", signOut: "登出", getStarted: "開始",
    dashboard: "首頁", home: "首頁", myCards: "我的名片", newCard: "新增名片",
    settings: "設定", vault: "收藏", scanShort: "掃描", settingsShort: "更多",
    landingCta: "開啟應用程式", language: "語言", save: "儲存" },
  ja: { signIn: "ログイン", signUp: "アカウント作成", signOut: "ログアウト", getStarted: "始める",
    dashboard: "ホーム", home: "ホーム", myCards: "マイカード", newCard: "新規カード",
    settings: "設定", vault: "保存済み", scanShort: "スキャン", settingsShort: "その他",
    landingCta: "アプリを開く", language: "言語", save: "保存" },
  ko: { signIn: "로그인", signUp: "계정 만들기", signOut: "로그아웃", getStarted: "시작하기",
    dashboard: "홈", home: "홈", myCards: "내 카드", newCard: "새 카드",
    settings: "설정", vault: "보관함", scanShort: "스캔", settingsShort: "더보기",
    landingCta: "앱 열기", language: "언어", save: "저장" },
  hi: { signIn: "साइन इन", signUp: "खाता बनाएँ", signOut: "साइन आउट", getStarted: "शुरू करें",
    dashboard: "होम", home: "होम", myCards: "मेरे कार्ड", newCard: "नया कार्ड",
    settings: "सेटिंग्स", vault: "वॉल्ट", scanShort: "स्कैन", settingsShort: "और",
    landingCta: "ऐप खोलें", language: "भाषा", save: "सहेजें" },
  id: { signIn: "Masuk", signUp: "Buat akun", signOut: "Keluar", getStarted: "Mulai",
    dashboard: "Beranda", home: "Beranda", myCards: "Kartu saya", newCard: "Kartu baru",
    settings: "Pengaturan", vault: "Brankas", scanShort: "Pindai", settingsShort: "Lainnya",
    landingCta: "Buka aplikasi", language: "Bahasa", save: "Simpan" },
  ms: { signIn: "Log masuk", signUp: "Cipta akaun", signOut: "Log keluar", getStarted: "Mula",
    dashboard: "Utama", home: "Utama", myCards: "Kad saya", newCard: "Kad baharu",
    settings: "Tetapan", vault: "Peti", scanShort: "Imbas", settingsShort: "Lagi",
    landingCta: "Buka aplikasi", language: "Bahasa", save: "Simpan" },
  th: { signIn: "เข้าสู่ระบบ", signUp: "สร้างบัญชี", signOut: "ออกจากระบบ", getStarted: "เริ่มต้น",
    dashboard: "หน้าแรก", home: "หน้าแรก", myCards: "การ์ดของฉัน", newCard: "การ์ดใหม่",
    settings: "ตั้งค่า", vault: "ห้องนิรภัย", scanShort: "สแกน", settingsShort: "เพิ่มเติม",
    landingCta: "เปิดแอป", language: "ภาษา", save: "บันทึก" },
  vi: { signIn: "Đăng nhập", signUp: "Tạo tài khoản", signOut: "Đăng xuất", getStarted: "Bắt đầu",
    dashboard: "Trang chủ", home: "Trang chủ", myCards: "Thẻ của tôi", newCard: "Thẻ mới",
    settings: "Cài đặt", vault: "Kho", scanShort: "Quét", settingsShort: "Thêm",
    landingCta: "Mở ứng dụng", language: "Ngôn ngữ", save: "Lưu" },
};

// Deep merge helper: overlay overrides on top of English base.
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
  const d = locale === "en"
    ? en
    : locale === "ar"
      ? merge(en, ar as DeepPartial<Dict>)
      : merge(en, (partial[locale] ?? {}) as DeepPartial<Dict>);
  dictCache.set(locale, d);
  return d;
}

const Ctx = createContext<{ lang: Locale; t: Dict; dir: "ltr" | "rtl" }>({
  lang: DEFAULT_LOCALE,
  t: en,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // Read lang directly from URL params — single source of truth.
  const params = useParams({ strict: false }) as { lang?: string };
  const lang: Locale = isSupportedLocale(params?.lang) ? params.lang : DEFAULT_LOCALE;
  const dir: "ltr" | "rtl" = isRtl(lang) ? "rtl" : "ltr";
  const t = useMemo(() => getDict(lang), [lang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem("cardix_lang", lang); } catch {}
  }, [lang, dir]);

  const value = useMemo(() => ({ lang, t, dir }), [lang, t, dir]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

// Back-compat setLang: navigates to same path under new locale.
// Prefer <LocaleSwitcher /> which handles navigation.
export function useLocale() {
  return useContext(Ctx);
}
