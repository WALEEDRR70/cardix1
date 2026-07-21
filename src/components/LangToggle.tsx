import { useI18n } from "@/lib/i18n";

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      aria-label="Change language"
      className={
        compact
          ? "grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground"
          : "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {lang === "en" ? "ع" : "EN"}
    </button>
  );
}
