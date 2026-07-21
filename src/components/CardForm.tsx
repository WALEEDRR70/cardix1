import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { CardPreview, TEMPLATE_META, type TemplateId } from "@/components/CardPreview";
import { useServerFn } from "@tanstack/react-start";
import { generateBio } from "@/lib/bio.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Upload, X, Check } from "lucide-react";
import { toast } from "sonner";

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
}

const ACCENTS = ["#D4AF37", "#F5F5F5", "#8B5CF6", "#22D3EE", "#F97316", "#EC4899", "#10B981", "#EF4444"];

export function CardForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial: CardFormData;
  onSubmit: (data: CardFormData) => Promise<void>;
  submitLabel: string;
}) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<CardFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const genBio = useServerFn(generateBio);

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
      toast.error(e instanceof Error ? e.message : "Upload failed");
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
      toast.error(e instanceof Error ? e.message : "AI error");
    } finally {
      setGenBusy(false);
    }
  }

  const set = <K extends keyof CardFormData>(k: K, v: CardFormData[K]) => setData((d) => ({ ...d, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSubmit(data); } finally { setSaving(false); }
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 lg:items-start">
      <div className="space-y-6 lg:order-1">
        {/* Live preview (mobile: inline top) */}
        <div className="flex justify-center lg:hidden">
          <CardPreview card={data} size="md" />
        </div>



      {/* Template picker */}
      <section>
        <label className="mb-2 block px-1 text-xs font-medium text-muted-foreground">{t.template}</label>
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
          {TEMPLATE_META.map((tpl) => {
            const active = data.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => set("template", tpl.id as TemplateId)}
                className={
                  "relative snap-start shrink-0 overflow-hidden rounded-2xl border transition " +
                  (active ? "border-accent ring-2 ring-accent" : "border-border")
                }
                style={{ width: 96, height: 60, background: tpl.preview }}
              >
                {active && (
                  <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold uppercase tracking-wider text-white mix-blend-difference">
                  {tpl.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Accent color */}
      <section>
        <label className="mb-2 block px-1 text-xs font-medium text-muted-foreground">{t.accent}</label>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("accent_color", c)}
              aria-label={c}
              className={"h-9 w-9 rounded-xl ring-offset-2 ring-offset-background transition " + (data.accent_color === c ? "ring-2 ring-ring" : "")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
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
        <Field label={t.slug} value={data.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required prefix="/c/" />

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.title} value={data.title} onChange={(v) => set("title", v)} />
          <Field label={t.company} value={data.company} onChange={(v) => set("company", v)} />
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
          <Field label={t.website} value={data.website} onChange={(v) => set("website", v)} />
        </div>
        <Field label={t.address} value={data.address} onChange={(v) => set("address", v)} />

        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <input type="checkbox" checked={data.is_published} onChange={(e) => set("is_published", e.target.checked)} className="h-4 w-4 accent-accent" />
          <span>{t.published}</span>
        </label>

        <button
          disabled={saving}
          className="mt-2 w-full rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}
        >
          {saving ? "…" : submitLabel}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; prefix?: string;
}) {
  return (
    <div>
      <label className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center rounded-2xl border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
        {prefix && <span className="pl-4 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}
