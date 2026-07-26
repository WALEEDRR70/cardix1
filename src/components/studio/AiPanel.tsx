// AI Designer: upload a card, strip its content, rebuild an editable template + variations.
import { useRef, useState } from "react";
import { Upload, Sparkles, Loader2, Wand2, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { analyzeCardImage, type AiCardAnalysis } from "@/lib/studio/ai.functions";
import { buildVariation, canvasFromAspect, VARIATIONS, type VariationKey } from "@/lib/studio/variations";
import { CARD_SIZES } from "@/lib/studio/types";
import { useStudio } from "@/lib/studio/store";

type SizeKey = "original" | string;

export function AiPanel({ ar }: { ar: boolean }) {
  const { dispatch } = useStudio();
  const analyze = useServerFn(analyzeCardImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AiCardAnalysis | null>(null);
  const [active, setActive] = useState<VariationKey>("modern");
  const [sizeKey, setSizeKey] = useState<SizeKey>("original");


  async function onFile(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      toast.error(ar ? "الحد الأقصى 8 ميجابايت" : "Max size is 8MB");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    setPreview(dataUrl);
    // measure the real orientation of the uploaded card
    const aspect = await new Promise<number>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / Math.max(1, img.naturalHeight));
      img.onerror = () => resolve(0.64);
      img.src = dataUrl;
    });
    setBusy(true);
    try {
      const analysis = await analyze({ data: { image: dataUrl, mime: file.type || "image/png", aspect } });
      setResult(analysis);
      apply(analysis, active, sizeKey);
      toast.success(ar ? "تم إنشاء قالب قابل للتحرير" : "Editable template generated");

    } catch (e) {
      const msg = (e as Error).message;
      toast.error(
        msg.includes("RATE_LIMIT") ? (ar ? "محاولات كثيرة، حاول لاحقًا" : "Rate limited, try again shortly")
          : msg.includes("NO_CREDITS") ? (ar ? "نفد رصيد الذكاء الاصطناعي" : "AI credits exhausted")
            : (ar ? "تعذر تحليل البطاقة" : "Could not analyse the card"),
      );
    } finally {
      setBusy(false);
    }
  }

  function sizeOf(a: AiCardAnalysis, key: SizeKey) {
    if (key === "original") return canvasFromAspect(a.aspect ?? 0.64);
    const s = CARD_SIZES.find((x) => x.key === key);
    return s ? { w: s.w, h: s.h } : canvasFromAspect(a.aspect ?? 0.64);
  }

  function apply(a: AiCardAnalysis, key: VariationKey, size: SizeKey = sizeKey) {
    setActive(key);
    setSizeKey(size);
    dispatch({ t: "replace", doc: buildVariation(a, key, sizeOf(a, size)) });
  }


  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 text-xs">
      <p className="text-muted-foreground">
        {ar
          ? "ارفع بطاقة موجودة. سنحذف كل النصوص والشعارات وبيانات التواصل، ونعيد بناء الهوية البصرية كقالب قابل للتحرير بالكامل."
          : "Upload an existing card. We strip every text, logo and contact detail, then rebuild the visual identity as a fully editable template."}
      </p>

      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 px-3 py-6 font-medium text-muted-foreground transition hover:border-accent/60 hover:text-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? (ar ? "جارٍ التحليل…" : "Analysing…") : (ar ? "رفع بطاقة" : "Upload a card")}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }}
      />

      {preview && (
        <img src={preview} alt="" className="w-full rounded-lg border border-border/60 object-cover opacity-70" />
      )}

      {result && (
        <>
          <div className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-3">
            <Row label={ar ? "النمط" : "Style"} value={result.style} />
            <Row label={ar ? "المجال" : "Industry"} value={result.industry} />
            <Row label={ar ? "الخط المقترح" : "Suggested font"} value={result.fonts.suggested} />
            <div className="flex items-center gap-1.5 pt-1">
              {Object.values(result.palette).map((c) => (
                <span key={c} title={c} className="h-5 flex-1 rounded" style={{ background: c }} />
              ))}
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">{result.notes}</p>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Ruler className="h-3 w-3" />
              {ar ? "نفس الهوية بكل المقاسات" : "Same identity, every size"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[{ key: "original", label: "Original size", labelAr: "مقاس الأصل", w: 0, h: 0 }, ...CARD_SIZES].map((s) => {
                const dim = s.key === "original" ? canvasFromAspect(result.aspect ?? 0.64) : { w: s.w, h: s.h };
                const on = sizeKey === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => apply(result, active, s.key)}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left transition ${
                      on ? "border-accent/70 bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="shrink-0 rounded-[3px] border border-current/60"
                      style={{
                        width: dim.w >= dim.h ? 20 : Math.max(8, Math.round((dim.w / dim.h) * 20)),
                        height: dim.w >= dim.h ? Math.max(8, Math.round((dim.h / dim.w) * 20)) : 20,
                      }}
                    />
                    <span className="min-w-0 truncate">{ar ? s.labelAr : s.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {ar
                ? "يعيد الذكاء ترتيب العناصر باحتراف لكل مقاس بدل تمديد التصميم."
                : "The layout is professionally re-flowed for each format instead of being stretched."}
            </p>
          </div>


          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {ar ? "١٠ تنويعات" : "10 variations"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {VARIATIONS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => apply(result, v.key)}
                  className={`rounded-lg border px-2 py-2 transition ${
                    active === v.key
                      ? "border-accent/70 bg-accent/15 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ar ? v.ar : v.en}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => apply(result, active)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {ar ? "إعادة التوليد" : "Regenerate"}
          </button>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
