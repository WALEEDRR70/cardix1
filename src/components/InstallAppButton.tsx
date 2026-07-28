import { useEffect, useState } from "react";
import { Download, Share, Check, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  getInstallState,
  isStandalone,
  promptInstall,
  subscribeInstallState,
} from "@/lib/pwa-install";

/**
 * Lets the user install Cardixn as a web app (home screen / apps page).
 * The install prompt is captured globally at app start, so a single click
 * launches the real browser installation immediately.
 */
export function InstallAppButton({ className }: { className?: string }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [state, setState] = useState({ canInstall: false, installed: false });
  const [busy, setBusy] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const sync = () => setState({ ...getInstallState(), installed: getInstallState().installed || isStandalone() });
    sync();
    return subscribeInstallState(sync);
  }, []);

  async function install() {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "unavailable") setShowIosHelp(true);
      if (outcome === "accepted") setState((s) => ({ ...s, installed: true }));
    } finally {
      setBusy(false);
    }
  }

  if (state.installed) {
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
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--gradient-gold)" }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {ar ? "تثبيت التطبيق على الجهاز" : "Install app on your device"}
      </button>
      {showIosHelp && (
        <p className="mt-2 flex items-start gap-2 px-1 text-[12px] leading-relaxed text-muted-foreground">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {ar
            ? "متصفحك لا يدعم التثبيت التلقائي. على آيفون: افتح الموقع في Safari، اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»."
            : "Your browser doesn't support one-tap install. On iPhone: open this site in Safari, tap Share, then “Add to Home Screen”."}
        </p>
      )}
    </div>
  );
}
