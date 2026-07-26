// Right panel: properties for the current selection (or the canvas background).
import { useStudio } from "@/lib/studio/store";
import { PLACEHOLDERS } from "@/lib/studio/types";

export function PropertiesPanel({ ar }: { ar: boolean }) {
  const { state, dispatch, selected } = useStudio();
  const n = selected[0];
  const ids = state.selection;

  if (!n) {
    const bg = state.doc.background;
    return (
      <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-s border-border/60 bg-card/40 p-4 text-xs">
        <h3 className="text-sm font-semibold">{ar ? "خلفية البطاقة" : "Card background"}</h3>
        <Field label={ar ? "اللون" : "Color"}>
          <input type="color" value={bg.color} onChange={(e) => dispatch({ t: "bg", patch: { color: e.target.value } })} className="h-8 w-full rounded bg-transparent" />
        </Field>
        <Field label={ar ? "تدرج CSS" : "CSS gradient"}>
          <input value={bg.gradient ?? ""} onChange={(e) => dispatch({ t: "bg", patch: { gradient: e.target.value || null } })} className={input} />
        </Field>
        <Field label={ar ? "رابط صورة" : "Image URL"}>
          <input value={bg.image ?? ""} onChange={(e) => dispatch({ t: "bg", patch: { image: e.target.value || null } })} className={input} />
        </Field>
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
          <Field label="URL"><input value={n.src ?? ""} onChange={(e) => up({ src: e.target.value })} className={input} /></Field>
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
