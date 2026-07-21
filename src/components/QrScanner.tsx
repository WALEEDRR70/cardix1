import { useEffect, useRef, useState } from "react";
import { X, RotateCcw, Loader2, QrCode } from "lucide-react";
import jsQR from "jsqr";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetect: (text: string) => void;
};

export function QrScanner({ open, onClose, onDetect }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    detectedRef.current = false;
    setError(null);
    setReady(false);

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not available in this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
          startLoop();
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Camera unavailable";
        setError(
          /permission|denied|notallowed/i.test(msg)
            ? "Camera permission denied. Enable it in your browser settings."
            : msg,
        );
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing]);

  function startLoop() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tick = () => {
      if (detectedRef.current) return;
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          // downscale for speed
          const scale = Math.min(1, 480 / Math.max(w, h));
          canvas.width = Math.floor(w * scale);
          canvas.height = Math.floor(h * scale);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (code?.data) {
            detectedRef.current = true;
            onDetect(code.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm">
      <div className="relative flex h-full w-full flex-col">
        <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)]">
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium text-white/90">{t.scanQr}</p>
          <button
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
            aria-label="Flip camera"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative aspect-square w-[78%] max-w-sm rounded-3xl border border-white/40">
              <span className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-2xl border-l-[3px] border-t-[3px] border-accent" />
              <span className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-2xl border-r-[3px] border-t-[3px] border-accent" />
              <span className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-2xl border-b-[3px] border-l-[3px] border-accent" />
              <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-2xl border-b-[3px] border-r-[3px] border-accent" />
            </div>
          </div>

          {!ready && !error && (
            <div className="absolute inset-0 grid place-items-center text-white/80">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {error && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-white/10 p-4 text-center text-sm text-white backdrop-blur">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4 text-white/80">
          <QrCode className="h-4 w-4" />
          <p className="text-xs">{t.pointAtQr}</p>
        </div>
      </div>
    </div>
  );
}
