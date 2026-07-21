export const SUPPORTED_LOCALES = [
  "en", "ar", "fr", "de", "es", "it", "pt", "ru", "tr", "nl",
  "pl", "zh", "zh-TW", "ja", "ko", "hi", "id", "ms", "th", "vi",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const RTL_LOCALES: readonly Locale[] = ["ar"];

export const SITE_ORIGIN = "https://cardix1.lovable.app";

export const LOCALE_META: Record<Locale, {
  nativeName: string;
  englishName: string;
  flag: string;
  ogLocale: string;
}> = {
  en: { nativeName: "English", englishName: "English", flag: "🇺🇸", ogLocale: "en_US" },
  ar: { nativeName: "العربية", englishName: "Arabic", flag: "🇸🇦", ogLocale: "ar_SA" },
  fr: { nativeName: "Français", englishName: "French", flag: "🇫🇷", ogLocale: "fr_FR" },
  de: { nativeName: "Deutsch", englishName: "German", flag: "🇩🇪", ogLocale: "de_DE" },
  es: { nativeName: "Español", englishName: "Spanish", flag: "🇪🇸", ogLocale: "es_ES" },
  it: { nativeName: "Italiano", englishName: "Italian", flag: "🇮🇹", ogLocale: "it_IT" },
  pt: { nativeName: "Português", englishName: "Portuguese", flag: "🇵🇹", ogLocale: "pt_PT" },
  ru: { nativeName: "Русский", englishName: "Russian", flag: "🇷🇺", ogLocale: "ru_RU" },
  tr: { nativeName: "Türkçe", englishName: "Turkish", flag: "🇹🇷", ogLocale: "tr_TR" },
  nl: { nativeName: "Nederlands", englishName: "Dutch", flag: "🇳🇱", ogLocale: "nl_NL" },
  pl: { nativeName: "Polski", englishName: "Polish", flag: "🇵🇱", ogLocale: "pl_PL" },
  zh: { nativeName: "简体中文", englishName: "Chinese (Simplified)", flag: "🇨🇳", ogLocale: "zh_CN" },
  "zh-TW": { nativeName: "繁體中文", englishName: "Chinese (Traditional)", flag: "🇹🇼", ogLocale: "zh_TW" },
  ja: { nativeName: "日本語", englishName: "Japanese", flag: "🇯🇵", ogLocale: "ja_JP" },
  ko: { nativeName: "한국어", englishName: "Korean", flag: "🇰🇷", ogLocale: "ko_KR" },
  hi: { nativeName: "हिन्दी", englishName: "Hindi", flag: "🇮🇳", ogLocale: "hi_IN" },
  id: { nativeName: "Bahasa Indonesia", englishName: "Indonesian", flag: "🇮🇩", ogLocale: "id_ID" },
  ms: { nativeName: "Bahasa Melayu", englishName: "Malay", flag: "🇲🇾", ogLocale: "ms_MY" },
  th: { nativeName: "ไทย", englishName: "Thai", flag: "🇹🇭", ogLocale: "th_TH" },
  vi: { nativeName: "Tiếng Việt", englishName: "Vietnamese", flag: "🇻🇳", ogLocale: "vi_VN" },
};

export function isSupportedLocale(v: string | undefined | null): v is Locale {
  return !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v);
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const langs = navigator.languages ?? [navigator.language];
  for (const raw of langs) {
    if (!raw) continue;
    if (isSupportedLocale(raw)) return raw;
    const base = raw.split("-")[0];
    if (isSupportedLocale(base)) return base;
    // handle zh-TW / zh-HK
    if (raw.toLowerCase().startsWith("zh-tw") || raw.toLowerCase().startsWith("zh-hk")) return "zh-TW";
    if (base === "zh") return "zh";
  }
  return DEFAULT_LOCALE;
}

export function isRtl(locale: Locale): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}
