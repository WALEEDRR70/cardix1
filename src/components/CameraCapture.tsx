import { useEffect, useRef, useState } from "react";
import { Camera, X, RotateCcw, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

export function CameraCapture({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setReady(false);

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(t.cameraUnavailable);
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : t.cameraUnavailable;
        setError(msg);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, facing]);

  async function shoot() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", 0.92)
    );
    if (!blob) return;
    const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm">
      <div className="relative flex h-full w-full flex-col">
        <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)]">
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium text-white/90">{t.scanCard}</p>
          <button
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
            aria-label={t.flipCamera}
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

          {/* Frame guide */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative aspect-[1.6/1] w-[86%] max-w-md rounded-2xl border border-white/40">
              <span className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-white" />
              <span className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-white" />
              <span className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-white" />
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-white" />
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

        <div className="flex items-center justify-center px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4">
          <button
            onClick={shoot}
            disabled={!ready}
            className="grid h-20 w-20 place-items-center rounded-full bg-white text-black shadow-2xl transition active:scale-95 disabled:opacity-50"
            aria-label={t.capture}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full ring-2 ring-black/20">
              <Camera className="h-6 w-6" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
