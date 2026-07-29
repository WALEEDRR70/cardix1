// Colour dots under a template thumbnail: tapping one re-tints the whole design live,
// so users immediately see that any template can adopt their own colour.
import { RotateCcw } from "lucide-react";

export const TEMPLATE_SWATCHES = [
  "#7c3aed",
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#111827",
] as const;

export function TemplateColorSwatches({
  value,
  onChange,
  ar,
}: {
  /** Currently applied colour, or null when the template shows its original palette. */
  value: string | null;
  onChange: (color: string | null) => void;
  ar: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
      <span className="me-1 text-[10px] text-muted-foreground">
        {ar ? "لوّن القالب" : "Recolor"}
      </span>
      {TEMPLATE_SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          title={ar ? "طبّق هذا اللون" : "Apply this colour"}
          aria-label={ar ? `طبّق اللون ${c}` : `Apply colour ${c}`}
          onClick={() => onChange(value === c ? null : c)}
          className={
            "h-5 w-5 rounded-full border transition hover:scale-110 " +
            (value === c
              ? "border-foreground ring-2 ring-accent ring-offset-1 ring-offset-background"
              : "border-border/60")
          }
          style={{ background: c }}
        />
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title={ar ? "إرجاع الألوان الأصلية" : "Reset original colours"}
          className="rounded-full border border-border/60 p-1 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
