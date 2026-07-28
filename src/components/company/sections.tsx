import { DepartmentDesignCard } from "@/components/company/DepartmentDesignCard";
// Shared enterprise workspace modules, used by /co/$slug/* routes and the
// legacy /workspace/$id admin screen.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BadgeCheck, Building2, Plus, Copy, Trash2, Upload, Lock, Sparkles, MapPin, Users, MailPlus, BarChart3,
  Pencil, Check, X, ChevronDown,
} from "lucide-react";
import {
  useWs, roleLabel, statusLabel, slugify,
  parseEmployeeCsv, type Company, type CompanyRole, type MemberStatus,
} from "@/lib/workspace";
import { TEMPLATE_META } from "@/components/CardPreview";
import { logCompanyAction } from "@/components/company/audit";
import { prepareImageFile, canDisplayImage } from "@/lib/image-prep";

/* ---------------------------- shared bits ---------------------------- */

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"glass rounded-3xl border border-border/60 p-5 " + className}>{children}</div>;
}

/** Calm, actionable empty state — replaces bare "nothing here" lines. */
export function EmptyState({ icon: Icon, title, hint, actionLabel, onAction }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}


export function TextField({ label, value, onChange, disabled, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block px-1 text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
      />
    </div>
  );
}

export function SaveBar({ onSave, busy, label }: { onSave: () => void; busy: boolean; label: string }) {
  return (
    <button
      onClick={onSave}
      disabled={busy}
      className="w-full rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-60"
      style={{ background: "var(--gradient-gold)" }}
    >
      {busy ? "…" : label}
    </button>
  );
}

export function useSaveCompany(id: string) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function save(patch: Partial<Company>, msg: string) {
    setBusy(true);
    const { error } = await supabase.from("companies").update(patch).eq("id", id);
    setBusy(false);
    if (error) { toast.error(error.message); return false; }
    qc.invalidateQueries({ queryKey: ["company", id] });
    toast.success(msg);
    return true;
  }
  return { save, busy };
}

/* ------------------------------ overview ------------------------------ */

export function OverviewTab({ company, canEdit, role }: { company: Company; canEdit: boolean; role: CompanyRole | null }) {
  const { w } = useWs();
  const { save, busy } = useSaveCompany(company.id);
  const [f, setF] = useState({
    name: company.name,
    legal_name: company.legal_name ?? "",
    description: company.description ?? "",
    website: company.website ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address: company.address ?? "",
    show_employees: company.show_employees,
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: company.brand_primary + "22", color: company.brand_primary }}>
          {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" /> : <Building2 className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <span className="truncate">{company.name}</span>
            {company.is_verified && <BadgeCheck className="h-4 w-4 text-accent" />}
          </p>
          <p className="text-[11px] text-muted-foreground">{role ? roleLabel(role, w) : "—"}</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <TextField label={w.companyName} value={f.name} onChange={(v) => set("name", v)} disabled={!canEdit} />
        <TextField label={w.legalName} value={f.legal_name} onChange={(v) => set("legal_name", v)} disabled={!canEdit} />
        <div>
          <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.companyDescription}</label>
          <textarea
            rows={4}
            value={f.description}
            disabled={!canEdit}
            onChange={(e) => set("description", e.target.value)}
            className="w-full resize-none rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={w.website} value={f.website} onChange={(v) => set("website", v)} disabled={!canEdit} />
          <TextField label={w.email} value={f.email} onChange={(v) => set("email", v)} disabled={!canEdit} />
          <TextField label={w.phone} value={f.phone} onChange={(v) => set("phone", v)} disabled={!canEdit} />
          <TextField label={w.address} value={f.address} onChange={(v) => set("address", v)} disabled={!canEdit} />
        </div>
        <label className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span>{w.ourTeam}</span>
          <input type="checkbox" checked={f.show_employees} disabled={!canEdit} onChange={(e) => set("show_employees", e.target.checked)} className="h-5 w-5 accent-[var(--accent-solid,#7c34ff)]" />
        </label>
        {canEdit && <SaveBar busy={busy} label={w.save} onSave={() => save(f, w.saved)} />}
      </Card>
    </div>
  );
}

/* -------------------------------- brand ------------------------------- */

export function BrandTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { w } = useWs();
  const { save, busy } = useSaveCompany(company.id);
  const [f, setF] = useState({
    brand_primary: company.brand_primary,
    brand_secondary: company.brand_secondary ?? "",
    logo_url: company.logo_url ?? "",
    cover_url: company.cover_url ?? "",
    font_heading: company.font_heading ?? "",
    font_body: company.font_body ?? "",
    default_template: company.default_template,
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const [applying, setApplying] = useState(false);

  async function applyToAll() {
    setApplying(true);
    const { error } = await supabase
      .from("cards")
      .update({ accent_color: f.brand_primary, template: f.default_template, company: company.name, website: company.website, address: company.address })
      .eq("company_id", company.id)
      .eq("card_type", "employee");
    setApplying(false);
    if (error) { toast.error(error.message); return; }
    toast.success(w.brandApplied);
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <p className="text-sm font-semibold">{w.brandIdentity}</p>
        <p className="text-xs text-muted-foreground">{w.brandIdentityDesc}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.primaryColor}</label>
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-3 py-2">
              <input type="color" value={f.brand_primary} disabled={!canEdit} onChange={(e) => set("brand_primary", e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
              <input value={f.brand_primary} disabled={!canEdit} onChange={(e) => set("brand_primary", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.secondaryColor}</label>
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-3 py-2">
              <input type="color" value={f.brand_secondary || "#2c125a"} disabled={!canEdit} onChange={(e) => set("brand_secondary", e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
              <input value={f.brand_secondary} disabled={!canEdit} onChange={(e) => set("brand_secondary", e.target.value)} className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <LogoUpload label={w.logo} value={f.logo_url} onChange={(v) => set("logo_url", v)} disabled={!canEdit} companyId={company.id} />
          <LogoUpload label={w.cover} value={f.cover_url} onChange={(v) => set("cover_url", v)} disabled={!canEdit} companyId={company.id} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={w.headingFont} value={f.font_heading} onChange={(v) => set("font_heading", v)} disabled={!canEdit} placeholder="Playfair Display" />
          <TextField label={w.bodyFont} value={f.font_body} onChange={(v) => set("font_body", v)} disabled={!canEdit} placeholder="Inter" />
        </div>
        <div>
          <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.defaultTemplate}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATE_META.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                disabled={!canEdit}
                onClick={() => set("default_template", tpl.id)}
                className={
                  "rounded-2xl border px-3 py-2.5 text-xs font-medium transition " +
                  (f.default_template === tpl.id ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card text-muted-foreground")
                }
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
        {canEdit && (
          <div className="space-y-2 pt-1">
            <SaveBar busy={busy} label={w.save} onSave={() => save(f, w.saved)} />
            <button
              onClick={applyToAll}
              disabled={applying}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" /> {w.applyToAll}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">{w.applyToAllDesc}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export function LogoUpload({ label, value, onChange, disabled, companyId }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean; companyId: string;
}) {
  const [busy, setBusy] = useState(false);
  async function upload(input: File) {
    setBusy(true);
    let file = input;
    // Validate + normalise before upload: rejects undecodable files and shrinks
    // oversized logos so they always paint inside the card.
    try {
      const prepared = await prepareImageFile(input);
      file = prepared.file;
      if (prepared.converted) toast.info("تم تحسين حجم/صيغة الشعار تلقائيًا");
    } catch {
      setBusy(false);
      toast.error("صيغة الصورة غير مدعومة — استخدم PNG أو JPG أو SVG");
      return;
    }
    const path = `${companyId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { setBusy(false); toast.error(error.message); return; }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    if (!data?.signedUrl) { setBusy(false); toast.error("تعذر إنشاء رابط الشعار"); return; }
    // Automatic display check — confirm the stored URL really renders.
    const ok = await canDisplayImage(data.signedUrl);
    setBusy(false);
    if (!ok) { toast.error("تعذر عرض الشعار بعد الرفع، جرّب صورة أخرى"); return; }
    onChange(data.signedUrl);
    toast.success("تم رفع الشعار والتحقق من ظهوره");
  }
  return (
    <div>
      <label className="mb-1 block px-1 text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-3 rounded-2xl border border-input bg-card p-2">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
        </span>
        <input
          type="file"
          accept="image/*"
          disabled={disabled || busy}
          onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); }}
          className="w-full text-[11px] text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:text-foreground"
        />
      </div>
    </div>
  );
}

/* ------------------------------ employees ----------------------------- */

export type EmployeeCard = {
  id: string; user_id: string; name: string; title: string | null;
  phone: string | null; whatsapp: string | null; email: string | null;
  website: string | null; address: string | null; bio: string | null;
  socials: Record<string, string> | null; avatar_url: string | null; slug: string;
};

type MemberRow = {
  id: string; user_id: string; role: CompanyRole; status: MemberStatus;
  job_title: string | null; corporate_email: string | null; department_id: string | null;
};

export function EmployeesTab({ company, canEdit, userId }: { company: Company; canEdit: boolean; userId: string }) {
  const { w, lang } = useWs();
  const ar = lang === "ar";

  const qc = useQueryClient();
  const [inviting, setInviting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [inv, setInv] = useState({ name: "", email: "", job_title: "", department_id: "", phone: "", role: "employee" as CompanyRole, template_id: "" });
  const [busy, setBusy] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  // Single-use join link: copying it immediately mints a fresh one.
  const [linkInv, setLinkInv] = useState<{ id: string; token: string; url: string } | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkCfg, setLinkCfg] = useState({ department_id: "", role: "employee" as CompanyRole, template_id: "" });

  const { data: members } = useQuery({
    queryKey: ["company-members", company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_members")
        .select("id, user_id, role, status, job_title, corporate_email, department_id")
        .eq("company_id", company.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MemberRow[];
    },
  });

  const { data: invites } = useQuery({
    queryKey: ["company-invites", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_invitations")
        .select("id, name, email, job_title, status, token, created_at")
        .eq("company_id", company.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["company-departments", company.id],
    queryFn: async () => {
      const { data } = await supabase.from("company_departments").select("id, name").eq("company_id", company.id).order("sort_order");
      return data ?? [];
    },
  });

  const { data: cardDesigns } = useQuery({
    queryKey: ["company-card-designs", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_templates")
        .select("id, name, department_id, target_role")
        .eq("company_id", company.id)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: memberCards } = useQuery({
    queryKey: ["company-member-cards", company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, user_id, name, title, phone, whatsapp, email, website, address, bio, socials, avatar_url, slug")
        .eq("company_id", company.id);
      if (error) throw error;
      return (data ?? []) as EmployeeCard[];
    },
  });

  const cardByUser = useMemo(() => {
    const m: Record<string, EmployeeCard> = {};
    for (const c of memberCards ?? []) if (!m[c.user_id]) m[c.user_id] = c;
    return m;
  }, [memberCards]);

  function inviteUrl(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://cardixn.com";
    return `${origin}/join/${token}`;
  }

  async function createInvite(payload: { name: string; email: string; job_title: string; department_id: string; phone: string; role: CompanyRole; template_id?: string }) {
    const token = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
    const { data, error } = await supabase
      .from("company_invitations")
      .insert({
        company_id: company.id,
        email: payload.email.trim() ? payload.email.trim().toLowerCase() : null,
        name: payload.name || null,
        job_title: payload.job_title || null,
        phone: payload.phone || null,
        department_id: payload.department_id || null,
        template_id: payload.template_id || null,
        role: payload.role,
        token,
        invited_by: userId,
        expires_at: new Date(Date.now() + 14 * 864e5).toISOString(),
      })
      .select("id, token")
      .single();
    if (error) throw error;
    void logCompanyAction(company.id, userId, "invitation.created", "company_invitations", {
      label: payload.email || payload.name || "link",
    });
    return { id: data.id, token: data.token, url: inviteUrl(data.token) };
  }


  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await createInvite(inv);
      setLastLink(created.url);
      setInv({ name: "", email: "", job_title: "", department_id: "", phone: "", role: "employee", template_id: "" });
      qc.invalidateQueries({ queryKey: ["company-invites", company.id] });
      toast.success(w.invitationCreated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const rows = parseEmployeeCsv(text);
    if (rows.length === 0) { toast.error("CSV"); return; }
    setBusy(true);
    let ok = 0;
    for (const r of rows) {
      const dept = departments?.find((d) => d.name.toLowerCase() === r.department.toLowerCase());
      try {
        await createInvite({ ...r, department_id: dept?.id ?? "", role: "employee" });
        ok++;
      } catch { /* skip duplicates */ }
    }
    setBusy(false);
    qc.invalidateQueries({ queryKey: ["company-invites", company.id] });
    toast.success(`${w.imported}: ${ok}`);
  }

  async function setStatus(memberId: string, status: MemberStatus) {
    const { error } = await supabase.from("company_members").update({ status }).eq("id", memberId);
    if (error) { toast.error(error.message); return; }
    const member = members?.find((m) => m.id === memberId);
    if (member) {
      await supabase
        .from("cards")
        .update({ is_active: status === "active", is_published: status === "active" })
        .eq("company_id", company.id)
        .eq("user_id", member.user_id)
        .eq("card_type", "employee");
    }
    void logCompanyAction(company.id, userId, "member.status", "company_members", { label: status });
    qc.invalidateQueries({ queryKey: ["company-members", company.id] });
    toast.success(w.saved);
  }

  /** Mint a fresh single-use join link (optionally discarding the previous unused one). */
  async function mintLink(cfg = linkCfg, discardId?: string) {
    setLinkBusy(true);
    try {
      if (discardId) {
        await supabase.from("company_invitations").update({ status: "revoked" }).eq("id", discardId);
      }
      const created = await createInvite({
        name: "", email: "", job_title: "", phone: "",
        department_id: cfg.department_id, role: cfg.role, template_id: cfg.template_id,
      });
      setLinkInv(created);
      qc.invalidateQueries({ queryKey: ["company-invites", company.id] });
      return created;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
      return null;
    } finally {
      setLinkBusy(false);
    }
  }

  useEffect(() => {
    if (canEdit && !linkInv && !linkBusy) void mintLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, company.id]);

  async function copyLink() {
    if (!linkInv) return;
    await navigator.clipboard.writeText(linkInv.url);
    toast.success(w.copied);
    // The copied link stays valid for exactly one join; a new one is ready instantly.
    await mintLink();
  }

  async function setRole(memberId: string, role: CompanyRole) {
    const { error } = await supabase.from("company_members").update({ role }).eq("id", memberId);
    if (error) { toast.error(error.message); return; }
    void logCompanyAction(company.id, userId, "member.role", "company_members", { label: role });
    qc.invalidateQueries({ queryKey: ["company-members", company.id] });
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex gap-2">
          <button
            onClick={() => { setInviting((v) => !v); setImporting(false); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Plus className="h-4 w-4" /> {w.inviteEmployee}
          </button>
          <button
            onClick={() => { setImporting((v) => !v); setInviting(false); }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium"
          >
            <Upload className="h-4 w-4" /> {w.bulkImport}
          </button>
        </div>
      )}

      {canEdit && (
        <Card className="space-y-3">
          <div>
            <p className="text-sm font-semibold">{ar ? "رابط دعوة سريع" : "Quick invite link"}</p>
            <p className="text-xs text-muted-foreground">
              {ar
                ? "شارك الرابط مع الموظف — يعمل مرة واحدة فقط، ويتجدد تلقائيًا بعد كل نسخ."
                : "Share this link with an employee — it works once and renews automatically after each copy."}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              value={linkCfg.department_id}
              onChange={(e) => { const c = { ...linkCfg, department_id: e.target.value }; setLinkCfg(c); void mintLink(c, linkInv?.id); }}
              className="rounded-2xl border border-input bg-card px-3 py-2.5 text-xs outline-none"
            >
              <option value="">{w.department} —</option>
              {(departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select
              value={linkCfg.role}
              onChange={(e) => { const c = { ...linkCfg, role: e.target.value as CompanyRole }; setLinkCfg(c); void mintLink(c, linkInv?.id); }}
              className="rounded-2xl border border-input bg-card px-3 py-2.5 text-xs outline-none"
            >
              {(["admin", "manager", "employee", "viewer"] as CompanyRole[]).map((r) => (
                <option key={r} value={r}>{roleLabel(r, w)}</option>
              ))}
            </select>
            <select
              value={linkCfg.template_id}
              onChange={(e) => { const c = { ...linkCfg, template_id: e.target.value }; setLinkCfg(c); void mintLink(c, linkInv?.id); }}
              className="rounded-2xl border border-input bg-card px-3 py-2.5 text-xs outline-none"
            >
              <option value="">{w.templates} —</option>
              {(cardDesigns ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
              {linkBusy ? "…" : linkInv?.url ?? "—"}
            </span>
            <button
              type="button"
              onClick={copyLink}
              disabled={!linkInv || linkBusy}
              className="shrink-0 rounded-xl bg-card px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              <Copy className="me-1 inline h-3.5 w-3.5" /> {w.copyLink}
            </button>
          </div>
        </Card>
      )}

      {importing && (
        <Card className="space-y-2">
          <p className="text-sm font-semibold">{w.bulkImport}</p>
          <p className="text-xs text-muted-foreground">{w.bulkImportDesc}</p>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); }}
            className="w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:text-foreground"
          />
        </Card>
      )}

      {inviting && (
        <Card>
          <form onSubmit={submitInvite} className="space-y-3">
            <p className="text-sm font-semibold">{w.inviteEmployee}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={`${w.employeeName} (${ar ? "اختياري" : "optional"})`} value={inv.name} onChange={(v) => setInv({ ...inv, name: v })} />
              <TextField label={`${w.corporateEmail} (${ar ? "اختياري" : "optional"})`} type="email" value={inv.email} onChange={(v) => setInv({ ...inv, email: v })} />
              <TextField label={w.jobTitle} value={inv.job_title} onChange={(v) => setInv({ ...inv, job_title: v })} />
              <TextField label={w.phone} value={inv.phone} onChange={(v) => setInv({ ...inv, phone: v })} />
              <div>
                <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.department}</label>
                <select
                  value={inv.department_id}
                  onChange={(e) => setInv({ ...inv, department_id: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none"
                >
                  <option value="">—</option>
                  {(departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.role}</label>
                <select
                  value={inv.role}
                  onChange={(e) => setInv({ ...inv, role: e.target.value as CompanyRole })}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none"
                >
                  {(["admin", "manager", "employee", "viewer"] as CompanyRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabel(r, w)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.templates}</label>
                <select
                  value={inv.template_id}
                  onChange={(e) => setInv({ ...inv, template_id: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none"
                >
                  <option value="">—</option>
                  {(cardDesigns ?? []).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <SaveBar busy={busy} label={w.sendInvitation} onSave={() => { /* submit via form */ }} />
          </form>
          {lastLink && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">{lastLink}</span>
              <button onClick={() => { navigator.clipboard.writeText(lastLink); toast.success(w.copied); }} className="shrink-0 rounded-lg p-1.5 hover:bg-card">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </Card>
      )}

      <Card className="space-y-2">
        <p className="text-sm font-semibold">{w.employees}</p>
        {(members ?? []).length === 0 && (
          <EmptyState
            icon={Users}
            title={w.noEmployees}
            hint={ar ? "ادعُ أول موظف ليحصل على بطاقته تلقائيًا بهوية الشركة." : "Invite your first employee to get a branded card automatically."}
            actionLabel={canEdit ? w.inviteEmployee : undefined}
            onAction={canEdit ? () => { setInviting(true); setImporting(false); } : undefined}
          />
        )}

        {(members ?? []).map((m) => (
          <MemberItem
            key={m.id}
            m={m}
            card={cardByUser[m.user_id] ?? null}
            ar={ar}
            w={w}
            canEdit={canEdit}
            onSaved={() => qc.invalidateQueries({ queryKey: ["company-member-cards", company.id] })}
          >
            {canEdit && m.role !== "owner" ? (
              <>
                <select
                  value={m.role}
                  onChange={(e) => setRole(m.id, e.target.value as CompanyRole)}
                  className="rounded-xl border border-border bg-secondary px-2 py-1.5 text-[11px] outline-none"
                >
                  {(["admin", "manager", "employee", "viewer"] as CompanyRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabel(r, w)}</option>
                  ))}
                </select>
                <select
                  value={m.status}
                  onChange={(e) => setStatus(m.id, e.target.value as MemberStatus)}
                  className="rounded-xl border border-border bg-secondary px-2 py-1.5 text-[11px] outline-none"
                >
                  {(["active", "inactive", "suspended", "former"] as MemberStatus[]).map((s) => (
                    <option key={s} value={s}>{statusLabel(s, w)}</option>
                  ))}
                </select>
              </>
            ) : (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                {roleLabel(m.role, w)} · {statusLabel(m.status, w)}
              </span>
            )}
          </MemberItem>
        ))}
      </Card>

      <Card className="space-y-2">
        <p className="text-sm font-semibold">{w.pendingInvites}</p>
        {(invites ?? []).length === 0 && (
          <EmptyState
            icon={MailPlus}
            title={w.noInvites}
            hint={ar ? "الدعوات المعلّقة ستظهر هنا مع رابط الانضمام." : "Pending invitations appear here with their join link."}
          />
        )}

        {(invites ?? []).map((i) => (
          <div key={i.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{i.name || i.email || (ar ? "رابط دعوة" : "Invite link")}</p>
              <p className="truncate text-[11px] text-muted-foreground">{i.email || inviteUrl(i.token)}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(inviteUrl(i.token)); toast.success(w.copied); }} className="rounded-lg p-2 hover:bg-secondary" aria-label={w.copyLink}>
              <Copy className="h-3.5 w-3.5" />
            </button>
            {canEdit && (
              <button
                onClick={async () => {
                  await supabase.from("company_invitations").update({ status: "revoked" }).eq("id", i.id);
                  qc.invalidateQueries({ queryKey: ["company-invites", company.id] });
                }}
                className="rounded-lg p-2 text-destructive hover:bg-secondary"
                aria-label={w.remove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ----------------------------- departments ---------------------------- */

export function DepartmentsTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { w, lang } = useWs();
  const ar = lang === "ar";

  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function rename(id: string) {
    const next = editName.trim();
    if (!next) return;
    const { error } = await supabase
      .from("company_departments")
      .update({ name: next, slug: slugify(next) })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["company-departments", company.id] });
  }


  const { data } = useQuery({
    queryKey: ["company-departments", company.id],
    queryFn: async () => {
      const { data } = await supabase.from("company_departments").select("id, name").eq("company_id", company.id).order("sort_order");
      return data ?? [];
    },
  });

  // Card designs assigned to each department (created from the Studio "assign" action).
  const { data: designs } = useQuery({
    queryKey: ["department-designs", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_templates")
        .select("id, name, department_id, target_role, accent_color, template, design")
        .eq("company_id", company.id)
        .order("sort_order");
      return data ?? [];

    },
  });

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("company_departments").insert({ company_id: company.id, name: name.trim(), slug: slugify(name) });
    if (error) { toast.error(error.message); return; }
    setName("");
    qc.invalidateQueries({ queryKey: ["company-departments", company.id] });
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold">{w.departments}</p>
      {(data ?? []).length === 0 && (
        <EmptyState
          icon={Building2}
          title={w.noDepartments}
          hint={ar ? "أنشئ قسمًا مثل «المبيعات» لتخصيص تصميم بطاقة له." : "Create a department like “Sales” to assign it a card design."}
        />
      )}

      <div className="space-y-2">
        {(data ?? []).map((d) => {
          const assigned = (designs ?? []).filter((t) => t.department_id === d.id);
          return (
            <div key={d.id} className="rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5">
              <div className="flex items-center gap-2">
                {editingId === d.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void rename(d.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded-xl border border-input bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button onClick={() => void rename(d.id)} className="text-primary" aria-label={w.save}>
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground" aria-label={w.cancel}>
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{d.name}</p>
                    {canEdit && (
                      <button
                        onClick={() => { setEditingId(d.id); setEditName(d.name); }}
                        className="text-muted-foreground hover:text-primary"
                        aria-label={ar ? "إعادة تسمية" : "Rename"}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={async () => {
                          await supabase.from("company_departments").delete().eq("id", d.id);
                          qc.invalidateQueries({ queryKey: ["company-departments", company.id] });
                        }}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={w.remove}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="mt-2 space-y-2">
                {assigned.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    {ar ? "لا يوجد تصميم معيّن" : "No design assigned"}
                  </span>
                ) : (
                  assigned.map((t) => (
                    <DepartmentDesignCard
                      key={t.id}
                      design={t}
                      companyId={company.id}
                      companySlug={company.slug}
                      canEdit={canEdit}
                      ar={ar}
                      roleLabel={t.target_role ? roleLabel(t.target_role as CompanyRole, w) : null}
                    />
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>
      {canEdit && (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={w.departmentName}
            className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button onClick={add} className="rounded-2xl px-5 text-sm font-semibold text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
            {w.add}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------ templates ----------------------------- */

export function TemplatesTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { w } = useWs();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["company-templates", company.id],
    queryFn: async () => {
      const { data } = await supabase.from("company_templates").select("*").eq("company_id", company.id).order("sort_order");
      return data ?? [];
    },
  });

  const approved = useMemo(() => new Set((data ?? []).map((t) => t.template)), [data]);

  async function toggle(tplId: string, name: string) {
    const existing = (data ?? []).find((t) => t.template === tplId);
    if (existing) {
      await supabase.from("company_templates").delete().eq("id", existing.id);
    } else {
      await supabase.from("company_templates").insert({
        company_id: company.id, name, template: tplId, accent_color: company.brand_primary, is_approved: true,
      });
    }
    qc.invalidateQueries({ queryKey: ["company-templates", company.id] });
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold">{w.approvedTemplates}</p>
      <p className="text-xs text-muted-foreground">{w.approvedTemplatesDesc}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TEMPLATE_META.map((tpl) => (
          <button
            key={tpl.id}
            disabled={!canEdit}
            onClick={() => toggle(tpl.id, tpl.label)}
            className={
              "rounded-2xl border px-3 py-2.5 text-xs font-medium transition " +
              (approved.has(tpl.id) ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card text-muted-foreground")
            }
          >
            {tpl.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------- custom fields --------------------------- */

export function FieldsTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { w } = useWs();
  const qc = useQueryClient();
  const [f, setF] = useState({ label: "", key: "", permission: "company_locked", visibility: "public", is_required: false });

  const { data } = useQuery({
    queryKey: ["company-fields", company.id],
    queryFn: async () => {
      const { data } = await supabase.from("company_custom_fields").select("*").eq("company_id", company.id).order("sort_order");
      return data ?? [];
    },
  });

  async function add() {
    if (!f.label.trim()) return;
    const key = slugify(f.key || f.label).replace(/-/g, "_");
    const { error } = await supabase.from("company_custom_fields").insert({
      company_id: company.id,
      label: f.label.trim(),
      key,
      field_type: "text",
      is_required: f.is_required,
      permission: f.permission as "company_locked",
      visibility: f.visibility as "public",
    });
    if (error) { toast.error(error.message); return; }
    setF({ label: "", key: "", permission: "company_locked", visibility: "public", is_required: false });
    qc.invalidateQueries({ queryKey: ["company-fields", company.id] });
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold">{w.customFields}</p>
      <p className="text-xs text-muted-foreground">{w.customFieldsDesc}</p>
      <div className="space-y-2">
        {(data ?? []).map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.label}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {c.key} · {c.permission === "company_locked" ? w.companyLocked : w.employeeEditable} · {c.visibility === "public" ? w.visPublic : c.visibility === "company_only" ? w.visCompany : w.visPrivate}
              </p>
            </div>
            {canEdit && (
              <button
                onClick={async () => {
                  await supabase.from("company_custom_fields").delete().eq("id", c.id);
                  qc.invalidateQueries({ queryKey: ["company-fields", company.id] });
                }}
                className="rounded-lg p-2 text-destructive hover:bg-secondary"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField label={w.fieldLabel} value={f.label} onChange={(v) => setF({ ...f, label: v })} />
            <TextField label={w.fieldKey} value={f.key} onChange={(v) => setF({ ...f, key: v })} placeholder="employee_id" />
            <div>
              <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.permission}</label>
              <select value={f.permission} onChange={(e) => setF({ ...f, permission: e.target.value })} className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none">
                <option value="company_locked">{w.companyLocked}</option>
                <option value="employee_editable">{w.employeeEditable}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block px-1 text-xs text-muted-foreground">{w.visibility}</label>
              <select value={f.visibility} onChange={(e) => setF({ ...f, visibility: e.target.value })} className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none">
                <option value="public">{w.visPublic}</option>
                <option value="company_only">{w.visCompany}</option>
                <option value="private">{w.visPrivate}</option>
              </select>
            </div>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span>{w.fieldRequired}</span>
            <input type="checkbox" checked={f.is_required} onChange={(e) => setF({ ...f, is_required: e.target.checked })} className="h-5 w-5" />
          </label>
          <button onClick={add} className="w-full rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
            {w.add}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------- branches ----------------------------- */

export function BranchesTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { w } = useWs();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", city: "", country: "", address: "", phone: "" });

  const { data } = useQuery({
    queryKey: ["company-branches", company.id],
    queryFn: async () => {
      const { data } = await supabase.from("company_branches").select("*").eq("company_id", company.id).order("sort_order");
      return data ?? [];
    },
  });

  async function add() {
    if (!f.name.trim()) return;
    const { error } = await supabase.from("company_branches").insert({ company_id: company.id, ...f });
    if (error) { toast.error(error.message); return; }
    setF({ name: "", city: "", country: "", address: "", phone: "" });
    qc.invalidateQueries({ queryKey: ["company-branches", company.id] });
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm font-semibold">{w.branches}</p>
      <div className="space-y-2">
        {(data ?? []).map((b) => (
          <div key={b.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{b.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{[b.city, b.country, b.address].filter(Boolean).join(" · ")}</p>
            </div>
            {canEdit && (
              <button
                onClick={async () => {
                  await supabase.from("company_branches").delete().eq("id", b.id);
                  qc.invalidateQueries({ queryKey: ["company-branches", company.id] });
                }}
                className="rounded-lg p-2 text-destructive hover:bg-secondary"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <TextField label={w.branchName} value={f.name} onChange={(v) => setF({ ...f, name: v })} />
            <TextField label={w.city} value={f.city} onChange={(v) => setF({ ...f, city: v })} />
            <TextField label={w.country} value={f.country} onChange={(v) => setF({ ...f, country: v })} />
            <TextField label={w.phone} value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
          </div>
          <TextField label={w.address} value={f.address} onChange={(v) => setF({ ...f, address: v })} />
          <button onClick={add} className="w-full rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }}>
            {w.addBranch}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------ analytics ----------------------------- */

export function AnalyticsTab({ company }: { company: Company }) {
  const { w } = useWs();

  const { data } = useQuery({
    queryKey: ["company-analytics", company.id],
    queryFn: async () => {
      const { data: cards } = await supabase
        .from("cards")
        .select("id, name, view_count, is_active, card_type")
        .eq("company_id", company.id);
      const ids = (cards ?? []).map((c) => c.id);
      let events: { event_type: string; card_id: string }[] = [];
      if (ids.length > 0) {
        const { data: ev } = await supabase.from("card_events").select("event_type, card_id").in("card_id", ids);
        events = ev ?? [];
      }
      return { cards: cards ?? [], events };
    },
  });

  const cards = data?.cards ?? [];
  const events = data?.events ?? [];
  const count = (type: string) => events.filter((e) => e.event_type === type).length;
  const top = [...cards].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  const stats = [
    { label: w.totalEmployees, value: cards.filter((c) => c.card_type === "employee").length },
    { label: w.activeCards, value: cards.filter((c) => c.is_active).length },
    { label: w.inactiveCards, value: cards.filter((c) => !c.is_active).length },
    { label: w.totalViews, value: cards.reduce((s, c) => s + c.view_count, 0) },
    { label: w.qrScans, value: count("qr_scan") },
    { label: w.contactSaves, value: count("save_contact") },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl border border-border/60 p-4">
            <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <Card className="space-y-2">
        <p className="text-sm font-semibold">{w.topEmployees}</p>
        {top.length === 0 && <EmptyState icon={BarChart3} title={w.noAnalytics} />}
        {top.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5 text-sm">
            <span className="truncate">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.view_count}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* --------------------- employee row + card details --------------------- */

const SOCIAL_KEYS = ["linkedin", "twitter", "instagram", "facebook", "tiktok", "snapchat", "youtube"] as const;

function MemberItem({
  m, card, ar, w, canEdit, onSaved, children,
}: {
  m: MemberRow;
  card: EmployeeCard | null;
  ar: boolean;
  w: Record<string, string>;
  canEdit: boolean;
  onSaved: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(() => ({
    name: card?.name ?? "",
    phone: card?.phone ?? "",
    whatsapp: card?.whatsapp ?? "",
    email: card?.email ?? "",
    website: card?.website ?? "",
    address: card?.address ?? "",
    bio: card?.bio ?? "",
    socials: { ...(card?.socials ?? {}) } as Record<string, string>,
  }));

  useEffect(() => {
    setF({
      name: card?.name ?? "",
      phone: card?.phone ?? "",
      whatsapp: card?.whatsapp ?? "",
      email: card?.email ?? "",
      website: card?.website ?? "",
      address: card?.address ?? "",
      bio: card?.bio ?? "",
      socials: { ...(card?.socials ?? {}) } as Record<string, string>,
    });
  }, [card?.id, card?.name, card?.phone, card?.whatsapp, card?.email, card?.website, card?.address, card?.bio, card?.socials]);

  async function save() {
    if (!card) return;
    setBusy(true);
    const socials = Object.fromEntries(Object.entries(f.socials).filter(([, v]) => (v ?? "").trim() !== ""));
    const { error } = await supabase
      .from("cards")
      .update({
        name: f.name.trim() || (card.name ?? ""),
        phone: f.phone.trim() || null,
        whatsapp: f.whatsapp.trim() || null,
        email: f.email.trim() || null,
        website: f.website.trim() || null,
        address: f.address.trim() || null,
        bio: f.bio.trim() || null,
        socials,
      })
      .eq("id", card.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(w.saved ?? (ar ? "تم الحفظ" : "Saved"));
    onSaved();
  }

  const displayName = card?.name || m.corporate_email || m.user_id.slice(0, 8);
  const contactLine = [card?.email || m.corporate_email, card?.phone].filter(Boolean).join(" · ");

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-secondary"
          aria-label={ar ? "تفاصيل الموظف" : "Employee details"}
        >
          <ChevronDown className={"h-4 w-4 transition-transform " + (open ? "rotate-180" : "")} />
        </button>
        {card?.avatar_url ? (
          <img src={card.avatar_url} alt={displayName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {[m.job_title, contactLine].filter(Boolean).join(" — ") || "—"}
          </p>
        </div>
        {children}
      </div>

      {open && (
        <div className="border-t border-border/60 px-3 py-3">
          {!card ? (
            <p className="text-xs text-muted-foreground">
              {ar ? "لا توجد بطاقة لهذا الموظف بعد." : "This employee has no card yet."}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label={ar ? "الاسم" : "Name"} value={f.name} onChange={(v) => setF({ ...f, name: v })} disabled={!canEdit} />
                <TextField label={ar ? "الجوال" : "Phone"} value={f.phone} onChange={(v) => setF({ ...f, phone: v })} disabled={!canEdit} />
                <TextField label={ar ? "واتساب" : "WhatsApp"} value={f.whatsapp} onChange={(v) => setF({ ...f, whatsapp: v })} disabled={!canEdit} />
                <TextField label={ar ? "البريد" : "Email"} type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} disabled={!canEdit} />
                <TextField label={ar ? "الموقع الإلكتروني" : "Website"} value={f.website} onChange={(v) => setF({ ...f, website: v })} disabled={!canEdit} />
                <TextField label={ar ? "العنوان" : "Address"} value={f.address} onChange={(v) => setF({ ...f, address: v })} disabled={!canEdit} />
              </div>

              <div>
                <label className="mb-1 block px-1 text-xs text-muted-foreground">{ar ? "النبذة" : "Bio"}</label>
                <textarea
                  value={f.bio}
                  onChange={(e) => setF({ ...f, bio: e.target.value })}
                  disabled={!canEdit}
                  rows={3}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <p className="mb-1 px-1 text-xs text-muted-foreground">{ar ? "الحسابات الاجتماعية" : "Social accounts"}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SOCIAL_KEYS.map((k) => (
                    <TextField
                      key={k}
                      label={k}
                      value={f.socials[k] ?? ""}
                      onChange={(v) => setF({ ...f, socials: { ...f.socials, [k]: v } })}
                      disabled={!canEdit}
                      placeholder="https://…"
                    />
                  ))}
                </div>
              </div>

              {canEdit && <SaveBar busy={busy} label={w.save ?? (ar ? "حفظ" : "Save")} onSave={save} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
