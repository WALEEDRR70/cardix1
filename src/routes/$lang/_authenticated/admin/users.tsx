import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Eye, Palette, Pencil, Search, ShieldCheck, Users } from "lucide-react";
import { Link } from "@/lib/nav";
import { toast } from "sonner";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { adminUpdateCard, listPlatformUsers, type AdminUserRow } from "@/lib/admin.functions";
import { CardPreview } from "@/components/CardPreview";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type AdminCard = AdminUserRow["cards"][number];

export const Route = createFileRoute("/$lang/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Cardixn admin" },
      { name: "description", content: "Browse every Cardixn account and the digital business cards they own." },
      { property: "og:title", content: "Users — Cardixn admin" },
      { property: "og:description", content: "Browse every Cardixn account and their cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const load = useServerFn(listPlatformUsers);
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => load({}),
    retry: false,
  });

  const users = data?.users ?? [];
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      [u.email, u.display_name, u.username, ...u.cards.map((c) => c.name)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [users, q]);

  if (error) {
    return (
      <MobileShell topBar={<PageHeader title="المستخدمون" back="/dashboard" />}>
        <div className="px-5 py-20 text-center text-sm text-muted-foreground">
          هذه الصفحة مخصّصة لمسؤولي المنصّة فقط.
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell topBar={<PageHeader title="المستخدمون" back="/dashboard" />}>
      <div className="space-y-5 px-5 pb-24 lg:px-8">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Users className="h-4 w-4" />} label="المستخدمون" value={users.length} />
          <Stat icon={<CreditCard className="h-4 w-4" />} label="البطاقات" value={data?.totalCards ?? 0} />
        </div>

        <label className="glass flex items-center gap-2 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالبريد أو الاسم أو البطاقة…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">…</p>}

        <div className="space-y-3">
          {filtered.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">
              لا يوجد مستخدمون مطابقون.
            </p>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function UserRow({ user }: { user: AdminUserRow }) {
  const { lang } = Route.useParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCard | null>(null);
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-sm font-semibold">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.email ?? "?").slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{user.display_name || user.username || user.email}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{user.email}</span>
        </span>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
          {user.cards.length} بطاقة
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-border/60 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            انضم {new Date(user.created_at).toLocaleDateString("ar")} ·{" "}
            {user.last_sign_in_at ? `آخر دخول ${new Date(user.last_sign_in_at).toLocaleDateString("ar")}` : "لم يسجّل دخولاً"}
            {user.account_type ? ` · ${user.account_type === "company" ? "حساب شركة" : "حساب شخصي"}` : ""}
          </p>
          {user.cards.length === 0 && <p className="text-xs text-muted-foreground">لا توجد بطاقات.</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {user.cards.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border/60 p-3">
                <CardPreview
                  card={{
                    name: c.name,
                    slug: c.slug,
                    title: c.title,
                    company: c.company,
                    bio: c.bio,
                    phone: c.phone,
                    whatsapp: c.whatsapp,
                    email: c.email,
                    website: c.website,
                    address: c.address,
                    avatar_url: c.avatar_url,
                    accent_color: c.accent_color || "#C9A227",
                    template: c.template,
                    design: c.design,
                    socials: c.socials,
                  }}
                  size="sm"
                />
                <div className="mt-3 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {[c.title, c.company].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Eye className="h-3 w-3" /> {c.view_count}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] " +
                      (c.is_published ? "bg-secondary text-foreground" : "bg-secondary/50 text-muted-foreground")
                    }
                  >
                    {c.is_published ? "منشورة" : "مسودّة"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                    aria-label="تعديل بيانات البطاقة"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={`/${lang}/studio/${c.id}`}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                    aria-label="تعديل التصميم"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`/c/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                    aria-label="فتح البطاقة"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      <EditCardDialog card={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function EditCardDialog({ card, onClose }: { card: AdminCard | null; onClose: () => void }) {
  const save = useServerFn(adminUpdateCard);
  const qc = useQueryClient();
  const [form, setForm] = useState<AdminCard | null>(card);
  const [saving, setSaving] = useState(false);

  // Sync when a different card is opened.
  const [lastId, setLastId] = useState<string | null>(card?.id ?? null);
  if ((card?.id ?? null) !== lastId) {
    setLastId(card?.id ?? null);
    setForm(card);
  }

  const set = (k: keyof AdminCard, v: string | boolean) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function submit() {
    if (!form) return;
    setSaving(true);
    try {
      await save({
        data: {
          id: form.id,
          name: form.name,
          title: form.title,
          company: form.company,
          bio: form.bio,
          phone: form.phone,
          whatsapp: form.whatsapp,
          email: form.email,
          website: form.website,
          address: form.address,
          slug: form.slug,
          is_published: form.is_published,
        },
      });
      toast.success("تم حفظ بيانات البطاقة");
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof AdminCard; label: string }[] = [
    { key: "name", label: "الاسم" },
    { key: "title", label: "المسمّى الوظيفي" },
    { key: "company", label: "الشركة" },
    { key: "phone", label: "الهاتف" },
    { key: "whatsapp", label: "واتساب" },
    { key: "email", label: "البريد" },
    { key: "website", label: "الموقع" },
    { key: "address", label: "العنوان" },
    { key: "slug", label: "الرابط (slug)" },
  ];

  return (
    <Dialog open={!!card} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-start">تعديل بيانات البطاقة</DialogTitle>
        </DialogHeader>
        {form && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={String(f.key)} className="space-y-1.5">
                <Label className="text-[11px]">{f.label}</Label>
                <Input
                  value={(form[f.key] as string | null) ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              </div>
            ))}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px]">النبذة</Label>
              <Textarea rows={3} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 sm:col-span-2">
              <Label className="text-xs">منشورة</Label>
              <Switch checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} />
            </div>
          </div>
        )}
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "جارٍ الحفظ…" : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
