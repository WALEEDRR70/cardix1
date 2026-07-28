// Full services manager: each service gets its own detail page, contact info and media.
import { useState } from "react";
import { ChevronDown, ExternalLink, GripVertical, Plus, Trash2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, TextField, LogoUpload } from "@/components/company/sections";
import { parseServices, newService, slugifyService, type CompanyService } from "@/lib/company-services";

const EN = {
  title: "Services",
  desc: "Each service gets its own public page with details and contact options.",
  add: "Add service",
  empty: "No services yet. Add your first service to publish a dedicated page.",
  name: "Service name",
  slug: "Page link (slug)",
  summary: "Short summary",
  description: "Full details",
  price: "Price",
  duration: "Duration",
  phone: "Contact phone",
  whatsapp: "WhatsApp",
  email: "Contact email",
  website: "Booking / info link",
  image: "Service image",
  features: "Highlights",
  addFeature: "Add highlight",
  published: "Published",
  view: "View page",
  remove: "Delete service",
  up: "Move up",
  down: "Move down",
};

const AR: typeof EN = {
  title: "الخدمات",
  desc: "كل خدمة تحصل على صفحة عامة خاصة بها مع التفاصيل ووسائل التواصل.",
  add: "إضافة خدمة",
  empty: "لا توجد خدمات بعد. أضف أول خدمة لتنشر لها صفحة مستقلة.",
  name: "اسم الخدمة",
  slug: "رابط الصفحة",
  summary: "وصف مختصر",
  description: "التفاصيل الكاملة",
  price: "السعر",
  duration: "المدة",
  phone: "رقم التواصل",
  whatsapp: "واتساب",
  email: "إيميل التواصل",
  website: "رابط الحجز / معلومات",
  image: "صورة الخدمة",
  features: "أبرز المزايا",
  addFeature: "إضافة ميزة",
  published: "منشورة",
  view: "عرض الصفحة",
  remove: "حذف الخدمة",
  up: "تحريك لأعلى",
  down: "تحريك لأسفل",
};

export function ServicesEditor({
  value,
  onChange,
  canEdit,
  lang,
  companySlug,
  companyId,
}: {
  value: unknown;
  onChange: (next: CompanyService[]) => void;
  canEdit: boolean;
  lang: string;
  companySlug: string;
  companyId: string;
}) {
  const t = lang === "ar" ? AR : EN;
  const services = parseServices(value);
  const [openId, setOpenId] = useState<string | null>(null);

  function patch(id: string, p: Partial<CompanyService>) {
    onChange(services.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }
  function move(i: number, dir: -1 | 1) {
    const next = [...services];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              const s = newService();
              onChange([...services, s]);
              setOpenId(s.id);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" /> {t.add}
          </button>
        )}
      </div>

      {services.length === 0 && <p className="rounded-2xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">{t.empty}</p>}

      <div className="space-y-2">
        {services.map((s, i) => {
          const open = openId === s.id;
          return (
            <div key={s.id} className="rounded-2xl border border-border/60 bg-card/60">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                <button className="min-w-0 flex-1 text-start" onClick={() => setOpenId(open ? null : s.id)}>
                  <p className="truncate text-sm font-medium">{s.name || t.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">/{s.slug}{s.price ? ` · ${s.price}` : ""}</p>
                </button>
                {s.name && (
                  <Link
                    to="/company/$slug/services/$service"
                    params={{ slug: companySlug, service: s.slug }}
                    target="_blank"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                    aria-label={t.view}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                {canEdit && (
                  <>
                    <button onClick={() => move(i, -1)} aria-label={t.up} className="rounded-lg px-1.5 py-1 text-xs text-muted-foreground hover:bg-secondary">↑</button>
                    <button onClick={() => move(i, 1)} aria-label={t.down} className="rounded-lg px-1.5 py-1 text-xs text-muted-foreground hover:bg-secondary">↓</button>
                    <button
                      onClick={() => onChange(services.filter((x) => x.id !== s.id))}
                      aria-label={t.remove}
                      className="rounded-lg p-2 text-destructive hover:bg-secondary"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button onClick={() => setOpenId(open ? null : s.id)} className="rounded-lg p-2 hover:bg-secondary" aria-label={s.name}>
                  <ChevronDown className={"h-4 w-4 transition " + (open ? "rotate-180" : "")} />
                </button>
              </div>

              {open && (
                <div className="space-y-3 border-t border-border/60 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label={t.name}
                      value={s.name}
                      disabled={!canEdit}
                      onChange={(v) => patch(s.id, { name: v, slug: s.slug && s.slug !== slugifyService(s.name, "") ? s.slug : slugifyService(v, s.id) })}
                    />
                    <TextField label={t.slug} value={s.slug} disabled={!canEdit} onChange={(v) => patch(s.id, { slug: slugifyService(v, s.id) })} />
                  </div>
                  <TextField label={t.summary} value={s.summary ?? ""} disabled={!canEdit} onChange={(v) => patch(s.id, { summary: v })} />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.description}</span>
                    <textarea
                      value={s.description ?? ""}
                      disabled={!canEdit}
                      onChange={(e) => patch(s.id, { description: e.target.value })}
                      rows={5}
                      className="w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label={t.price} value={s.price ?? ""} disabled={!canEdit} onChange={(v) => patch(s.id, { price: v })} />
                    <TextField label={t.duration} value={s.duration ?? ""} disabled={!canEdit} onChange={(v) => patch(s.id, { duration: v })} />
                    <TextField label={t.phone} value={s.phone ?? ""} disabled={!canEdit} onChange={(v) => patch(s.id, { phone: v })} />
                    <TextField label={t.whatsapp} value={s.whatsapp ?? ""} disabled={!canEdit} onChange={(v) => patch(s.id, { whatsapp: v })} />
                    <TextField label={t.email} value={s.email ?? ""} disabled={!canEdit} type="email" onChange={(v) => patch(s.id, { email: v })} />
                    <TextField label={t.website} value={s.website ?? ""} disabled={!canEdit} onChange={(v) => patch(s.id, { website: v })} />
                  </div>
                  <LogoUpload label={t.image} value={s.image_url ?? ""} disabled={!canEdit} companyId={companyId} onChange={(v) => patch(s.id, { image_url: v })} />
                  {s.image_url && (
                    <img src={s.image_url} alt={s.name} className="h-32 w-full rounded-2xl border border-border/60 object-cover" />
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{t.features}</p>
                    <div className="flex flex-wrap gap-2">
                      {(s.features ?? []).map((f, fi) => (
                        <span key={`${f}-${fi}`} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                          {f}
                          {canEdit && (
                            <button onClick={() => patch(s.id, { features: (s.features ?? []).filter((_, k) => k !== fi) })}>
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {canEdit && <FeatureInput label={t.addFeature} onAdd={(v) => patch(s.id, { features: [...(s.features ?? []), v] })} />}
                  </div>

                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={s.is_published !== false}
                      disabled={!canEdit}
                      onChange={(e) => patch(s.id, { is_published: e.target.checked })}
                      className="h-4 w-4 accent-[var(--accent-solid,#7c34ff)]"
                    />
                    {t.published}
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FeatureInput({ label, onAdd }: { label: string; onAdd: (v: string) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            onAdd(draft.trim());
            setDraft("");
          }
        }}
        className="flex-1 rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        onClick={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft(""); } }}
        className="flex items-center gap-1.5 rounded-2xl border border-border px-4 text-xs font-medium"
      >
        <Plus className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}
