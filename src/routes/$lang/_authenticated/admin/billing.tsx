import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Link2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { syncAllPlansToPaypal, syncPlanToPaypal } from "@/lib/billing.functions";
import { txErr } from "@/lib/tx";

export const Route = createFileRoute("/$lang/_authenticated/admin/billing")({
  head: () => ({
    meta: [
      { title: "Billing control — Cardixn admin" },
      { name: "description", content: "Manage Cardixn subscription plans, template prices and PayPal links." },
      { property: "og:title", content: "Billing control — Cardixn admin" },
      { property: "og:description", content: "Manage Cardixn subscription plans and template prices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminBilling,
});

type Plan = {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  audience: string;
  interval: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  paypal_plan_id: string | null;
};

type Product = {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

const db = supabase as any;

function AdminBilling() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      // UI hint only — every privileged action is re-checked server-side.
      const { data } = await db
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return Boolean(data);
    },
  });

  const plans = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await db.from("billing_plans").select("*").order("sort_order");
      if (error) throw error;
      return data as Plan[];
    },
    enabled: !!isAdmin,
  });

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await db.from("billing_products").select("*").order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!isAdmin,
  });

  const sync = useServerFn(syncPlanToPaypal);
  const syncing = useMutation({
    mutationFn: (planId: string) => sync({ data: { planId } }),
    onSuccess: () => {
      toast.success("تم ربط الخطة مع PayPal");
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
    },
    onError: (e: Error) => toast.error(txErr(e)),
  });

  const syncAllFn = useServerFn(syncAllPlansToPaypal);
  const syncAll = useMutation({
    mutationFn: () => syncAllFn({}),
    onSuccess: (r: any) => {
      toast.success(`تم ربط ${r.linked} باقة مع PayPal`);
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
    },
    onError: (e: Error) => toast.error(txErr(e)),
  });

  if (roleLoading) {
    return (
      <MobileShell topBar={<PageHeader title="الفوترة" back="/dashboard" />}>
        <div className="grid place-items-center py-20 text-sm text-muted-foreground">…</div>
      </MobileShell>
    );
  }

  if (!isAdmin) {
    return (
      <MobileShell topBar={<PageHeader title="الفوترة" back="/dashboard" />}>
        <div className="px-5 py-20 text-center text-sm text-muted-foreground">
          هذه الصفحة مخصّصة لمسؤولي المنصّة فقط.
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell topBar={<PageHeader title="لوحة الأسعار" back="/dashboard" />}>
      <div className="space-y-8 px-5 pb-24 lg:px-8">
        <section className="space-y-3">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">باقات الاشتراك</h2>
              <p className="text-xs text-muted-foreground">أسعار الأفراد والشركات — شهري وسنوي.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => syncAll.mutate()}
                disabled={syncAll.isPending}
                className="rounded-full border border-border px-3 py-2 text-xs font-semibold disabled:opacity-60"
              >
                {syncAll.isPending ? "جارٍ الربط…" : "ربط كل الباقات مع PayPal"}
              </button>
              <NewPlanButton onDone={() => qc.invalidateQueries({ queryKey: ["admin-plans"] })} />
            </div>
          </header>
          <div className="grid gap-3">
            {(plans.data ?? []).map((p) => (
              <PlanRow
                key={p.id}
                plan={p}
                syncing={syncing.isPending}
                onSync={() => syncing.mutate(p.id)}
                onSaved={() => qc.invalidateQueries({ queryKey: ["admin-plans"] })}
              />
            ))}
            {plans.data?.length === 0 && <Empty text="لا توجد باقات بعد." />}
          </div>
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">قوالب للبيع</h2>
              <p className="text-xs text-muted-foreground">شراء لمرة واحدة لقوالب البطاقات.</p>
            </div>
            <NewProductButton onDone={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />
          </header>
          <div className="grid gap-3">
            {(products.data ?? []).map((p) => (
              <ProductRow key={p.id} product={p} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />
            ))}
            {products.data?.length === 0 && <Empty text="لا توجد قوالب مدفوعة بعد." />}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">{text}</p>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={"block " + className}>
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function PlanRow({
  plan,
  onSaved,
  onSync,
  syncing,
}: {
  plan: Plan;
  onSaved: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const [draft, setDraft] = useState(plan);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await db
      .from("billing_plans")
      .update({
        name_en: draft.name_en,
        name_ar: draft.name_ar,
        audience: draft.audience,
        interval: draft.interval,
        price_cents: Number(draft.price_cents) || 0,
        currency: draft.currency,
        is_active: draft.is_active,
        is_featured: draft.is_featured,
        sort_order: Number(draft.sort_order) || 0,
      })
      .eq("id", plan.id);
    setBusy(false);
    if (error) return toast.error(txErr(error));
    toast.success("تم الحفظ");
    onSaved();
  }

  async function remove() {
    const { error } = await db.from("billing_plans").delete().eq("id", plan.id);
    if (error) return toast.error(txErr(error));
    onSaved();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="الاسم (EN)" value={draft.name_en} onChange={(v) => setDraft({ ...draft, name_en: v })} />
        <Field label="الاسم (AR)" value={draft.name_ar} onChange={(v) => setDraft({ ...draft, name_ar: v })} />
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted-foreground">الفئة</span>
          <select
            value={draft.audience}
            onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="individual">أفراد</option>
            <option value="company">شركات</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted-foreground">الدورة</span>
          <select
            value={draft.interval}
            onChange={(e) => setDraft({ ...draft, interval: e.target.value })}
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="month">شهري</option>
            <option value="year">سنوي</option>
          </select>
        </label>
        <Field
          label="السعر (سنت)"
          type="number"
          value={draft.price_cents}
          onChange={(v) => setDraft({ ...draft, price_cents: Number(v) })}
        />
        <Field label="العملة" value={draft.currency} onChange={(v) => setDraft({ ...draft, currency: v })} />
        <Field
          label="الترتيب"
          type="number"
          value={draft.sort_order}
          onChange={(v) => setDraft({ ...draft, sort_order: Number(v) })}
        />
        <div className="flex items-end gap-4 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
            مفعّلة
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.is_featured} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} />
            مميّزة
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={save}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
        >
          <Save className="h-3.5 w-3.5" /> حفظ
        </button>
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
          {plan.paypal_plan_id ? "إعادة الربط مع PayPal" : "ربط مع PayPal"}
        </button>
        <button onClick={remove} className="rounded-xl p-2 text-destructive hover:bg-secondary" aria-label="حذف">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11px] text-muted-foreground">
          {plan.paypal_plan_id ? `PayPal: ${plan.paypal_plan_id}` : "غير مرتبطة بـ PayPal بعد"}
        </span>
      </div>
    </div>
  );
}

function ProductRow({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const [draft, setDraft] = useState(product);

  async function save() {
    const { error } = await db
      .from("billing_products")
      .update({
        name_en: draft.name_en,
        name_ar: draft.name_ar,
        price_cents: Number(draft.price_cents) || 0,
        currency: draft.currency,
        is_active: draft.is_active,
        sort_order: Number(draft.sort_order) || 0,
      })
      .eq("id", product.id);
    if (error) return toast.error(txErr(error));
    toast.success("تم الحفظ");
    onSaved();
  }

  async function remove() {
    const { error } = await db.from("billing_products").delete().eq("id", product.id);
    if (error) return toast.error(txErr(error));
    onSaved();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="الاسم (EN)" value={draft.name_en} onChange={(v) => setDraft({ ...draft, name_en: v })} />
        <Field label="الاسم (AR)" value={draft.name_ar} onChange={(v) => setDraft({ ...draft, name_ar: v })} />
        <Field
          label="السعر (سنت)"
          type="number"
          value={draft.price_cents}
          onChange={(v) => setDraft({ ...draft, price_cents: Number(v) })}
        />
        <Field label="العملة" value={draft.currency} onChange={(v) => setDraft({ ...draft, currency: v })} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
          معروض للبيع
        </label>
        <button onClick={save} className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
          <Save className="h-3.5 w-3.5" /> حفظ
        </button>
        <button onClick={remove} className="rounded-xl p-2 text-destructive hover:bg-secondary" aria-label="حذف">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NewPlanButton({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function create() {
    setBusy(true);
    const code = `plan-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await db.from("billing_plans").insert({ code, name_en: "New plan", name_ar: "باقة جديدة" });
    setBusy(false);
    if (error) return toast.error(txErr(error));
    onDone();
  }
  return (
    <button onClick={create} disabled={busy} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
      <Plus className="h-3.5 w-3.5" /> باقة
    </button>
  );
}

function NewProductButton({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function create() {
    setBusy(true);
    const code = `tpl-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await db.from("billing_products").insert({ code, name_en: "New template", name_ar: "قالب جديد" });
    setBusy(false);
    if (error) return toast.error(txErr(error));
    onDone();
  }
  return (
    <button onClick={create} disabled={busy} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
      <Plus className="h-3.5 w-3.5" /> قالب
    </button>
  );
}
