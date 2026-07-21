import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="glass rounded-full px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition hover:shadow-soft"
      aria-label="Toggle language"
    >
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}
