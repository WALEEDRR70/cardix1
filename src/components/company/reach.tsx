// Reach & identity modules for the enterprise workspace:
// media library, QR manager, NFC manager, SEO, company card, invitations.
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  Copy, Download, Image as ImageIcon, Nfc, Radio, Trash2, Upload, Globe, Plus, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWs, type Company, type CompanyRole } from "@/lib/workspace";
import { Card, TextField, SaveBar, useSaveCompany, LogoUpload } from "@/components/company/sections";
import { ServicesEditor } from "@/components/company/ServicesEditor";
import { parseServices, type CompanyService } from "@/lib/company-services";
import { txDict, txErr } from "@/lib/tx";


/* ------------------------------ labels ------------------------------ */

const EN = {
  upload: "Upload asset", assets: "Assets", noAssets: "No assets yet",
  assetLabel: "Label", kind: "Type", delete: "Delete", copied: "Copied",
  qrTitle: "Company QR", qrDesc: "Share your company page instantly.",
  employeeQr: "Employee QR codes", download: "Download PNG", size: "Size",
  nfcTitle: "NFC writer", nfcDesc: "Tap an NFC tag with your phone to write your company link.",
  nfcWrite: "Write to NFC tag", nfcUnsupported: "Web NFC is not supported on this device. Use Chrome on Android.",
  nfcWritten: "Tag written successfully", nfcWaiting: "Hold the tag near your phone…",
  seoTitle: "Search presence", seoDesc: "How your company page appears on Google and social apps.",
  tagline: "Tagline", metaPreview: "Preview", published: "Public page live",
  publishedDesc: "Turn off to hide your company page from visitors.",
  cardTitle: "Company card", cardDesc: "The master card shown on your public page.",
  services: "Services", addService: "Add service", socials: "Social links",
  invitesTitle: "Invitations", noInvites: "No pending invitations",
  revoke: "Revoke", copyLink: "Copy link", saved: "Saved", link: "Link",
};

const AR: typeof EN = {
  upload: "رفع ملف", assets: "الملفات", noAssets: "لا توجد ملفات بعد",
  assetLabel: "الاسم", kind: "النوع", delete: "حذف", copied: "تم النسخ",
  qrTitle: "QR الشركة", qrDesc: "شارك صفحة شركتك فورًا.",
  employeeQr: "أكواد QR للموظفين", download: "تحميل PNG", size: "الحجم",
  nfcTitle: "كتابة NFC", nfcDesc: "قرّب بطاقة NFC من هاتفك لكتابة رابط الشركة.",
  nfcWrite: "الكتابة على البطاقة", nfcUnsupported: "تقنية Web NFC غير مدعومة على هذا الجهاز. استخدم Chrome على أندرويد.",
  nfcWritten: "تمت الكتابة بنجاح", nfcWaiting: "قرّب البطاقة من الهاتف…",
  seoTitle: "الظهور في البحث", seoDesc: "كيف تظهر صفحة شركتك في جوجل وتطبيقات التواصل.",
  tagline: "الشعار النصي", metaPreview: "معاينة", published: "الصفحة العامة مفعّلة",
  publishedDesc: "أوقفها لإخفاء صفحة الشركة عن الزوار.",
  cardTitle: "بطاقة الشركة", cardDesc: "البطاقة الرئيسية الظاهرة في صفحتك العامة.",
  services: "الخدمات", addService: "إضافة خدمة", socials: "روابط التواصل",
  invitesTitle: "الدعوات", noInvites: "لا توجد دعوات معلّقة",
  revoke: "إلغاء", copyLink: "نسخ الرابط", saved: "تم الحفظ", link: "الرابط",
};

function useT() {
  const { lang, w } = useWs();
  return { t: txDict(EN, AR), w, lang };
}

function origin() {
  return typeof window !== "undefined" ? window.location.origin : "https://cardixn.com";
}

function copy(text: string, msg: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(msg));
}

/* --------------------------- media library --------------------------- */

export function MediaTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { t } = useT();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: assets } = useQuery({
    queryKey: ["company-assets", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_brand_assets")
        .select("id, url, kind, label, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function upload(file: File) {
    setBusy(true);
    const path = `${company.id}/media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const up = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (up.error) { setBusy(false); toast.error(txErr(up.error)); return; }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    if (data?.signedUrl) {
      const { error } = await supabase.from("company_brand_assets").insert({
        company_id: company.id, url: data.signedUrl, kind: file.type.startsWith("image/") ? "image" : "file", label: file.name,
      });
      if (error) toast.error(txErr(error));
      else qc.invalidateQueries({ queryKey: ["company-assets", company.id] });
    }
    setBusy(false);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("company_brand_assets").delete().eq("id", id);
    if (error) { toast.error(txErr(error)); return; }
    qc.invalidateQueries({ queryKey: ["company-assets", company.id] });
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <Card>
          <label className="flex cursor-pointer items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary"><Upload className="h-4 w-4" /></span>
            <span className="flex-1 text-sm font-medium">{t.upload}</span>
            <input
              type="file"
              disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
              className="w-40 text-[11px] text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:text-foreground"
            />
          </label>
        </Card>
      )}

      <Card className="space-y-3">
        <p className="text-sm font-semibold">{t.assets}</p>
        {!assets?.length && <p className="text-xs text-muted-foreground">{t.noAssets}</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets?.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="grid aspect-square place-items-center bg-secondary/50">
                {a.kind === "image"
                  ? <img src={a.url} alt={a.label ?? ""} className="h-full w-full object-cover" />
                  : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-1 p-2">
                <p className="min-w-0 flex-1 truncate text-[11px]">{a.label}</p>
                <button onClick={() => copy(a.url, t.copied)} className="rounded-lg p-1.5 hover:bg-secondary"><Copy className="h-3.5 w-3.5" /></button>
                {canEdit && (
                  <button onClick={() => remove(a.id)} className="rounded-lg p-1.5 text-destructive hover:bg-secondary"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------- QR tab ------------------------------- */

function QrBlock({ value, label, color }: { value: string; label: string; color: string }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${label.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card p-4">
      <div ref={ref} className="rounded-2xl bg-white p-3">
        <QRCodeCanvas value={value} size={220} level="H" fgColor={color} bgColor="#ffffff" includeMargin={false} />
      </div>
      <p className="text-center text-xs font-medium">{label}</p>
      <div className="flex w-full gap-2">
        <button onClick={download} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-xs font-medium">
          <Download className="h-3.5 w-3.5" /> {t.download}
        </button>
        <button onClick={() => copy(value, t.copied)} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-xs font-medium">
          <Copy className="h-3.5 w-3.5" /> {t.copyLink}
        </button>
      </div>
    </div>
  );
}

export function QrTab({ company }: { company: Company }) {
  const { t } = useT();
  const companyUrl = `${origin()}/company/${company.slug}`;

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold">{t.qrTitle}</p>
      <p className="text-xs text-muted-foreground">{t.qrDesc}</p>
      <QrBlock value={companyUrl} label={company.name} color={company.brand_primary} />
    </Card>
  );
}


/* ------------------------------ NFC tab ------------------------------ */

export function NfcTab({ company }: { company: Company }) {
  const { t } = useT();
  const [state, setState] = useState<"idle" | "waiting">("idle");
  const url = `${origin()}/company/${company.slug}`;
  const supported = typeof window !== "undefined" && "NDEFReader" in window;

  async function write() {
    if (!supported) { toast.error(t.nfcUnsupported); return; }
    try {
      setState("waiting");
      const Ctor = (window as unknown as { NDEFReader: new () => { write: (m: unknown) => Promise<void> } }).NDEFReader;
      const reader = new Ctor();
      await reader.write({ records: [{ recordType: "url", data: url }] });
      toast.success(t.nfcWritten);
    } catch (e) {
      toast.error(txErr(e, "NFC error"));
    } finally {
      setState("idle");
    }
  }

  return (
    <Card className="space-y-4 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl" style={{ background: company.brand_primary + "22", color: company.brand_primary }}>
        <Nfc className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-semibold">{t.nfcTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.nfcDesc}</p>
      </div>
      <p className="truncate rounded-2xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">{url}</p>
      <button
        onClick={write}
        disabled={state === "waiting"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Radio className="h-4 w-4" /> {state === "waiting" ? t.nfcWaiting : t.nfcWrite}
      </button>
      {!supported && <p className="text-[11px] text-muted-foreground">{t.nfcUnsupported}</p>}
    </Card>
  );
}

/* ------------------------------- SEO tab ------------------------------ */

export function SeoTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { t, w } = useT();
  const { save, busy } = useSaveCompany(company.id);
  const [f, setF] = useState({
    tagline: company.tagline ?? "",
    description: company.description ?? "",
    is_published: company.is_published,
  });
  const url = `${origin()}/company/${company.slug}`;

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <p className="text-sm font-semibold">{t.seoTitle}</p>
        <p className="text-xs text-muted-foreground">{t.seoDesc}</p>
        <TextField label={t.tagline} value={f.tagline} onChange={(v) => setF((p) => ({ ...p, tagline: v }))} disabled={!canEdit} />
        <div>
          <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.companyDescription}</label>
          <textarea
            rows={4}
            maxLength={300}
            value={f.description}
            disabled={!canEdit}
            onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))}
            className="w-full resize-none rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          <p className="px-1 pt-1 text-[11px] text-muted-foreground">{f.description.length}/300</p>
        </div>
        <label className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span>
            {t.published}
            <span className="block text-[11px] text-muted-foreground">{t.publishedDesc}</span>
          </span>
          <input
            type="checkbox"
            checked={f.is_published}
            disabled={!canEdit}
            onChange={(e) => setF((p) => ({ ...p, is_published: e.target.checked }))}
            className="h-5 w-5 accent-[var(--accent-solid,#7c34ff)]"
          />
        </label>
        {canEdit && <SaveBar busy={busy} label={w.save} onSave={() => save(f, t.saved)} />}
      </Card>

      <Card className="space-y-2">
        <p className="text-sm font-semibold">{t.metaPreview}</p>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Globe className="h-3 w-3" />{url}</p>
          <p className="mt-1 truncate text-base font-medium text-accent">{company.name}{f.tagline ? ` — ${f.tagline}` : ""}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.description || company.name}</p>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------- company card ---------------------------- */

const SOCIAL_KEYS = ["linkedin", "x", "instagram", "facebook", "youtube", "whatsapp"] as const;

export function CompanyCardTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { t, w, lang } = useT();
  const { save, busy } = useSaveCompany(company.id);

  const initialSocials = useMemo(() => {
    const s = (company.socials ?? {}) as Record<string, string>;
    return Object.fromEntries(SOCIAL_KEYS.map((k) => [k, s[k] ?? ""])) as Record<string, string>;
  }, [company.socials]);

  const [tagline, setTagline] = useState(company.tagline ?? "");
  const [description, setDescription] = useState(company.description ?? "");
  const [logoUrl, setLogoUrl] = useState(company.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState(company.cover_url ?? "");

  const [socials, setSocials] = useState<Record<string, string>>(initialSocials);
  const [services, setServices] = useState<CompanyService[]>(() => parseServices(company.services));

  const mediaLabels = lang === "ar"
    ? { logo: "شعار البطاقة", cover: "صورة الغلاف", hint: "صور بطاقة الشركة تُرفع بشكل منفصل عن صور الخدمات." }
    : { logo: "Card logo", cover: "Cover image", hint: "Company card images are uploaded separately from service images." };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <p className="text-sm font-semibold">{t.cardTitle}</p>
        <p className="text-xs text-muted-foreground">{t.cardDesc}</p>
        <div
          className="overflow-hidden rounded-3xl text-center"
          style={{ background: `linear-gradient(140deg, ${company.brand_primary}, ${company.brand_secondary})` }}
        >
          {coverUrl && <img src={coverUrl} alt="" className="h-28 w-full object-cover" />}
          <div className="p-5">
            {logoUrl && <img src={logoUrl} alt="" className="mx-auto h-14 w-14 rounded-2xl object-cover" />}
            <p className="mt-3 text-lg font-semibold text-white">{company.name}</p>
            {tagline && <p className="mt-1 text-xs text-white/80">{tagline}</p>}
            {description && <p className="mt-2 text-[11px] leading-relaxed text-white/70">{description}</p>}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">{mediaLabels.hint}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <LogoUpload label={mediaLabels.logo} value={logoUrl} onChange={setLogoUrl} disabled={!canEdit} companyId={company.id} />
          <LogoUpload label={mediaLabels.cover} value={coverUrl} onChange={setCoverUrl} disabled={!canEdit} companyId={company.id} />
        </div>
        <TextField label={t.tagline} value={tagline} onChange={setTagline} disabled={!canEdit} />
        <div>
          <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.companyDescription}</label>
          <textarea
            rows={4}
            maxLength={300}
            value={description}
            disabled={!canEdit}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          <p className="px-1 pt-1 text-[11px] text-muted-foreground">{description.length}/300</p>
        </div>
        {canEdit && (
          <SaveBar busy={busy} label={w.save} onSave={() => save({ tagline, description, logo_url: logoUrl, cover_url: coverUrl }, t.saved)} />
        )}

      </Card>

      <ServicesEditor
        value={services}
        onChange={setServices}
        canEdit={canEdit}
        lang={lang}
        companySlug={company.slug}
        companyId={company.id}
      />



      <Card className="space-y-3">
        <p className="text-sm font-semibold">{t.socials}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map((k) => (
            <TextField
              key={k}
              label={k}
              value={socials[k] ?? ""}
              disabled={!canEdit}
              onChange={(v) => setSocials((p) => ({ ...p, [k]: v }))}
            />
          ))}
        </div>
        {canEdit && (
          <SaveBar
            busy={busy}
            label={w.save}
            onSave={() =>
              save(
                {
                  tagline,
                  services: services as unknown as Company["services"],
                  socials: Object.fromEntries(Object.entries(socials).filter(([, v]) => v.trim())) as unknown as Company["socials"],
                },
                t.saved,
              )
            }
          />
        )}
      </Card>
    </div>
  );
}

/* ---------------------------- invitations ---------------------------- */

export function InvitationsTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { t } = useT();
  const qc = useQueryClient();

  const { data: invites } = useQuery({
    queryKey: ["company-invites-all", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_invitations")
        .select("id, name, email, job_title, status, token, created_at, expires_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function revoke(id: string) {
    const { error } = await supabase.from("company_invitations").update({ status: "revoked" }).eq("id", id);
    if (error) { toast.error(txErr(error)); return; }
    qc.invalidateQueries({ queryKey: ["company-invites-all", company.id] });
    qc.invalidateQueries({ queryKey: ["company-invites", company.id] });
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold">{t.invitesTitle}</p>
      {!invites?.length && <p className="text-xs text-muted-foreground">{t.noInvites}</p>}
      <div className="space-y-2">
        {invites?.map((i) => (
          <div key={i.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{i.name || i.email || "Invite link"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{i.job_title || i.email || `${origin()}/join/${i.token}`} · {i.status}</p>
            </div>
            {i.status === "pending" && (
              <>
                <button onClick={() => copy(`${origin()}/join/${i.token}`, t.copied)} className="rounded-lg p-2 hover:bg-secondary">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {canEdit && (
                  <button onClick={() => revoke(i.id)} className="rounded-lg p-2 text-destructive hover:bg-secondary">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
