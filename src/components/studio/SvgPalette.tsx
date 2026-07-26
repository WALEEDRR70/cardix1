// Reads the colors used inside an uploaded SVG and lets the user recolor / hide each one.
import { useMemo } from "react";
import { extractSvgColors, useSvgMarkup } from "@/lib/studio/svg";
import type { NodeStyle } from "@/lib/studio/types";

export function SvgPalette({
  src,
  style,
  onStyle,
  ar,
}: {
  src?: string;
  style: NodeStyle;
  onStyle: (patch: Partial<NodeStyle>) => void;
  ar: boolean;
}) {
  const raw = useSvgMarkup(src);
  const colors = useMemo(() => (raw ? extractSvgColors(raw).slice(0, 14) : []), [raw]);
  const map = style.svgColorMap ?? {};

  const set = (original: string, next: string | null) => {
    const nextMap = { ...map };
    if (next === null) delete nextMap[original];
    else nextMap[original] = next;
    onStyle({ svgColorMap: Object.keys(nextMap).length ? nextMap : null });
  };

  if (!raw) {
    return (
      <p className="text-[10px] text-muted-foreground">
        {ar ? "جارِ قراءة الشعار…" : "Reading the artwork…"}
      </p>
    );
  }

  if (!colors.length) {
    return (
      <p className="text-[10px] text-muted-foreground">
        {ar ? "لم يتم العثور على ألوان قابلة للتعديل داخل الملف." : "No editable colors found inside this file."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {ar ? "ألوان الشعار" : "Artwork colors"}
        </p>
        {Object.keys(map).length > 0 && (
          <button
            type="button"
            onClick={() => onStyle({ svgColorMap: null })}
            className="text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {ar ? "استعادة الكل" : "Reset all"}
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {colors.map(({ color, count }) => {
          const current = map[color];
          const hidden = current === "none";
          return (
            <div key={color} className="flex items-center gap-2 rounded-md border border-border/50 p-1.5">
              <span
                className="h-6 w-6 shrink-0 rounded border border-border/60"
                style={{
                  background: hidden
                    ? "repeating-conic-gradient(#8886 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                    : (current ?? color),
                }}
              />
              <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">{color}</span>
              <span className="w-8 shrink-0 text-[10px] text-muted-foreground">×{count}</span>
              <input
                type="color"
                value={(hidden ? color : (current ?? color)).slice(0, 7)}
                onChange={(e) => set(color, e.target.value)}
                className="h-7 w-full cursor-pointer rounded bg-transparent"
              />
              <button
                type="button"
                onClick={() => set(color, hidden ? color : "none")}
                className={`shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] ${
                  hidden ? "border-accent/60 bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {ar ? "شفاف" : "None"}
              </button>
              {current !== undefined && (
                <button
                  type="button"
                  onClick={() => set(color, null)}
                  className="shrink-0 whitespace-nowrap rounded-md border border-border/60 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {ar ? "الأصلي" : "Reset"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <input
          type="checkbox"
          checked={style.svgRemoveBg === true}
          onChange={(e) => onStyle({ svgRemoveBg: e.target.checked })}
        />
        {ar ? "إزالة خلفية الشعار (المربع الكامل)" : "Remove artwork background (full-bleed rect)"}
      </label>
    </div>
  );
}
