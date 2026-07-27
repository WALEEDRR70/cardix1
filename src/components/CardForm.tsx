import { useState, useRef, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { CardPreview, TEMPLATE_META, type TemplateId } from "@/components/CardPreview";
import { useServerFn } from "@tanstack/react-start";
import { generateBio } from "@/lib/bio.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Upload, X, Check, Plus, Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SOCIALS } from "@/lib/socials";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { recolorDesign } from "@/lib/studio/recolor";
import type { StudioDoc } from "@/lib/studio/types";


export interface CardFormData {
  name: string;
  slug: string;
  title: string;
  company: string;
  bio: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  avatar_url: string;
  accent_color: string;
  template: string;
  is_published: boolean;
  socials: Record<string, string>;
}

const ACCENTS = [
  "#7c34ff", "#a78bfa", "#8B5CF6", "#4f46e5", "#22D3EE", "#38bdf8",
  "#10B981", "#84cc16", "#eab308", "#F97316", "#EF4444", "#EC4899",
  "#f472b6", "#c9a96e", "#D4AF37", "#F5F5F5", "#94a3b8", "#0a0a0a",
];

export function CardForm({
  initial,
  onSubmit,
  submitLabel,
  locked,
  lockedNote,
  allowedTemplates,
  design,
  slugPrefix = "/c/",
}: {
  initial: CardFormData;
  onSubmit: (data: CardFormData, extra?: { design?: unknown }) => Promise<void>;
  submitLabel: string;
  /** Fields owned by the company that the employee cannot change. */
  locked?: Partial<Record<keyof CardFormData, boolean>>;
  lockedNote?: string;
  /** When set, only these template ids may be picked. */
  allowedTemplates?: string[];
  /** Saved Studio design for this card; when present the live preview shows it and the template picker is hidden. */
  design?: unknown;
  slugPrefix?: string;
}) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<CardFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const genBio = useServerFn(generateBio);
  const tplScrollRef = useDragScroll<HTMLDivElement>();


  async function uploadAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signed?.signedUrl) setData((d) => ({ ...d, avatar_url: signed.signedUrl }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  async function aiBio() {
    if (!data.name.trim()) return toast.error(t.name);
    setGenBusy(true);
    try {
      const out = await genBio({ data: { name: data.name, title: data.title, company: data.company, lang } });
      if (out.bio) setData((d) => ({ ...d, bio: out.bio }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t.aiError);
    } finally {
      setGenBusy(false);
    }
  }

  const set = <K extends keyof CardFormData>(k: K, v: CardFormData[K]) => setData((d) => ({ ...d, [k]: v }));

  /** Studio design re-tinted live with the picked accent color. */
  const accentChanged = !!design && data.accent_color !== initial.accent_color;
  const previewDesign = useMemo(() => {
    if (!design || !accentChanged) return design;
    try {
      return recolorDesign(design as StudioDoc, initial.accent_color, data.accent_color);
    } catch {
      return design;
    }
  }, [design, accentChanged, initial.accent_color, data.accent_color]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(data, accentChanged ? { design: previewDesign } : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 lg:items-start">
      <div className="space-y-6 lg:order-1">
        {/* Live preview (mobile: inline top) */}
        <div className="flex justify-center lg:hidden">
          <CardPreview card={{ ...data, design: previewDesign }} size="md" />
        </div>



      {lockedNote && (
        <div className="flex items-start gap-2 rounded-2xl border border-border/70 bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{lockedNote}</span>
        </div>
      )}

      {/* Template picker */}
      <section hidden={!!locked?.template || !!design}>
        <label className="mb-2 block px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t.template}</label>
        <div ref={tplScrollRef} className="no-scrollbar -mx-4 flex cursor-grab gap-2.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {TEMPLATE_META.filter((tpl) => !allowedTemplates || allowedTemplates.includes(tpl.id)).map((tpl) => {
            const active = data.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => set("template", tpl.id as TemplateId)}
                className="group flex snap-start shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className={
                    "relative block overflow-hidden rounded-xl border transition " +
                    (active ? "border-accent ring-2 ring-accent shadow-glow" : "border-border/60")
                  }
                  style={{ width: 72, height: 46, background: tpl.preview }}
                >
                  {active && (
                    <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className={"text-[10px] font-medium tracking-wide transition " + (active ? "text-foreground" : "text-muted-foreground")}>
                  {(t.templates as Record<string, string>)[tpl.id] ?? tpl.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>


      {/* Accent color */}
      <section hidden={!!locked?.accent_color}>
        <label className="mb-2 block px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t.accent}</label>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("accent_color", c)}
              aria-label={c}
              className={"h-8 w-8 rounded-full ring-offset-2 ring-offset-background transition " + (data.accent_color === c ? "ring-2 ring-ring scale-110" : "hover:scale-105")}
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            className="relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-border text-[10px] text-muted-foreground hover:border-accent hover:text-foreground"
            title={t.customColor}
          >
            <span aria-hidden>+</span>
            <input
              type="color"
              value={data.accent_color || "#7c34ff"}
              onChange={(e) => set("accent_color", e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <div className="ml-1 flex items-center gap-1.5 rounded-full border border-input bg-card px-2 py-1">
            <span className="h-4 w-4 rounded-full border border-border" style={{ background: data.accent_color }} />
            <input
              value={data.accent_color}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set("accent_color", v);
              }}
              maxLength={7}
              spellCheck={false}
              className="w-[72px] bg-transparent text-[11px] font-mono uppercase outline-none"
            />
          </div>
          {accentChanged && (
            <button
              type="button"
              onClick={() => set("accent_color", initial.accent_color)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              {lang === "ar" ? "إعادة الألوان الأصلية" : "Reset original colors"}
            </button>
          )}
        </div>
        {!!design && (
          <p className="mt-2 px-1 text-[11px] text-muted-foreground">
            {lang === "ar"
              ? "تغيير اللون المميز يعيد تلوين تصميم البطاقة بالكامل."
              : "Changing the accent recolors the whole card design."}
          </p>
        )}
      </section>



      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <section>
          <label className="mb-2 block px-1 text-xs font-medium text-muted-foreground">{t.avatar}</label>
          <div className="flex items-center gap-3">
            <div
              className="h-16 w-16 shrink-0 rounded-2xl border border-border bg-muted bg-cover bg-center"
              style={{ backgroundImage: data.avatar_url ? `url(${data.avatar_url})` : undefined }}
            />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs hover:bg-muted disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" /> {uploading ? t.uploading : t.uploadPhoto}
            </button>
            {data.avatar_url && (
              <button
                type="button"
                onClick={() => set("avatar_url", "")}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </section>

        <Field label={t.name} value={data.name} onChange={(v) => set("name", v)} required />
        <Field label={t.slug} value={data.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required prefix={slugPrefix} locked={locked?.slug} />

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.title} value={data.title} onChange={(v) => set("title", v)} />
          <Field label={t.company} value={data.company} onChange={(v) => set("company", v)} locked={locked?.company} />
        </div>

        <section>
          <div className="mb-1 flex items-center justify-between px-1">
            <label className="text-xs font-medium text-muted-foreground">{t.bio}</label>
            <button
              type="button"
              onClick={aiBio}
              disabled={genBusy}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              <Sparkles className="h-3 w-3" /> {genBusy ? t.generating : t.generateBio}
            </button>
          </div>
          <textarea
            value={data.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.phone} value={data.phone} onChange={(v) => set("phone", v)} />
          <Field label={t.whatsapp} value={data.whatsapp} onChange={(v) => set("whatsapp", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.email} value={data.email} onChange={(v) => set("email", v)} type="email" />
          <Field label={t.website} value={data.website} onChange={(v) => set("website", v)} locked={locked?.website} />
        </div>
        <Field label={t.address} value={data.address} onChange={(v) => set("address", v)} locked={locked?.address} />

        {/* Social accounts */}
        <SocialsEditor
          value={data.socials}
          onChange={(next) => set("socials", next)}
        />

        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <input type="checkbox" checked={data.is_published} onChange={(e) => set("is_published", e.target.checked)} className="h-4 w-4 accent-accent" />
          <span>{t.published}</span>
        </label>

        <button
          disabled={saving}
          className="mt-3 mb-24 w-full rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60 lg:mb-2"
          style={{ background: "var(--gradient-gold)" }}
        >
          {saving ? "…" : submitLabel}
        </button>

      </form>
      </div>

      {/* Desktop sticky preview */}
      <aside className="hidden lg:block lg:order-2">
        <div className="sticky top-8 space-y-4">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] opacity-40 blur-2xl" style={{ background: "var(--gradient-mesh)" }} />
            <div className="relative flex justify-center">
              <CardPreview card={{ ...data, design: previewDesign }} size="lg" />
            </div>
          </div>
          <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{t.livePreview}</p>
        </div>
      </aside>
    </div>
  );
}


function Field({ label, value, onChange, required, type = "text", prefix, locked }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; prefix?: string; locked?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
        {label}
        {locked && <Lock className="h-3 w-3" />}
      </label>
      <div className={"flex items-center rounded-2xl border border-input bg-card focus-within:ring-2 focus-within:ring-ring " + (locked ? "opacity-60" : "")}>
        {prefix && <span className="pl-4 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type={type}
          required={required}
          value={value}
          readOnly={locked}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}

function SocialsEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const { t } = useI18n();
  const [picker, setPicker] = useState(false);
  const active = SOCIALS.filter((s) => s.id in value);
  const remaining = SOCIALS.filter((s) => !(s.id in value));

  const setVal = (id: string, v: string) => onChange({ ...value, [id]: v });
  const remove = (id: string) => {
    const next = { ...value };
    delete next[id];
    onChange(next);
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Social accounts
        </label>
        <button
          type="button"
          onClick={() => setPicker((p) => !p)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {picker && remaining.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-3 sm:grid-cols-6">
          {remaining.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setVal(s.id, "");
                setPicker(false);
              }}
              className="group flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              title={s.name}
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-white transition group-hover:scale-105"
                style={{ background: s.color }}
              >
                <s.Icon className="h-4 w-4" />
              </span>
              <span className="line-clamp-1">{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-2">
          {active.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-2xl border border-input bg-card pr-2 focus-within:ring-2 focus-within:ring-ring">
              <span
                className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: s.color }}
                title={s.name}
              >
                <s.Icon className="h-4 w-4" />
              </span>
              <input
                value={value[s.id]}
                onChange={(e) => setVal(s.id, e.target.value)}
                placeholder={s.placeholder}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={t.remove}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && !picker && (
        <p className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-center text-xs text-muted-foreground">
          Add your X, Instagram, LinkedIn, TikTok, YouTube and more.
        </p>
      )}
    </section>
  );
}

