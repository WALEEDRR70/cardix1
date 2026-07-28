/**
 * Global capture of the browser's install prompt.
 *
 * `beforeinstallprompt` usually fires right after the page loads — long before
 * the settings page mounts. Capturing it here (imported from the root route)
 * means the deferred event is already in memory, so the install button can
 * trigger the real installation on the very first click.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Listener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

if (typeof window !== "undefined") {
  installed = isStandalone();
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    emit();
  });
}

export function subscribeInstallState(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}


export function getInstallState() {
  return { canInstall: deferredPrompt !== null, installed };
}

/** Triggers the native install flow. Returns the outcome. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  const evt = deferredPrompt;
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  deferredPrompt = null;
  if (outcome === "accepted") installed = true;
  emit();
  return outcome;
}
