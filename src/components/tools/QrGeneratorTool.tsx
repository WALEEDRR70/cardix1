import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function QrGeneratorTool({ lang }: { lang: Locale }) {
  const isAr = lang === "ar";
  const [text, setText] = useState("https://cardix1.lovable.app");
  const [fg, setFg] = useState("#0f0524");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text || " ", {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: fg, light: bg },
    }).catch(() => {});
  }, [text, fg, bg, size]);

  const download = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">{isAr ? "المحتوى (رابط، نص، رقم…)" : "Content (URL, text, phone…)"}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">{isAr ? "لون الأمامية" : "Foreground"}</span>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/60 bg-background/50" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{isAr ? "لون الخلفية" : "Background"}</span>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border/60 bg-background/50" />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">{isAr ? "الحجم" : "Size"}: {size}px</span>
          <input type="range" min={256} max={2000} step={128} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <button
          onClick={download}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
        >
          <Download className="size-4" /> {isAr ? "تنزيل PNG" : "Download PNG"}
        </button>
      </div>

      <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-white p-4">
        <canvas ref={canvasRef} className="max-w-[260px] h-auto" />
      </div>
    </div>
  );
}
