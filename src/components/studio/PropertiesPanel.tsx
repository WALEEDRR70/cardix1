// Right inspector: Figma-style properties for the selection (or the canvas).
import { useRef, useState } from "react";
import {
  Loader2, Upload, AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, Lock, Unlock,
  Type, Image as ImageIcon, Square, QrCode, Minus, Spline, Layers, Frame, MousePointerSquareDashed,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/lib/studio/store";
import { CARD_SIZES, type ImageSource, type NodeType } from "@/lib/studio/types";
import { uploadStudioImage } from "@/lib/studio/upload";
import { isSvgSrc } from "@/lib/studio/svg";
import { SvgPalette } from "@/components/studio/SvgPalette";
import { GradientEditor } from "@/components/studio/GradientEditor";
import { PanelSection, Row, NumInput, ColorInput, Seg, MiniBtn, SwitchRow, fieldCls } from "@/components/studio/inspector";

const BG_PRESETS: string[] = [
  "linear-gradient(160deg,#0b0713,#2c125a)",
  "linear-gradient(135deg,#7c34ff,#0b0713)",
  "linear-gradient(135deg,#ffffff,#e9e6f5)",
  "linear-gradient(135deg,#101010,#3a3a3a)",
  "linear-gradient(135deg,#c9a227,#4a3608)",
  "linear-gradient(135deg,#0f3b36,#0b0713)",
];

const TYPE_ICON: Record<NodeType, React.ElementType> = {
  text: Type, image: ImageIcon, shape: Square, line: Minus, qr: QrCode,
  icon: Frame, button: MousePointerSquareDashed, group: Layers, path: Spline,
};

const shell = "flex w-[268px] shrink-0 flex-col overflow-y-auto border-s border-border/60 bg-card/40";

export function PropertiesPanel({ ar }: { ar: boolean }) {
  const { state, dispatch, selected } = useStudio();
  const n = selected[0];
  const ids = state.selection;

  if (!n) {
    const bg = state.doc.background;
    const activeSize = CARD_SIZES.find((s) => s.w === state.doc.w && s.h === state.doc.h);
    return (
      <aside className={shell}>
        <PanelHeader icon={Frame} title={ar ? "اللوحة" : "Canvas"} sub={`${state.doc.w} × ${state.doc.h}`} />

        <PanelSection title={ar ? "مقاس البطاقة" : "Card size"}>
          <Row label={ar ? "جاهز" : "Preset"}>
            <select
              value={activeSize?.key ?? "custom"}
              onChange={(e) => {
                const p = CARD_SIZES.find((s) => s.key === e.target.value);
                if (p) dispatch({ t: "size", w: p.w, h: p.h });
              }}
              className={fieldCls}
            >
              {!activeSize && <option value="custom">{ar ? "مخصص" : "Custom"}</option>}
              {CARD_SIZES.map((s) => (
                <option key={s.key} value={s.key}>{ar ? s.labelAr : s.label}</option>
              ))}
            </select>
          </Row>
          <div className="grid grid-cols-2 gap-1.5">
            <NumInput badge="W" value={state.doc.w} onChange={(v) => dispatch({ t: "size", w: v, h: state.doc.h })} />
            <NumInput badge="H" value={state.doc.h} onChange={(v) => dispatch({ t: "size", w: state.doc.w, h: v })} />
          </div>
          <MiniBtn className="w-full" onClick={() => dispatch({ t: "size", w: state.doc.h, h: state.doc.w })}>
            {ar ? "تبديل الاتجاه" : "Swap orientation"}
          </MiniBtn>
        </PanelSection>

        <PanelSection title={ar ? "الخلفية" : "Background"}>
          <Row label={ar ? "اللون" : "Color"}>
            <ColorInput value={bg.color} fallback="#0b0713" onChange={(v) => dispatch({ t: "bg", patch: { color: v } })} />
          </Row>
          <div className="grid grid-cols-6 gap-1 pt-0.5">
            {BG_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                title={g}
                onClick={() => dispatch({ t: "bg", patch: { gradient: g } })}
                className="h-6 rounded-md border border-border/50 transition hover:scale-105 hover:border-accent/60"
                style={{ background: g }}
              />
            ))}
          </div>
          <GradientEditor
            ar={ar}
            value={bg.gradient}
            onChange={(css) => dispatch({ t: "bg", patch: { gradient: css } })}
            onRemove={() => dispatch({ t: "bg", patch: { gradient: null } })}
          />
        </PanelSection>

        <PanelSection title={ar ? "صورة الخلفية" : "Background image"} defaultOpen={!!bg.image}>
          <Row label="URL">
            <input value={bg.image ?? ""} onChange={(e) => dispatch({ t: "bg", patch: { image: e.target.value || null } })} className={fieldCls} />
          </Row>
          <UploadButton ar={ar} onDone={(url) => dispatch({ t: "bg", patch: { image: url } })} />
          {bg.image && (
            <>
              <Row label={ar ? "الملاءمة" : "Fit"}>
                <Seg
                  value={(bg.fit ?? "cover") as "cover" | "contain" | "repeat"}
                  options={[
                    { v: "cover", label: ar ? "تغطية" : "Cover" },
                    { v: "contain", label: ar ? "احتواء" : "Contain" },
                    { v: "repeat", label: ar ? "تكرار" : "Tile" },
                  ]}
                  onChange={(v) => dispatch({ t: "bg", patch: { fit: v } })}
                />
              </Row>
              <Row label={ar ? "الشفافية" : "Opacity"}>
                <NumInput
                  badge="%"
                  min={0}
                  max={100}
                  value={Math.round((bg.imageOpacity ?? 1) * 100)}
                  onChange={(v) => dispatch({ t: "bg", patch: { imageOpacity: Math.min(100, Math.max(0, v)) / 100 } })}
                />
              </Row>
              <MiniBtn className="w-full" onClick={() => dispatch({ t: "bg", patch: { image: null } })}>
                {ar ? "إزالة الصورة" : "Remove image"}
              </MiniBtn>
            </>
          )}
        </PanelSection>

        <p className="p-3 text-[11px] leading-relaxed text-muted-foreground/80">
          {ar ? "اختر عنصرًا على اللوحة لتعديل خصائصه." : "Select an element on the canvas to edit its properties."}
        </p>
      </aside>
    );
  }

  const s = n.style;
  const up = (patch: Record<string, unknown>) => dispatch({ t: "update", ids, patch });
  const st = (patch: Record<string, unknown>) => dispatch({ t: "style", ids, patch });

  return (
    <aside className={shell}>
      <PanelHeader
        icon={TYPE_ICON[n.type] ?? Layers}
        title={n.name}
        sub={ids.length > 1 ? (ar ? `${ids.length} عناصر محددة` : `${ids.length} selected`) : n.type}
        right={
          <div className="flex items-center gap-0.5">
            <HeadBtn title={ar ? "إظهار/إخفاء" : "Show / hide"} onClick={() => up({ hidden: !n.hidden })}>
              {n.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </HeadBtn>
            <HeadBtn title={ar ? "قفل" : "Lock"} onClick={() => up({ locked: !n.locked })}>
              {n.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </HeadBtn>
          </div>
        }
      />

      <PanelSection title={ar ? "التخطيط" : "Layout"}>
        <div className="grid grid-cols-2 gap-1.5">
          <NumInput badge="X" value={Math.round(n.x)} onChange={(v) => up({ x: v })} />
          <NumInput badge="Y" value={Math.round(n.y)} onChange={(v) => up({ y: v })} />
          <NumInput badge="W" value={Math.round(n.w)} onChange={(v) => up({ w: v })} />
          <NumInput badge="H" value={Math.round(n.h)} onChange={(v) => up({ h: v })} />
          <NumInput badge="°" value={Math.round(n.rot)} onChange={(v) => up({ rot: v })} />
          <NumInput badge="%" min={0} max={100} value={Math.round(n.opacity * 100)} onChange={(v) => up({ opacity: Math.min(100, Math.max(0, v)) / 100 })} />
        </div>
      </PanelSection>

      {(n.type === "text" || n.type === "button") && (
        <PanelSection title={ar ? "النص" : "Text"}>
          {/\{\{[^}]+\}\}/.test(n.text ?? "") ? (
            <p className="rounded-md border border-border/50 bg-background/40 px-2 py-1.5 text-[11px] text-muted-foreground">
              {ar
                ? "هذا الحقل يُعبّأ تلقائيًا من بيانات الموظف."
                : "This field fills automatically from the employee data."}
            </p>
          ) : (
            <textarea
              value={n.text ?? ""}
              onChange={(e) => up({ text: e.target.value })}
              rows={2}
              className={`${fieldCls} h-auto resize-y py-1.5 leading-relaxed`}
            />
          )}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <NumInput badge="Aa" value={s.fontSize ?? 20} onChange={(v) => st({ fontSize: v })} />
            <NumInput badge="W" step={100} value={s.fontWeight ?? 500} onChange={(v) => st({ fontWeight: v })} />
            <NumInput badge="LS" step={0.5} value={s.letterSpacing ?? 0} onChange={(v) => st({ letterSpacing: v })} />
            <NumInput badge="LH" step={0.1} value={s.lineHeight ?? 1.3} onChange={(v) => st({ lineHeight: v })} />
          </div>
          <Row label={ar ? "المحاذاة" : "Align"}>
            <Seg
              value={(s.align ?? "left") as "left" | "center" | "right"}
              options={[
                { v: "left", icon: AlignLeft, title: "Left" },
                { v: "center", icon: AlignCenter, title: "Center" },
                { v: "right", icon: AlignRight, title: "Right" },
              ]}
              onChange={(v) => st({ align: v })}
            />
          </Row>
          <Row label={ar ? "اللون" : "Color"}>
            <ColorInput value={s.color} onChange={(v) => st({ color: v })} />
          </Row>
          {n.type === "text" && (
            <Row label={ar ? "حد الأسطر" : "Max lines"}>
              <div className="flex items-center gap-1.5">
                <NumInput badge="≡" min={0} value={s.maxLines ?? 0} onChange={(v) => st({ maxLines: v > 0 ? Math.round(v) : null })} />
                <span className="text-[10px] text-muted-foreground">{ar ? "٠ = بلا حد" : "0 = none"}</span>
              </div>
            </Row>
          )}
        </PanelSection>
      )}

      {n.type === "image" && (
        <PanelSection title={ar ? "الصورة" : "Image"}>
          <Row label={ar ? "المصدر" : "Source"}>
            <Seg
              value={(n.imageSource ?? "upload") as ImageSource}
              options={[
                { v: "employee" as ImageSource, label: ar ? "الموظف" : "Employee" },
                { v: "logo" as ImageSource, label: ar ? "الشعار" : "Logo" },
                { v: "upload" as ImageSource, label: ar ? "رفع" : "Upload" },
              ]}
              onChange={(v) => up({ imageSource: v })}
            />
          </Row>
          <Row label={ar ? "الملاءمة" : "Fit"}>
            <Seg
              value={(s.imageFit ?? (n.imageSource === "logo" ? "contain" : "cover")) as "cover" | "contain"}
              options={[
                { v: "contain" as const, label: ar ? "كامل" : "Contain" },
                { v: "cover" as const, label: ar ? "ملء" : "Cover" },
              ]}
              onChange={(v) => st({ imageFit: v })}
            />
          </Row>
          {(n.imageSource ?? "upload") === "upload" ? (
            <>
              <Row label="URL">
                <input value={n.src ?? ""} onChange={(e) => up({ src: e.target.value })} className={fieldCls} />
              </Row>
              <UploadButton ar={ar} onDone={(url) => up({ src: url, imageSource: "upload" })} />
            </>
          ) : (
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {n.imageSource === "employee"
                ? (ar ? "تُستبدل تلقائيًا بصورة الموظف عند عرض البطاقة." : "Replaced automatically by the employee photo when the card is rendered.")
                : (ar ? "تُستبدل تلقائيًا بشعار الشركة عند عرض البطاقة." : "Replaced automatically by the company logo when the card is rendered.")}
            </p>
          )}

          {isSvgSrc(n.src) && (
            <div className="mt-1 space-y-1.5 rounded-lg border border-border/50 bg-background/30 p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{ar ? "تحكم SVG" : "SVG"}</p>
                <MiniBtn
                  className="h-6"
                  onClick={() => st({ svgColorMap: null, svgRemoveBg: false, svgFill: null, svgStroke: null, svgStrokeWidth: null })}
                >
                  {ar ? "إعادة ضبط" : "Reset"}
                </MiniBtn>
              </div>
              <SwitchRow
                label={ar ? "تفعيل التحكم بالألوان" : "Enable color control"}
                on={s.svgInline !== false}
                onChange={(v) => st({ svgInline: v })}
              />
              {s.svgInline !== false && (
                <>
                  <SvgPalette src={n.src} style={s} onStyle={st} ar={ar} />
                  <Row label={ar ? "تعبئة" : "Fill"}>
                    <ColorInput
                      value={s.svgFill}
                      onChange={(v) => st({ svgFill: v })}
                      extra={
                        <>
                          <MiniBtn className="h-5 border-0 px-1" onClick={() => st({ svgFill: "none" })}>{ar ? "شفاف" : "None"}</MiniBtn>
                          <MiniBtn className="h-5 border-0 px-1" onClick={() => st({ svgFill: null })}>{ar ? "أصلي" : "Orig"}</MiniBtn>
                        </>
                      }
                    />
                  </Row>
                  <Row label={ar ? "الإطار" : "Stroke"}>
                    <ColorInput
                      value={s.svgStroke}
                      fallback="#7c34ff"
                      onChange={(v) => st({ svgStroke: v })}
                      extra={<MiniBtn className="h-5 border-0 px-1" onClick={() => st({ svgStroke: null, svgStrokeWidth: null })}>{ar ? "أصلي" : "Orig"}</MiniBtn>}
                    />
                  </Row>
                  <Row label={ar ? "السماكة" : "Width"}>
                    <NumInput badge="◻" step={0.5} value={s.svgStrokeWidth ?? 0} onChange={(v) => st({ svgStrokeWidth: v })} />
                  </Row>
                </>
              )}
            </div>
          )}
        </PanelSection>
      )}

      {n.type === "icon" && (
        <PanelSection title={ar ? "الأيقونة" : "Icon"}>
          <Row label={ar ? "لون الشعار" : "Glyph color"}>
            <ColorInput
              value={s.color ?? "#ffffff"}
              fallback="#ffffff"
              onChange={(v) => st({ color: v })}
              extra={<MiniBtn className="h-5 border-0 px-1" onClick={() => st({ color: null })}>{ar ? "أصلي" : "Orig"}</MiniBtn>}
            />
          </Row>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {ar
              ? "لون الشعار داخل الأيقونة. لون الخلفية يُضبط من قسم التعبئة."
              : "Color of the glyph inside the icon. Background is set in the Fill section."}
          </p>
        </PanelSection>
      )}

      {n.type === "path" && (

        <PanelSection title={ar ? "المسار المتجهي" : "Vector path"}>
          <textarea
            value={n.path ?? ""}
            onChange={(e) => up({ path: e.target.value })}
            rows={2}
            className={`${fieldCls} h-auto resize-y py-1.5 font-mono leading-relaxed`}
          />
          <Row label={ar ? "الخط" : "Stroke"}>
            <ColorInput value={s.stroke} fallback="#7c34ff" onChange={(v) => st({ stroke: v })} />
          </Row>
          <div className="grid grid-cols-2 gap-1.5">
            <NumInput badge="◻" value={s.strokeWidth ?? 0} onChange={(v) => st({ strokeWidth: v })} />
            <NumInput badge="⋯" value={Number(s.dash ?? 0)} onChange={(v) => st({ dash: v ? String(v) : null })} />
          </div>
          <MiniBtn className="w-full" onClick={() => st({ fill: "transparent" })}>
            {ar ? "بدون تعبئة (خط فقط)" : "No fill (stroke only)"}
          </MiniBtn>
        </PanelSection>
      )}

      <PanelSection title={ar ? "التعبئة" : "Fill"} defaultOpen={n.type !== "text"}>
        <Row label={ar ? "اللون" : "Color"}>
          <div className="flex items-center gap-1">
            <ColorInput value={s.fill} fallback="#7c34ff" onChange={(v) => st({ fill: v })} />
            <MiniBtn
              className={s.fill === "transparent" ? "border-accent/60 text-accent" : ""}
              onClick={() => st({ fill: "transparent", gradient: null })}
            >
              {ar ? "شفاف" : "None"}
            </MiniBtn>
          </div>
        </Row>

        <div className="grid grid-cols-6 gap-1 pt-0.5">
          {BG_PRESETS.map((g) => (
            <button
              key={g}
              type="button"
              title={g}
              onClick={() => st({ gradient: g })}
              className="h-6 rounded-md border border-border/50 transition hover:scale-105 hover:border-accent/60"
              style={{ background: g }}
            />
          ))}
        </div>
        <GradientEditor ar={ar} value={s.gradient} onChange={(css: string) => st({ gradient: css })} onRemove={() => st({ gradient: null })} />
      </PanelSection>

      <PanelSection title={ar ? "المظهر" : "Appearance"} defaultOpen={n.type !== "text"}>
        <div className="grid grid-cols-2 gap-1.5">
          <NumInput badge="⌒" value={s.radius ?? 0} onChange={(v) => st({ radius: v })} />
          <NumInput badge="⇱" value={s.padding ?? 0} onChange={(v) => st({ padding: v })} />
          <NumInput badge="▭" value={s.borderWidth ?? 0} onChange={(v) => st({ borderWidth: v })} />
          <NumInput badge="✦" value={s.blur ?? 0} onChange={(v) => st({ blur: v })} />
        </div>
        <Row label={ar ? "لون الحد" : "Border"}>
          <ColorInput value={s.borderColor} onChange={(v) => st({ borderColor: v })} />
        </Row>
        <Row label={ar ? "الظل" : "Shadow"}>
          <Seg
            value={(s.shadow ?? "") as string}
            options={[
              { v: "", label: ar ? "بدون" : "None" },
              { v: "0 8px 24px rgba(0,0,0,.35)", label: ar ? "ناعم" : "Soft" },
              { v: "0 18px 50px rgba(0,0,0,.55)", label: ar ? "عميق" : "Deep" },
            ]}
            onChange={(v) => st({ shadow: v || null })}
          />
        </Row>
        <Row label={ar ? "توهج" : "Glow"}>
          <input value={s.glow ?? ""} placeholder="#7c34ff88" onChange={(e) => st({ glow: e.target.value || null })} className={fieldCls} />
        </Row>
      </PanelSection>
    </aside>
  );
}

function PanelHeader({
  icon: Icon, title, sub, right,
}: { icon: React.ElementType; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/50 bg-card/80 px-3 py-2.5 backdrop-blur">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold leading-tight">{title}</p>
        {sub && <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

function HeadBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
    >
      {children}
    </button>
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
      <MiniBtn className="flex w-full items-center justify-center gap-2" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? (ar ? "جارٍ الرفع…" : "Uploading…") : ar ? "رفع صورة" : "Upload image"}
      </MiniBtn>
    </>
  );
}
