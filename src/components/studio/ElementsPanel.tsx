// Left rail: element library, layer tree and AI panel — Figma-style chrome.
import { useState } from "react";
import {
  Type, Image as ImageIcon, Square, Circle, Triangle, Minus, QrCode, Nfc, Link2,
  Star, MapPin, Video, Sparkles, Eye, EyeOff, Lock, Unlock, Copy, Trash2,
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, GripVertical, Group, Ungroup, User, Building2,
  Shapes, Layers, Wand2, Search,
} from "lucide-react";
import { useStudio } from "@/lib/studio/store";
import type { NodeType, StudioNode } from "@/lib/studio/types";
import { cn } from "@/lib/utils";
import { AiPanel } from "./AiPanel";

type Item = {
  key: string; label: string; labelAr: string; icon: React.ElementType;
  group: "content" | "shapes" | "vector" | "media";
  make: () => [NodeType, Partial<StudioNode>];
};

const ITEMS: Item[] = [
  { key: "text", label: "Text", labelAr: "نص", icon: Type, group: "content", make: () => ["text", { name: "Text", text: "Your text", w: 300, h: 48 }] },
  { key: "name", label: "Name", labelAr: "الاسم", icon: User, group: "content", make: () => ["text", { name: "Name", text: "{{Employee Name}}", w: 380, h: 56, style: { fontSize: 40, fontWeight: 700 } }] },
  { key: "job", label: "Job title", labelAr: "المسمى", icon: Building2, group: "content", make: () => ["text", { name: "Job title", text: "{{Job Title}}", w: 340, h: 36, style: { fontSize: 20, color: "#c9c2d8" } }] },
  { key: "button", label: "Button", labelAr: "زر", icon: Link2, group: "content", make: () => ["button", { name: "Button", text: "Save contact", w: 240, h: 56 }] },
  { key: "badge", label: "Badge", labelAr: "شارة", icon: Star, group: "content", make: () => ["button", { name: "Badge", text: "Premium", w: 140, h: 40, style: { fontSize: 14, fill: "#ffffff1a", color: "#fff" } }] },
  { key: "qr", label: "QR", labelAr: "QR", icon: QrCode, group: "content", make: () => ["qr", { name: "QR", w: 160, h: 160 }] },
  { key: "nfc", label: "NFC", labelAr: "NFC", icon: Nfc, group: "content", make: () => ["icon", { name: "NFC", w: 48, h: 48, icon: "nfc" }] },

  { key: "rect", label: "Rectangle", labelAr: "مستطيل", icon: Square, group: "shapes", make: () => ["shape", { name: "Rectangle", shape: "rect", w: 240, h: 160 }] },
  { key: "ellipse", label: "Ellipse", labelAr: "دائرة", icon: Circle, group: "shapes", make: () => ["shape", { name: "Ellipse", shape: "ellipse", w: 180, h: 180 }] },
  { key: "triangle", label: "Triangle", labelAr: "مثلث", icon: Triangle, group: "shapes", make: () => ["shape", { name: "Triangle", shape: "triangle", w: 160, h: 160 }] },
  { key: "line", label: "Divider", labelAr: "فاصل", icon: Minus, group: "shapes", make: () => ["line", { name: "Divider", w: 320, h: 2 }] },
  { key: "glass", label: "Glass panel", labelAr: "لوح زجاجي", icon: Square, group: "shapes", make: () => ["shape", { name: "Glass panel", shape: "rect", w: 420, h: 220, style: { fill: "#ffffff14", blur: 14, radius: 28, borderWidth: 1, borderColor: "#ffffff33" } }] },
  { key: "gradient", label: "Gradient", labelAr: "تدرج", icon: Sparkles, group: "shapes", make: () => ["shape", { name: "Gradient", shape: "rect", w: 460, h: 300, style: { gradient: "linear-gradient(135deg,#7c34ff,#2c125a)", radius: 32 } }] },

  { key: "pen", label: "Free curve", labelAr: "منحنى حر", icon: Sparkles, group: "vector", make: () => ["path", { name: "Free curve", w: 320, h: 200, path: "M 4 78 C 26 18, 62 96, 96 22", style: { fill: "transparent", stroke: "#7c34ff", strokeWidth: 4, cap: "round" } }] },
  { key: "blade", label: "Vector blade", labelAr: "شريط متجهي", icon: Sparkles, group: "vector", make: () => ["path", { name: "Vector blade", w: 380, h: 260, path: "M 0 70 C 30 10, 70 90, 100 26 L 100 100 L 0 100 Z", style: { fill: "#7c34ff55", stroke: null, strokeWidth: 0 } }] },

  { key: "photo", label: "Photo", labelAr: "الصورة", icon: ImageIcon, group: "media", make: () => ["image", { name: "Photo", w: 180, h: 180, style: { radius: 999 } }] },
  { key: "logo", label: "Logo", labelAr: "الشعار", icon: Sparkles, group: "media", make: () => ["image", { name: "Logo", w: 140, h: 60, style: { radius: 8 } }] },
  { key: "map", label: "Map", labelAr: "خريطة", icon: MapPin, group: "media", make: () => ["image", { name: "Map", w: 300, h: 180, style: { radius: 20 } }] },
  { key: "video", label: "Video", labelAr: "فيديو", icon: Video, group: "media", make: () => ["image", { name: "Video", w: 320, h: 180, style: { radius: 20 } }] },
];

const GROUPS: { key: Item["group"]; en: string; ar: string }[] = [
  { key: "content", en: "Card content", ar: "محتوى البطاقة" },
  { key: "shapes", en: "Shapes", ar: "الأشكال" },
  { key: "vector", en: "Vector", ar: "متجهات" },
  { key: "media", en: "Media", ar: "الوسائط" },
];

const TABS = [
  { key: "elements", icon: Shapes, en: "Elements", ar: "العناصر" },
  { key: "layers", icon: Layers, en: "Layers", ar: "الطبقات" },
  { key: "ai", icon: Wand2, en: "AI", ar: "الذكاء" },
] as const;

export function ElementsPanel({ ar }: { ar: boolean }) {
  const [tab, setTab] = useState<"elements" | "layers" | "ai">("elements");

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-e border-border/60 bg-card/40">
      <div className="flex items-center gap-1 border-b border-border/50 p-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition",
              tab === t.key ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {ar ? t.ar : t.en}
          </button>
        ))}
      </div>
      {tab === "elements" ? <Library ar={ar} /> : tab === "layers" ? <LayersPanel ar={ar} /> : <AiPanel ar={ar} />}
    </aside>
  );
}

function Library({ ar }: { ar: boolean }) {
  const { addNode } = useStudio();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-2">
        <div className="flex h-7 items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-2 focus-within:border-accent">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar ? "ابحث عن عنصر…" : "Search elements…"}
            className="h-full w-full bg-transparent text-[11px] outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {GROUPS.map((g) => {
          const items = ITEMS.filter(
            (i) => i.group === g.key && (!term || i.label.toLowerCase().includes(term) || i.labelAr.includes(term)),
          );
          if (!items.length) return null;
          return (
            <div key={g.key} className="mb-3">
              <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {ar ? g.ar : g.en}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {items.map((it) => (
                  <button
                    key={it.key}
                    title={ar ? it.labelAr : it.label}
                    onClick={() => { const [type, patch] = it.make(); addNode(type, patch); }}
                    className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-border/50 bg-background/40 p-1 text-[9px] leading-tight text-muted-foreground transition hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/10 hover:text-foreground"
                  >
                    <it.icon className="h-4 w-4 transition group-hover:text-accent" />
                    <span className="w-full truncate text-center">{ar ? it.labelAr : it.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayersPanel({ ar }: { ar: boolean }) {
  const { state, dispatch, list } = useStudio();
  const ordered = [...list].reverse();
  const [drag, setDrag] = useState<string[] | null>(null);
  const [over, setOver] = useState<{ id: string; place: "before" | "after" | "inside" } | null>(null);

  const sel = state.selection;

  function onDragStart(e: React.DragEvent, id: string) {
    const ids = sel.includes(id) ? sel : [id];
    setDrag(ids);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ids.join(","));
  }

  function onDragOver(e: React.DragEvent, n: StudioNode) {
    if (!drag || drag.includes(n.id)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const p = (e.clientY - r.top) / r.height;
    const isGroup = n.type === "group";
    const place = isGroup && p > 0.3 && p < 0.7 ? "inside" : p < 0.5 ? "before" : "after";
    setOver((o) => (o?.id === n.id && o.place === place ? o : { id: n.id, place }));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (drag && over) {
      // Layer list is reversed (top = front), so flip before/after for doc order.
      const place = over.place === "inside" ? "inside" : over.place === "before" ? "after" : "before";
      dispatch({ t: "reorder", ids: drag, targetId: over.id, place });
    }
    setDrag(null);
    setOver(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-0.5 border-b border-border/50 px-1.5 py-1.5">
        <IconBtn title={ar ? "تجميع" : "Group"} onClick={() => dispatch({ t: "group", ids: sel })}><Group className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn title={ar ? "فك التجميع" : "Ungroup"} onClick={() => sel[0] && dispatch({ t: "ungroup", id: sel[0] })}><Ungroup className="h-3.5 w-3.5" /></IconBtn>
        <span className="mx-0.5 h-4 w-px bg-border/60" />
        <IconBtn title={ar ? "إلى المقدمة" : "To front"} onClick={() => sel[0] && dispatch({ t: "order", id: sel[0], dir: "front" })}><ChevronsUp className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn title={ar ? "للأمام" : "Forward"} onClick={() => sel[0] && dispatch({ t: "order", id: sel[0], dir: "forward" })}><ChevronUp className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn title={ar ? "للخلف" : "Backward"} onClick={() => sel[0] && dispatch({ t: "order", id: sel[0], dir: "backward" })}><ChevronDown className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn title={ar ? "إلى الخلف" : "To back"} onClick={() => sel[0] && dispatch({ t: "order", id: sel[0], dir: "back" })}><ChevronsDown className="h-3.5 w-3.5" /></IconBtn>
        <span className="mx-0.5 h-4 w-px bg-border/60" />
        <IconBtn title={ar ? "تكرار" : "Duplicate"} onClick={() => dispatch({ t: "duplicate", ids: sel })}><Copy className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn title={ar ? "حذف" : "Delete"} onClick={() => dispatch({ t: "remove", ids: sel })}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
      </div>
      <ul
        className="flex-1 overflow-y-auto p-1.5 text-xs"
        onDragOver={(e) => { if (drag) e.preventDefault(); }}
        onDrop={onDrop}
        onDragLeave={() => setOver(null)}
      >
        {ordered.map(({ node: n, depth }) => {
          const hint = over?.id === n.id ? over.place : null;
          return (
            <li key={n.id} onDragOver={(e) => onDragOver(e, n)} onDrop={onDrop}>
              <div
                draggable={!n.locked}
                onDragStart={(e) => onDragStart(e, n.id)}
                onDragEnd={() => { setDrag(null); setOver(null); }}
                onClick={(e) => dispatch({
                  t: "select",
                  ids: e.shiftKey || e.metaKey || e.ctrlKey
                    ? (sel.includes(n.id) ? sel.filter((s) => s !== n.id) : [...sel, n.id])
                    : [n.id],
                })}
                className={cn(
                  "group flex items-center gap-1.5 rounded-md px-1.5 py-1 transition",
                  n.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                  sel.includes(n.id) ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:bg-muted/40",
                  drag?.includes(n.id) && "opacity-40",
                  hint === "before" && "border-t-2 border-t-accent",
                  hint === "after" && "border-b-2 border-b-accent",
                  hint === "inside" && "ring-1 ring-accent/70",
                )}
                style={{ paddingInlineStart: 6 + depth * 12 }}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-50" />
                <input
                  value={n.name}
                  onChange={(e) => dispatch({ t: "update", ids: [n.id], patch: { name: e.target.value } })}
                  onDragStart={(e) => e.preventDefault()}
                  className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
                />
                <button
                  className={cn("shrink-0 transition", n.hidden ? "opacity-100" : "opacity-0 group-hover:opacity-70")}
                  onClick={(e) => { e.stopPropagation(); dispatch({ t: "update", ids: [n.id], patch: { hidden: !n.hidden } }); }}
                >
                  {n.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  className={cn("shrink-0 transition", n.locked ? "opacity-100" : "opacity-0 group-hover:opacity-70")}
                  onClick={(e) => { e.stopPropagation(); dispatch({ t: "update", ids: [n.id], patch: { locked: !n.locked } }); }}
                >
                  {n.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </button>
              </div>
            </li>
          );
        })}
        <li>
          <div
            onClick={() => dispatch({ t: "select", ids: [] })}
            className={cn(
              "mt-1 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border/60 px-2 py-1.5 text-[11px]",
              sel.length === 0 ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:bg-muted/40",
            )}
          >
            <ImageIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="flex-1 truncate">{ar ? "الخلفية" : "Background"}</span>
            <span
              className="h-4 w-6 shrink-0 rounded border border-border/60"
              style={{
                background: state.doc.background.gradient ?? state.doc.background.color,
                backgroundImage: state.doc.background.image ? `url(${state.doc.background.image})` : undefined,
                backgroundSize: "cover",
              }}
            />
          </div>
        </li>
      </ul>
      <p className="border-t border-border/50 px-3 py-1.5 text-[10px] text-muted-foreground/70">
        {ar ? "اسحب الطبقة لإعادة ترتيبها أو أفلتها داخل مجموعة" : "Drag a layer to reorder, or drop it inside a group"}
      </p>
    </div>
  );
}

function IconBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
    >
      {children}
    </button>
  );
}
