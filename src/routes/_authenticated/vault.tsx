import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { CardPreview, type CardData } from "@/components/CardPreview";
import { Trash2, Phone, Mail, Globe, StickyNote, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Cardix" },
      { name: "description", content: "Every business card you've saved or scanned, safe in your Cardix vault." },
      { property: "og:title", content: "Vault — Cardix" },
      { property: "og:description", content: "All your saved digital and scanned business cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Vault,
});

function Vault() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: cards } = useQuery({
    queryKey: ["saved_cards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_cards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("saved_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success("Deleted");
  }

  return (
    <MobileShell topBar={<PageHeader title={t.vault} subtitle={cards ? `${cards.length}` : undefined} />}>
      <div className="px-4 lg:px-8">
        {!cards || cards.length === 0 ? (
          <div className="glass mt-4 rounded-3xl p-10 text-center lg:p-16">
            <p className="text-sm text-muted-foreground lg:text-base">{t.emptyVault}</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <SavedCardItem key={c.id} card={c} onDelete={() => del(c.id)} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

type SavedRow = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  avatar_url: string | null;
  notes: string | null;
  source: string;
  template: string | null;
  accent_color: string | null;
  socials: unknown;
};

function SavedCardItem({ card, onDelete }: { card: SavedRow; onDelete: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.notes ?? "");
  const [saving, setSaving] = useState(false);

  const preview: CardData = {
    name: card.name,
    title: card.title,
    company: card.company,
    bio: card.bio,
    phone: card.phone,
    whatsapp: card.whatsapp,
    email: card.email,
    website: card.website,
    address: card.address,
    avatar_url: card.avatar_url,
    accent_color: card.accent_color || "#7c34ff",
    template: card.template || "luxury",
    socials: card.socials as Record<string, string> | null,
  };

  async function saveNote() {
    setSaving(true);
    const { error } = await supabase.from("saved_cards").update({ notes: draft.trim() || null }).eq("id", card.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setEditing(false);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success(t.saveNote);
  }

  return (
    <div className="glass card-lift group rounded-3xl p-3 lg:p-4">
      {/* Owner's original design */}
      <div className="flex justify-center">
        <CardPreview card={preview} size="sm" />
      </div>

      {/* Meta + actions */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">{card.name}</p>
          {card.title && <p className="truncate text-[11px] text-muted-foreground">{card.title}</p>}
        </div>
        <div className="flex items-center gap-1">
          {card.source === "scan" && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
              Scanned
            </span>
          )}
          <button
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={t.delete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick contact */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {card.phone && <QuickPill href={`tel:${card.phone}`} icon={<Phone className="h-3 w-3" />} label={t.call} />}
        {card.email && <QuickPill href={`mailto:${card.email}`} icon={<Mail className="h-3 w-3" />} label={t.email} />}
        {card.website && (
          <QuickPill href={card.website.startsWith("http") ? card.website : `https://${card.website}`} icon={<Globe className="h-3 w-3" />} label={t.website} />
        )}
      </div>

      {/* Personal note */}
      <div className="mt-3 rounded-2xl bg-secondary/40 p-3 ring-1 ring-white/5">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            <StickyNote className="h-3 w-3" /> {t.personalNote}
          </div>
          {!editing ? (
            <button
              onClick={() => { setDraft(card.notes ?? ""); setEditing(true); }}
              className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label={t.editNote}
            >
              <Pencil className="h-3 w-3" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditing(false); setDraft(card.notes ?? ""); }}
                disabled={saving}
                className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={t.cancel}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={saveNote}
                disabled={saving}
                className="grid h-6 w-6 place-items-center rounded-full text-accent-foreground shadow-glow disabled:opacity-60"
                style={{ background: "var(--gradient-gold)" }}
                aria-label={t.saveNote}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {!editing ? (
          <p className={`text-[12px] leading-snug ${card.notes ? "text-foreground" : "text-muted-foreground/70 italic"}`}>
            {card.notes || t.noNote}
          </p>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.personalNotePlaceholder}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl bg-background/60 p-2 text-[12px] outline-none ring-1 ring-white/5 focus:ring-accent/60"
          />
        )}
      </div>
    </div>
  );
}

function QuickPill({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium hover:bg-muted">
      {icon} {label}
    </a>
  );
}
