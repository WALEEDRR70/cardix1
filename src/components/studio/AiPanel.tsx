// AI Designer: upload a card (or write a brief), strip its content,
// rebuild an editable, art-directed template + variations.
import { useRef, useState } from "react";
import { Upload, Sparkles, Loader2, Wand2, Type, Layers, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { analyzeCardImage, type AiCardAnalysis } from "@/lib/studio/ai.functions";
import { buildVariation, VARIATIONS, type VariationKey } from "@/lib/studio/variations";
import { FONT_PAIRS, FONT_PAIR_KEYS, type FontPairKey } from "@/lib/studio/fonts";
import { useStudio } from "@/lib/studio/store";

export function AiPanel({ ar }: { ar: boolean }) {
  const { dispatch } = useStudio();
  const analyze = useServerFn(analyzeCardImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [brief, setBrief] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AiCardAnalysis | null>(null);
  const [active, setActive] = useState<VariationKey>("modern");

  function fail(e: unknown) {
    const msg = (e as Error).message;
    toast.error(
      msg.includes("RATE_LIMIT") ? (ar ? "محاولات كثيرة، حاول لاحقًا" : "Rate limited, try again shortly")
        : msg.includes("NO_CREDITS") ? (ar ? "نفد رصيد الذكاء الاصطناعي" : "AI credits exhausted")
          : (ar ? "تعذر إنشاء التصميم" : "Could not generate the design"),
    );
  }

  async function run(payload: { image?: string; mime?: string; aspect?: number }) {
    setBusy(true);
    try {
      const analysis = await analyze({
        data: { ...payload, mime: payload.mime ?? "image/png", brief: brief.trim() || undefined },
      });
      setResult(analysis);
      apply(analysis, active);
      toast.success(ar ? "تم إنشاء قالب قابل للتحرير" : "Editable template generated");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

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
    void run({ image: dataUrl, mime: file.type || "image/png", aspect });
  }

  function apply(a: AiCardAnalysis, key: VariationKey) {
    setActive(key);
    dispatch({ t: "replace", doc: buildVariation(a, key) });
  }

  function setPair(pair: FontPairKey) {
    if (!result) return;
    const next = { ...result, typography: { ...result.typography, pair } };
    setResult(next);
    apply(next, active);
  }

  function tweakFinish(patch: Partial<AiCardAnalysis["finish"]>) {
    if (!result) return;
    const next = { ...result, finish: { ...result.finish, ...patch } };
    setResult(next);
    apply(next, active);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 text-xs">
      <p className="text-muted-foreground">
        {ar
          ? "ارفع بطاقة أو اكتب وصفًا فقط. مدير فني افتراضي يقرأ الهوية، يعيد بناء الشبكة والطباعة والتشطيبات، ويسلّمك قالبًا قابلًا للتحرير بالكامل."
          : "Upload a card or just write a brief. A virtual art director reads the identity, rebuilds the grid, typography and print finishes, and hands you a fully editable template."}
      </p>

      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={3}
        maxLength={600}
        placeholder={ar ? "وصف فني: مثال — استوديو معماري، أسود ورمادي، طباعة صارمة، خط رفيع ذهبي" : "Art direction: e.g. architecture studio, ink black, strict typography, hairline gold rule"}
        className="w-full resize-none rounded-xl border border-border/60 bg-background/40 p-2.5 leading-relaxed outline-none transition focus:border-accent/60"
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 px-3 py-4 font-medium text-muted-foreground transition hover:border-accent/60 hover:text-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {ar ? "رفع بطاقة" : "Upload card"}
        </button>
        <button
          onClick={() => (brief.trim() ? void run({}) : toast.error(ar ? "اكتب وصفًا أولًا" : "Write a brief first"))}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-4 font-semibold text-accent-foreground transition disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
          {ar ? "صمّم من الوصف" : "Design from brief"}
        </button>
      </div>
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
            <Row label={ar ? "المزاج" : "Mood"} value={result.mood} />
            <div className="flex items-center gap-1.5 pt-1">
              {Object.values(result.palette).map((c) => (
                <span key={c} title={c} className="h-5 flex-1 rounded" style={{ background: c }} />
              ))}
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">{result.notes}</p>
            {result.critique.length > 0 && (
              <ul className="list-disc space-y-0.5 ps-4 text-[11px] text-muted-foreground/90">
                {result.critique.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
          </div>

          <Section icon={<Type className="h-3 w-3" />} title={ar ? "الطباعة" : "Typography"}>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_PAIR_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setPair(k)}
                  style={{ fontFamily: FONT_PAIRS[k].heading }}
                  className={`truncate rounded-lg border px-2 py-2 text-[13px] transition ${
                    result.typography.pair === k
                      ? "border-accent/70 bg-accent/15 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Aa · {k}
                </button>
              ))}
            </div>
            <label className="mt-2 flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{ar ? "اسم بأحرف كبيرة" : "Uppercase name"}</span>
              <input
                type="checkbox"
                checked={result.typography.uppercaseName}
                onChange={(e) => {
                  const next = { ...result, typography: { ...result.typography, uppercaseName: e.target.checked } };
                  setResult(next); apply(next, active);
                }}
              />
            </label>
          </Section>

          <Section icon={<Layers className="h-3 w-3" />} title={ar ? "التشطيب" : "Finish"}>
            <Slider label={ar ? "حبيبات" : "Grain"} value={result.finish.grain} onChange={(v) => tweakFinish({ grain: v })} />
            <Slider label={ar ? "لمعة معدنية" : "Foil"} value={result.finish.foil} onChange={(v) => tweakFinish({ foil: v })} />
            <Slider label={ar ? "توهج" : "Bloom"} value={result.finish.bloom} onChange={(v) => tweakFinish({ bloom: v })} />
            <Slider label={ar ? "إطار" : "Frame"} value={result.finish.frame / 6} onChange={(v) => tweakFinish({ frame: v * 6 })} />
            <label className="flex items-center justify-between gap-2 pt-1">
              <span className="text-muted-foreground">{ar ? "خط فاصل" : "Divider rule"}</span>
              <input type="checkbox" checked={result.finish.rule} onChange={(e) => tweakFinish({ rule: e.target.checked })} />
            </label>
          </Section>

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
            onClick={() => void run(preview ? { image: preview } : {})}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 font-semibold text-accent-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {ar ? "توليد اتجاه فني جديد" : "New art direction"}
          </button>
        </>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}{title}
      </p>
      {children}
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <input
        type="range" min={0} max={1} step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[hsl(var(--accent))]"
      />
      <span className="w-8 text-end tabular-nums text-muted-foreground">{Math.round(value * 100)}</span>
    </label>
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
