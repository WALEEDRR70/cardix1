// Figma-style inspector primitives: compact rows, scrubbable numbers, color chips.
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Collapsible inspector section with a tiny uppercase header. */
export function PanelSection({
  title,
  right,
  defaultOpen = true,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-border/40">
      <div className="flex items-center gap-1 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", !open && "-rotate-90 rtl:rotate-90")} />
          {title}
        </button>
        {right}
      </div>
      {open && <div className="space-y-1.5 px-3 pb-3">{children}</div>}
    </section>
  );
}

/** One inspector line: fixed-width label + control. */
export function Row({ label, children, align = "center" }: { label?: string; children: React.ReactNode; align?: "center" | "start" }) {
  return (
    <div className={cn("flex gap-2", align === "center" ? "items-center" : "items-start")}>
      {label !== undefined && (
        <span className="w-[68px] shrink-0 truncate text-[11px] text-muted-foreground" title={label}>{label}</span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export const fieldCls =
  "h-7 w-full rounded-md border border-border/50 bg-background/60 px-2 text-[11px] text-foreground outline-none transition focus:border-accent focus:bg-background";

/** Number field with a draggable unit badge (scrub left/right to change). */
export function NumInput({
  value,
  onChange,
  step = 1,
  badge,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  badge?: string;
  min?: number;
  max?: number;
}) {
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v));
  const vRef = useRef(value);
  vRef.current = value;

  function scrub(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const start = vRef.current;
    const move = (ev: PointerEvent) => {
      const delta = Math.round((ev.clientX - startX) / 2) * step * (ev.shiftKey ? 10 : 1);
      onChange(clamp(Number((start + delta).toFixed(2))));
    };
    const up = () => window.removeEventListener("pointermove", move);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  return (
    <div className="flex h-7 items-center rounded-md border border-border/50 bg-background/60 transition focus-within:border-accent">
      {badge && (
        <span
          onPointerDown={scrub}
          title="Drag"
          className="grid h-full w-6 shrink-0 cursor-ew-resize select-none place-items-center rounded-s-md text-[10px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        >
          {badge}
        </span>
      )}
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-full w-full min-w-0 bg-transparent px-1.5 text-[11px] tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

/** Color chip + hex text, with optional transparent / reset shortcuts. */
export function ColorInput({
  value,
  onChange,
  fallback = "#ffffff",
  extra,
}: {
  value?: string | null;
  onChange: (v: string) => void;
  fallback?: string;
  extra?: React.ReactNode;
}) {
  const hex = (value ?? fallback).slice(0, 7);
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-1.5 transition focus-within:border-accent">
      <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded border border-border/60" style={{ background: hex }}>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
      <input
        value={(value ?? "").toUpperCase()}
        placeholder={fallback.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full min-w-0 bg-transparent text-[11px] uppercase tabular-nums outline-none"
      />
      {extra}
    </div>
  );
}

/** Segmented control — the Figma-style pill group. */
export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label?: string; icon?: React.ElementType; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex h-7 items-center gap-0.5 rounded-md border border-border/50 bg-background/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          title={o.title ?? o.label}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex h-full flex-1 items-center justify-center gap-1 rounded-[5px] px-1.5 text-[11px] transition",
            value === o.v ? "bg-accent/20 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.icon && <o.icon className="h-3.5 w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Small ghost button used inside inspector rows. */
export function MiniBtn({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "h-7 whitespace-nowrap rounded-md border border-border/50 px-2 text-[11px] text-muted-foreground transition hover:border-accent/50 hover:text-foreground disabled:opacity-50",
        className,
      )}
    />
  );
}

/** iOS-style switch row. */
export function SwitchRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-2 rounded-md py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
    >
      <span className="truncate">{label}</span>
      <span className={cn("relative h-4 w-7 shrink-0 rounded-full transition", on ? "bg-accent" : "bg-muted")}>
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all",
            on ? "start-3.5" : "start-0.5",
          )}
        />
      </span>
    </button>
  );
}
