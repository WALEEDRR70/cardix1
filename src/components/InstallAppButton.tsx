import { useEffect, useState } from "react";
import { Download, Share, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Lets the user install Cardixn as a web app (home screen / apps page).
 * Uses the native install prompt when available, otherwise shows iOS instructions.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) {
      setShowIosHelp(true);
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  if (installed) {
    return (
      <p className={"flex items-center justify-center gap-2 text-sm text-muted-foreground " + (className ?? "")}>
        <Check className="h-4 w-4" />
        {ar ? "التطبيق مُثبّت على جهازك" : "App installed on this device"}
      </p>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={install}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Download className="h-4 w-4" />
        {ar ? "تثبيت التطبيق على الجهاز" : "Install app on your device"}
      </button>
      {showIosHelp && (
        <p className="mt-2 flex items-start gap-2 px-1 text-[12px] leading-relaxed text-muted-foreground">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {ar
            ? "على آيفون: افتح الموقع في Safari، اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»."
            : "On iPhone: open this site in Safari, tap the Share button, then “Add to Home Screen”."}
        </p>
      )}
    </div>
  );
}
