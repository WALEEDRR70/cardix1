import { createFileRoute } from "@tanstack/react-router";
import { useNavigate, Link } from "@/lib/nav";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify, useWs } from "@/lib/workspace";
import { useQueryClient } from "@tanstack/react-query";
import { accountQueryKey } from "@/lib/account";
import { ArrowLeft, ArrowRight, Building2, Check, Sparkles } from "lucide-react";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { LocaleSwitcher } from "@/components/LangToggle";

export const Route = createFileRoute("/$lang/_authenticated/co/new")({
  head: () => ({
    meta: [
      { title: "Create a company workspace — Cardixn" },
      { name: "description", content: "Set up your Cardixn enterprise workspace: identity, branding, contact details and departments." },
    ],
  }),
  component: OnboardingWizard,
});

const DEFAULT_DEPARTMENTS = ["Management", "Sales", "Marketing", "Design", "IT"];

const identitySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(48).regex(/^[a-z0-9-]+$/),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(60).optional().or(z.literal("")),
  company_size: z.string().max(20).optional().or(z.literal("")),
});

const contactSchema = z.object({
  website: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  contact_person: z.string().trim().max(80).optional().or(z.literal("")),
});

const legalSchema = z.object({
  legal_name: z.string().trim().max(120).optional().or(z.literal("")),
  registration_number: z.string().trim().max(60).optional().or(z.literal("")),
  tax_number: z.string().trim().max(60).optional().or(z.literal("")),
  legal_address: z.string().trim().max(200).optional().or(z.literal("")),
  founded_year: z.string().trim().max(4).optional().or(z.literal("")),
});

type Form = z.infer<typeof identitySchema> &
  z.infer<typeof contactSchema> &
  z.infer<typeof legalSchema> & {
    brand_primary: string;
    brand_secondary: string;
    departments: string[];
  };

const EMPTY: Form = {
  name: "", slug: "", tagline: "", industry: "", company_size: "",
  website: "", email: "", phone: "", country: "", city: "", address: "", contact_person: "",
  legal_name: "", registration_number: "", tax_number: "", legal_address: "", founded_year: "",
  brand_primary: "#7c34ff", brand_secondary: "#2c125a",
  departments: DEFAULT_DEPARTMENTS,
};

function Field({
  label, value, onChange, type = "text", placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {hint && <span className="mt-1 block px-1 text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function OnboardingWizard() {
  const { w } = useWs();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext() as { user: { id: string } };

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const steps = [w.stepIdentity, w.stepBrand, w.stepContact, w.stepLegal, w.stepStructure, w.stepReview];

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const sizes = useMemo(
    () => [w.size1, w.size2, w.size3, w.size4, w.size5],
    [w],
  );

  async function goNext() {
    setSlugError(null);
    if (step === 0) {
      const slug = slugify(form.slug || form.name);
      const parsed = identitySchema.safeParse({ ...form, slug });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
        return;
      }
      const { data: taken } = await supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
      if (taken) {
        setSlugError(w.slugTaken);
        return;
      }
      set({ slug });
    }
    if (step === 2 && !contactSchema.safeParse(form).success) {
      toast.error(w.email);
      return;
    }
    if (step === 3 && !legalSchema.safeParse(form).success) {
      toast.error(w.stepLegal);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  async function create() {
    setBusy(true);
    try {
      const year = form.founded_year ? Number.parseInt(form.founded_year, 10) : null;
      const { data: company, error } = await supabase
        .from("companies")
        .insert({
          owner_id: user.id,
          name: form.name.trim(),
          slug: form.slug,
          tagline: form.tagline || null,
          industry: form.industry || null,
          company_size: form.company_size || null,
          brand_primary: form.brand_primary,
          brand_secondary: form.brand_secondary,
          website: form.website || null,
          email: form.email || null,
          phone: form.phone || null,
          country: form.country || null,
          city: form.city || null,
          address: form.address || null,
          contact_person: form.contact_person || null,
          legal_name: form.legal_name || null,
          registration_number: form.registration_number || null,
          tax_number: form.tax_number || null,
          legal_address: form.legal_address || null,
          founded_year: Number.isFinite(year as number) ? year : null,
          onboarded_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      const { error: mErr } = await supabase
        .from("company_members")
        .insert({ company_id: company.id, user_id: user.id, role: "owner", status: "active" });
      if (mErr) throw mErr;

      if (form.departments.length) {
        await supabase.from("company_departments").insert(
          form.departments.map((d, i) => ({
            company_id: company.id,
            name: d,
            slug: slugify(d),
            sort_order: i,
          })),
        );
      }

      await supabase
        .from("profiles")
        .update({ account_type: "company", active_company_id: company.id })
        .eq("id", user.id);

      await qc.invalidateQueries({ queryKey: accountQueryKey });
      toast.success(w.workspaceReady);
      nav({ to: "/co/$slug", params: { slug: company.slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-background px-5 pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "var(--gradient-mesh)" }}
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <header className="safe-top flex items-center justify-between gap-3 py-5">
          <Link to="/switch" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {w.switchAccount}
          </Link>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
          </div>
        </header>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">{w.onboardTitle}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{w.onboardDesc}</p>

        {/* Stepper */}
        <ol className="mt-8 flex flex-wrap items-center gap-2">
          {steps.map((label, i) => (
            <li
              key={label}
              className={
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition " +
                (i === step
                  ? "border-transparent bg-primary text-primary-foreground"
                  : i < step
                    ? "border-border/60 text-foreground"
                    : "border-border/40 text-muted-foreground")
              }
            >
              {i < step ? <Check className="h-3 w-3" /> : <span className="tabular-nums">{i + 1}</span>}
              {label}
            </li>
          ))}
        </ol>

        <section className="glass mt-6 space-y-4 rounded-3xl border border-border/50 p-6">
          {step === 0 && (
            <>
              <Field label={w.companyName} value={form.name} onChange={(v) => set({ name: v, slug: form.slug || slugify(v) })} />
              <Field
                label={w.companySlug}
                value={form.slug}
                onChange={(v) => set({ slug: slugify(v) })}
                hint={`${w.slugHint}${form.slug || slugify(form.name)}`}
              />
              {slugError && <p className="px-1 text-xs text-destructive">{slugError}</p>}
              <Field label={`${w.tagline} · ${w.optional}`} value={form.tagline ?? ""} onChange={(v) => set({ tagline: v })} />
              <Field label={`${w.industry} · ${w.optional}`} value={form.industry ?? ""} onChange={(v) => set({ industry: v })} />
              <div>
                <span className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{w.companySize}</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set({ company_size: s })}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-xs transition " +
                        (form.company_size === s ? "border-transparent bg-secondary text-foreground" : "border-border/60 text-muted-foreground")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{w.primaryColor}</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-3 py-2">
                    <input
                      type="color"
                      value={form.brand_primary}
                      onChange={(e) => set({ brand_primary: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="text-sm tabular-nums">{form.brand_primary}</span>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{w.secondaryColor}</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-3 py-2">
                    <input
                      type="color"
                      value={form.brand_secondary}
                      onChange={(e) => set({ brand_secondary: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                    <span className="text-sm tabular-nums">{form.brand_secondary}</span>
                  </div>
                </label>
              </div>

              <div>
                <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">{w.brandPreview}</p>
                <div
                  className="flex items-center gap-3 rounded-3xl border border-border/50 p-5"
                  style={{ background: `linear-gradient(135deg, ${form.brand_primary}33, ${form.brand_secondary}33)` }}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${form.brand_primary}, ${form.brand_secondary})` }}
                  >
                    {(form.name || "CO").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold tracking-tight">{form.name || w.companyName}</p>
                    <p className="truncate text-xs text-muted-foreground">{form.tagline || form.industry || w.companyWorkspace}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label={w.website} value={form.website ?? ""} onChange={(v) => set({ website: v })} placeholder="https://" />
              <Field label={w.email} value={form.email ?? ""} onChange={(v) => set({ email: v })} type="email" />
              <Field label={w.phone} value={form.phone ?? ""} onChange={(v) => set({ phone: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={w.country} value={form.country ?? ""} onChange={(v) => set({ country: v })} />
                <Field label={w.city} value={form.city ?? ""} onChange={(v) => set({ city: v })} />
              </div>
              <Field label={w.address} value={form.address ?? ""} onChange={(v) => set({ address: v })} />
              <Field label={`${w.contactPerson} · ${w.optional}`} value={form.contact_person ?? ""} onChange={(v) => set({ contact_person: v })} />
            </>
          )}

          {step === 3 && (
            <>
              <Field label={`${w.legalName} · ${w.optional}`} value={form.legal_name ?? ""} onChange={(v) => set({ legal_name: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${w.registrationNumber} · ${w.optional}`} value={form.registration_number ?? ""} onChange={(v) => set({ registration_number: v })} />
                <Field label={`${w.taxNumber} · ${w.optional}`} value={form.tax_number ?? ""} onChange={(v) => set({ tax_number: v })} />
              </div>
              <Field label={`${w.legalAddress} · ${w.optional}`} value={form.legal_address ?? ""} onChange={(v) => set({ legal_address: v })} />
              <Field label={`${w.foundedYear} · ${w.optional}`} value={form.founded_year ?? ""} onChange={(v) => set({ founded_year: v.replace(/\D/g, "").slice(0, 4) })} />
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sm font-semibold">{w.defaultDepartments}</p>
              <p className="text-xs text-muted-foreground">{w.defaultDepartmentsDesc}</p>
              <div className="flex flex-wrap gap-2">
                {form.departments.map((d) => (
                  <span key={d} className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs">
                    {d}
                    <button
                      type="button"
                      onClick={() => set({ departments: form.departments.filter((x) => x !== d) })}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem("dept") as HTMLInputElement);
                  const value = input.value.trim().slice(0, 40);
                  if (value && !form.departments.includes(value)) set({ departments: [...form.departments, value] });
                  input.value = "";
                }}
              >
                <input
                  name="dept"
                  placeholder={w.departmentName}
                  maxLength={40}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </form>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-xs text-muted-foreground">{w.reviewDesc}</p>
              <div className="space-y-2">
                {[
                  [w.companyName, form.name],
                  [w.companySlug, `/company/${form.slug}`],
                  [w.industry, form.industry],
                  [w.companySize, form.company_size],
                  [w.website, form.website],
                  [w.email, form.email],
                  [w.phone, form.phone],
                  [w.address, [form.city, form.country].filter(Boolean).join(", ")],
                  [w.legalName, form.legal_name],
                  [w.departments, form.departments.join(" · ")],
                ]
                  .filter(([, v]) => !!v)
                  .map(([k, v]) => (
                    <div key={k as string} className="flex items-start justify-between gap-4 border-b border-border/40 py-2 text-sm">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-end font-medium">{v}</span>
                    </div>
                  ))}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border/50 p-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 shrink-0" /> {w.companyAccountDesc}
              </div>
            </>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || busy}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {w.back}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={step === 0 && !form.name.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {w.next} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={create}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-60"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Building2 className="h-4 w-4" /> {busy ? w.creating : w.finish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
