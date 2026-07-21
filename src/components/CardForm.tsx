import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { CardPreview } from "@/components/CardPreview";
import { useServerFn } from "@tanstack/react-start";
import { generateBio } from "@/lib/bio.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Upload, X } from "lucide-react";
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
  is_published: boolean;
}


const ACCENTS = ["#D4AF37", "#111111", "#8B5CF6", "#0EA5E9", "#EF4444", "#10B981", "#F97316", "#EC4899"];

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
  const genBio = useServerFn(generateBio);

  async function aiBio() {
    if (!data.name.trim()) {
      toast.error(t.name);
      return;
    }
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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t.name} value={data.name} onChange={(v) => set("name", v)} required />
        <Field label={t.slug} value={data.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required prefix="/c/" />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.title} value={data.title} onChange={(v) => set("title", v)} />
          <Field label={t.company} value={data.company} onChange={(v) => set("company", v)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">{t.bio}</label>
            <button
              type="button"
              onClick={aiBio}
              disabled={genBusy}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted disabled:opacity-60"
            >
              <Sparkles className="h-3 w-3" /> {genBusy ? t.generating : t.generateBio}
            </button>
          </div>
          <div className="mt-1 rounded-xl border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
            <textarea
              value={data.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.phone} value={data.phone} onChange={(v) => set("phone", v)} />
          <Field label={t.whatsapp} value={data.whatsapp} onChange={(v) => set("whatsapp", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.email} value={data.email} onChange={(v) => set("email", v)} type="email" />
          <Field label={t.website} value={data.website} onChange={(v) => set("website", v)} />
        </div>
        <Field label={t.address} value={data.address} onChange={(v) => set("address", v)} />

        <div>
          <label className="text-xs font-medium text-muted-foreground">{t.accent}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCENTS.map((c) => (
              <button key={c} type="button" onClick={() => set("accent_color", c)}
                className={`h-9 w-9 rounded-xl ring-offset-2 ring-offset-background transition ${data.accent_color === c ? "ring-2 ring-ring" : ""}`}
                style={{ backgroundColor: c }} aria-label={c} />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.is_published} onChange={(e) => set("is_published", e.target.checked)} />
          {t.published}
        </label>

        <button disabled={saving} className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {saving ? "…" : submitLabel}
        </button>
      </form>

      <div className="lg:sticky lg:top-8">
        <div className="flex justify-center">
          <CardPreview card={data} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", textarea, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; textarea?: boolean; prefix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1 flex items-center rounded-xl border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
        {prefix && <span className="pl-3 text-sm text-muted-foreground">{prefix}</span>}
        {textarea ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm outline-none" />
        ) : (
          <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none" />
        )}
      </div>
    </div>
  );
}
