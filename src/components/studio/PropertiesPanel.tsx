// Right panel: properties for the current selection (or the canvas background).
import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/lib/studio/store";
import { CARD_SIZES, PLACEHOLDERS, type ImageSource } from "@/lib/studio/types";
import { uploadStudioImage } from "@/lib/studio/upload";

const BG_PRESETS: string[] = [
  "linear-gradient(160deg,#0b0713,#2c125a)",
  "linear-gradient(135deg,#7c34ff,#0b0713)",
  "linear-gradient(135deg,#ffffff,#e9e6f5)",
  "linear-gradient(135deg,#101010,#3a3a3a)",
  "linear-gradient(135deg,#c9a227,#4a3608)",
  "linear-gradient(135deg,#0f3b36,#0b0713)",
];

export function PropertiesPanel({ ar }: { ar: boolean }) {
  const { state, dispatch, selected } = useStudio();
  const n = selected[0];
  const ids = state.selection;

  if (!n) {
    const bg = state.doc.background;
    const activeSize = CARD_SIZES.find((s) => s.w === state.doc.w && s.h === state.doc.h);
    return (
      <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-s border-border/60 bg-card/40 p-4 text-xs">
        <h3 className="text-sm font-semibold">{ar ? "مقاس البطاقة" : "Card size"}</h3>
        <Field label={ar ? "المقاس الجاهز" : "Preset"}>
          <select
            value={activeSize?.key ?? "custom"}
            onChange={(e) => {
              const p = CARD_SIZES.find((s) => s.key === e.target.value);
              if (p) dispatch({ t: "size", w: p.w, h: p.h });
            }}
            className={input}
          >
            {!activeSize && <option value="custom">{ar ? "مخصص" : "Custom"}</option>}
            {CARD_SIZES.map((s) => (
              <option key={s.key} value={s.key}>{ar ? s.labelAr : s.label}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Num label={ar ? "العرض" : "Width"} value={state.doc.w} onChange={(v) => dispatch({ t: "size", w: v, h: state.doc.h })} />
          <Num label={ar ? "الارتفاع" : "Height"} value={state.doc.h} onChange={(v) => dispatch({ t: "size", w: state.doc.w, h: v })} />
        </div>
        <button
          type="button"
          onClick={() => dispatch({ t: "size", w: state.doc.h, h: state.doc.w })}
          className="w-full rounded-md border border-border/60 px-2 py-1.5 text-muted-foreground hover:text-foreground"
        >
          {ar ? "تبديل الاتجاه" : "Swap orientation"}
        </button>

        <h3 className="border-t border-border/50 pt-3 text-sm font-semibold">{ar ? "طبقة الخلفية" : "Background layer"}</h3>
        <Field label={ar ? "اللون" : "Color"}>
          <input type="color" value={bg.color} onChange={(e) => dispatch({ t: "bg", patch: { color: e.target.value } })} className="h-8 w-full rounded bg-transparent" />
        </Field>
        <Field label={ar ? "تدرجات جاهزة" : "Gradient presets"}>
          <div className="grid grid-cols-6 gap-1.5">
            {BG_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                title={g}
                onClick={() => dispatch({ t: "bg", patch: { gradient: g } })}
                className="h-7 rounded-md border border-border/60"
                style={{ background: g }}
              />
            ))}
          </div>
        </Field>
        <Field label={ar ? "تدرج CSS" : "CSS gradient"}>
          <input value={bg.gradient ?? ""} onChange={(e) => dispatch({ t: "bg", patch: { gradient: e.target.value || null } })} className={input} />
        </Field>
        <button
          type="button"
          onClick={() => dispatch({ t: "bg", patch: { gradient: null } })}
          className="w-full rounded-md border border-border/60 px-2 py-1.5 text-muted-foreground hover:text-foreground"
        >
          {ar ? "إزالة التدرج" : "Remove gradient"}
        </button>
        <Field label={ar ? "رابط صورة" : "Image URL"}>
          <input value={bg.image ?? ""} onChange={(e) => dispatch({ t: "bg", patch: { image: e.target.value || null } })} className={input} />
        </Field>
        <UploadButton ar={ar} onDone={(url) => dispatch({ t: "bg", patch: { image: url } })} />
        {bg.image && (
          <>
            <Field label={ar ? "ملاءمة الصورة" : "Image fit"}>
              <select
                value={bg.fit ?? "cover"}
                onChange={(e) => dispatch({ t: "bg", patch: { fit: e.target.value as "cover" | "contain" | "repeat" } })}
                className={input}
              >
                <option value="cover">{ar ? "تغطية" : "Cover"}</option>
                <option value="contain">{ar ? "احتواء" : "Contain"}</option>
                <option value="repeat">{ar ? "تكرار" : "Repeat"}</option>
              </select>
            </Field>
            <Num
              label={ar ? "شفافية الصورة %" : "Image opacity %"}
              value={Math.round((bg.imageOpacity ?? 1) * 100)}
              onChange={(v) => dispatch({ t: "bg", patch: { imageOpacity: Math.min(100, Math.max(0, v)) / 100 } })}
            />
            <button
              type="button"
              onClick={() => dispatch({ t: "bg", patch: { image: null } })}
              className="w-full rounded-md border border-border/60 px-2 py-1.5 text-muted-foreground hover:text-foreground"
            >
              {ar ? "إزالة الصورة" : "Remove image"}
            </button>
          </>
        )}
        <p className="pt-2 text-muted-foreground">{ar ? "اختر عنصرًا لتعديل خصائصه." : "Select an element to edit its properties."}</p>

      </aside>
    );
  }


  const s = n.style;
  const up = (patch: Parameters<typeof dispatch>[0] extends never ? never : Record<string, unknown>) =>
    dispatch({ t: "update", ids, patch });
  const st = (patch: Record<string, unknown>) => dispatch({ t: "style", ids, patch });

  return (
    <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-s border-border/60 bg-card/40 p-4 text-xs">
      <h3 className="text-sm font-semibold">{n.name}</h3>

      <Section title={ar ? "الموضع والحجم" : "Position & size"}>
        <div className="grid grid-cols-2 gap-2">
          <Num label="X" value={n.x} onChange={(v) => up({ x: v })} />
          <Num label="Y" value={n.y} onChange={(v) => up({ y: v })} />
          <Num label="W" value={n.w} onChange={(v) => up({ w: v })} />
          <Num label="H" value={n.h} onChange={(v) => up({ h: v })} />
          <Num label={ar ? "دوران" : "Rotate"} value={n.rot} onChange={(v) => up({ rot: v })} />
          <Num label={ar ? "شفافية" : "Opacity"} value={Math.round(n.opacity * 100)} onChange={(v) => up({ opacity: Math.min(100, Math.max(0, v)) / 100 })} />
        </div>
      </Section>

      {(n.type === "text" || n.type === "button") && (
        <Section title={ar ? "النص" : "Text"}>
          <textarea value={n.text ?? ""} onChange={(e) => up({ text: e.target.value })} rows={3} className={input} />
          <div className="flex flex-wrap gap-1 pt-1">
            {PLACEHOLDERS.map((p) => (
              <button key={p} onClick={() => up({ text: `${n.text ?? ""}${p}` })} className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground">
                {p.replace(/[{}]/g, "")}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Num label={ar ? "الحجم" : "Size"} value={s.fontSize ?? 20} onChange={(v) => st({ fontSize: v })} />
            <Num label={ar ? "السماكة" : "Weight"} value={s.fontWeight ?? 500} onChange={(v) => st({ fontWeight: v })} />
            <Num label={ar ? "تباعد" : "Tracking"} value={s.letterSpacing ?? 0} onChange={(v) => st({ letterSpacing: v })} />
            <Num label={ar ? "ارتفاع السطر" : "Leading"} value={s.lineHeight ?? 1.3} step={0.1} onChange={(v) => st({ lineHeight: v })} />
          </div>
          <Field label={ar ? "المحاذاة" : "Align"}>
            <select value={s.align ?? "left"} onChange={(e) => st({ align: e.target.value })} className={input}>
              <option value="left">left</option><option value="center">center</option><option value="right">right</option>
            </select>
          </Field>
          <Field label={ar ? "لون النص" : "Text color"}>
            <input type="color" value={s.color ?? "#ffffff"} onChange={(e) => st({ color: e.target.value })} className="h-8 w-full rounded bg-transparent" />
          </Field>
        </Section>
      )}

      {n.type === "image" && (
        <Section title={ar ? "الصورة" : "Image"}>
          <p className="text-[10px] text-muted-foreground">{ar ? "مصدر الصورة" : "Image source"}</p>
          <div className="grid grid-cols-3 gap-1">
            {([
              { k: "employee", en: "Employee", arL: "الموظف" },
              { k: "logo", en: "Logo", arL: "الشعار" },
              { k: "upload", en: "Upload", arL: "رفع" },
            ] as { k: ImageSource; en: string; arL: string }[]).map((o) => (
              <button
                key={o.k}
                type="button"
                onClick={() => up({ imageSource: o.k })}
                className={`rounded-md border px-2 py-1.5 text-[11px] ${(n.imageSource ?? "upload") === o.k ? "border-accent/60 bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground"}`}
              >
                {ar ? o.arL : o.en}
              </button>
            ))}
          </div>
          {(n.imageSource ?? "upload") === "upload" ? (
            <>
              <Field label="URL"><input value={n.src ?? ""} onChange={(e) => up({ src: e.target.value })} className={input} /></Field>
              <UploadButton ar={ar} onDone={(url) => up({ src: url, imageSource: "upload" })} />
            </>
          ) : (
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {n.imageSource === "employee"
                ? (ar ? "تُستبدل تلقائيًا بصورة الموظف عند عرض البطاقة." : "Replaced automatically by the employee photo when the card is rendered.")
                : (ar ? "تُستبدل تلقائيًا بشعار الشركة عند عرض البطاقة." : "Replaced automatically by the company logo when the card is rendered.")}
            </p>
          )}

        </Section>
      )}


      {n.type === "path" && (
        <Section title={ar ? "الرسم الحر" : "Free drawing"}>
          <Field label={ar ? "مسار SVG (شبكة ١٠٠×١٠٠)" : "SVG path (100×100 grid)"}>
            <textarea
              value={n.path ?? ""}
              onChange={(e) => up({ path: e.target.value })}
              rows={3}
              className={`${input} font-mono leading-relaxed`}
            />
          </Field>
          <Field label={ar ? "لون الخط" : "Stroke color"}>
            <input type="color" value={(s.stroke ?? "#7c34ff").slice(0, 7)} onChange={(e) => st({ stroke: e.target.value })} className="h-8 w-full rounded bg-transparent" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Num label={ar ? "سماكة الخط" : "Stroke width"} value={s.strokeWidth ?? 0} onChange={(v) => st({ strokeWidth: v })} />
            <Num label={ar ? "تقطيع" : "Dash"} value={Number(s.dash ?? 0)} onChange={(v) => st({ dash: v ? String(v) : null })} />
          </div>
          <button
            onClick={() => st({ fill: "transparent" })}
            className="rounded-lg border border-border/60 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {ar ? "بدون تعبئة (خط فقط)" : "No fill (stroke only)"}
          </button>
        </Section>
      )}

      <Section title={ar ? "المظهر" : "Appearance"}>

        <Field label={ar ? "التعبئة" : "Fill"}>
          <input type="color" value={(s.fill ?? "#7c34ff").slice(0, 7)} onChange={(e) => st({ fill: e.target.value })} className="h-8 w-full rounded bg-transparent" />
        </Field>
        <Field label={ar ? "تدرج CSS" : "CSS gradient"}>
          <input value={s.gradient ?? ""} onChange={(e) => st({ gradient: e.target.value || null })} className={input} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Num label={ar ? "الاستدارة" : "Radius"} value={s.radius ?? 0} onChange={(v) => st({ radius: v })} />
          <Num label={ar ? "الحشوة" : "Padding"} value={s.padding ?? 0} onChange={(v) => st({ padding: v })} />
          <Num label={ar ? "الحد" : "Border"} value={s.borderWidth ?? 0} onChange={(v) => st({ borderWidth: v })} />
          <Num label={ar ? "ضبابية" : "Blur"} value={s.blur ?? 0} onChange={(v) => st({ blur: v })} />
        </div>
        <Field label={ar ? "لون الحد" : "Border color"}>
          <input type="color" value={s.borderColor ?? "#ffffff"} onChange={(e) => st({ borderColor: e.target.value })} className="h-8 w-full rounded bg-transparent" />
        </Field>
        <Field label={ar ? "الظل" : "Shadow"}>
          <select value={s.shadow ?? ""} onChange={(e) => st({ shadow: e.target.value || null })} className={input}>
            <option value="">none</option>
            <option value="0 8px 24px rgba(0,0,0,.35)">soft</option>
            <option value="0 18px 50px rgba(0,0,0,.55)">deep</option>
          </select>
        </Field>
        <Field label={ar ? "توهج" : "Glow"}>
          <input value={s.glow ?? ""} placeholder="#7c34ff88" onChange={(e) => st({ glow: e.target.value || null })} className={input} />
        </Field>
      </Section>

      <Section title={ar ? "الظهور" : "Visibility"}>
        <div className="flex gap-2">
          <Toggle on={!n.hidden} onClick={() => up({ hidden: !n.hidden })}>{ar ? "ظاهر" : "Visible"}</Toggle>
          <Toggle on={n.locked} onClick={() => up({ locked: !n.locked })}>{ar ? "مقفل" : "Locked"}</Toggle>
        </div>
      </Section>
    </aside>
  );
}

const input =
  "w-full rounded-md border border-border/60 bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-accent";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-border/50 pt-3 first:border-0 first:pt-0">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function UploadButton({ ar, onDone }: { ar: boolean; onDone: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onDone(await uploadStudioImage(file));
            toast.success(ar ? "تم رفع الصورة" : "Image uploaded");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : ar ? "تعذّر الرفع" : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border/60 px-2 py-1.5 text-muted-foreground hover:text-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? (ar ? "جارٍ الرفع…" : "Uploading…") : ar ? "رفع صورة" : "Upload image"}
      </button>
    </>
  );
}

function Num({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <Field label={label}>
      <input type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} className={input} />
    </Field>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md border px-2 py-1.5 ${on ? "border-accent/60 bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
