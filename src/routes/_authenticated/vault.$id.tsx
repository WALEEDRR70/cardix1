import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardPreview } from "@/components/CardPreview";
import { useI18n } from "@/lib/i18n";
import { MobileShell } from "@/components/MobileShell";
import { SOCIALS_BY_ID } from "@/lib/socials";
import {
  ArrowLeft, Phone, Mail, Globe, MessageCircle, MapPin, UserPlus, Trash2, StickyNote, BadgeCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export const Route = createFileRoute("/_authenticated/vault/$id")({
  head: () => ({
    meta: [
      { title: "Card details — Cardix Vault" },
      { name: "description", content: "Full details of a saved business card in your Cardix vault." },
      { property: "og:title", content: "Card details — Cardix Vault" },
      { property: "og:description", content: "Saved business card details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VaultDetail,
});

function VaultDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const { data: card } = useQuery({
    queryKey: ["saved_card", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_cards").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (card) setNote(card.notes ?? "");
  }, [card]);

  if (!card) {
    return (
      <MobileShell>
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</div>
      </MobileShell>
    );
  }

  const accent = card.accent_color || "#7c34ff";
  const socials = (card.socials as Record<string, string> | null) ?? {};
  const socialEntries = Object.entries(socials).filter(([id, v]) => v && SOCIALS_BY_ID[id]);

  async function saveNote() {
    setSavingNote(true);
    const { error } = await supabase.from("saved_cards").update({ notes: note }).eq("id", id);
    setSavingNote(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_card", id] });
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success(t.saveNote);
  }

  async function del() {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("saved_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success("Deleted");
    navigate({ to: "/vault" });
  }

  function vcard() {
    const socialLines = socialEntries.map(([id, v]) => {
      const meta = SOCIALS_BY_ID[id];
      return `X-SOCIALPROFILE;TYPE=${meta.name}:${meta.toUrl(v)}`;
    });
    const vcf = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${card!.name}`,
      card!.title && `TITLE:${card!.title}`,
      card!.company && `ORG:${card!.company}`,
      card!.phone && `TEL;TYPE=CELL:${card!.phone}`,
      card!.email && `EMAIL:${card!.email}`,
      card!.website && `URL:${card!.website}`,
      card!.address && `ADR:;;${card!.address};;;;`,
      ...socialLines,
      "END:VCARD",
    ].filter(Boolean).join("\n");
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${card!.name}.vcf`; a.click();
    URL.revokeObjectURL(url);
  }

  const actions = [
    card.email && { id: "email", label: "Email", icon: Mail, href: `mailto:${card.email}` },
    card.whatsapp && { id: "wa", label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/${card.whatsapp.replace(/\D/g, "")}` },
    card.phone && { id: "call", label: t.call, icon: Phone, href: `tel:${card.phone}` },
    card.address && { id: "map", label: t.location, icon: MapPin, href: `https://maps.google.com/?q=${encodeURIComponent(card.address)}` },
    card.website && { id: "web", label: t.website, icon: Globe, href: card.website.startsWith("http") ? card.website : `https://${card.website}` },
    { id: "save", label: t.saveContact, icon: UserPlus, onClick: vcard },
  ].filter(Boolean) as { id: string; label: string; icon: typeof Phone; href?: string; onClick?: () => void }[];

  const isRTL = lang === "ar";

  return (
    <MobileShell>
      <div className="relative">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
        />
        <header className="relative z-10 flex items-center justify-between px-4 pt-3 lg:px-8">
          <Link
            to="/vault"
            className="glass grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
            aria-label={t.back}
          >
            <ArrowLeft className={"h-4 w-4 " + (isRTL ? "rotate-180" : "")} />
          </Link>
          <button
            onClick={del}
            className="glass grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:text-destructive"
            aria-label={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-[1100px] gap-8 px-4 pb-32 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:px-8">
          <section className="flex flex-col items-center lg:items-end lg:sticky lg:top-6">
            <div className="relative w-full max-w-[520px]">
              <div
                className="absolute -inset-8 rounded-[3rem] opacity-50 blur-3xl"
                style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }}
              />
              <div className="relative">
                <CardPreview card={card} size="xl" />
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center gap-6 lg:items-start">
            <div className="w-full max-w-md text-center lg:text-start">
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: accent }} />
                <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-4xl">{card.name}</h1>
              </div>
              {(card.title || card.company) && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {[card.title, card.company].filter(Boolean).join(" · ")}
                </p>
              )}
              {card.bio && (
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">{card.bio}</p>
              )}
            </div>

            {actions.length > 0 && (
              <div className="grid w-full max-w-md grid-cols-3 gap-2.5">
                {actions.map((a) => {
                  const Icon = a.icon;
                  const inner = (
                    <div className="glass card-lift flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition">
                      <div
                        className="grid h-10 w-10 place-items-center rounded-full"
                        style={{ background: `linear-gradient(140deg, ${accent}, ${accent}88)` }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[11px] font-medium text-foreground/90">{a.label}</span>
                    </div>
                  );
                  return a.href ? (
                    <a key={a.id} href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <button key={a.id} onClick={a.onClick} className="text-start">{inner}</button>
                  );
                })}
              </div>
            )}

            {socialEntries.length > 0 && (
              <div className="w-full max-w-md">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t.followMe}
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialEntries.map(([id, val]) => {
                    const meta = SOCIALS_BY_ID[id];
                    return (
                      <a
                        key={id}
                        href={meta.toUrl(val)}
                        target="_blank"
                        rel="noreferrer"
                        title={meta.name}
                        className="glass grid h-11 w-11 place-items-center rounded-full text-foreground/90 transition hover:-translate-y-0.5"
                      >
                        <meta.Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="w-full max-w-md">
              <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <StickyNote className="h-3.5 w-3.5" />
                {t.notes}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.notePlaceholder}
                rows={4}
                className="glass w-full resize-none rounded-2xl border-0 bg-transparent p-4 text-sm outline-none focus:ring-2"
                style={{ boxShadow: `0 0 0 1px ${accent}33` }}
              />
              <button
                onClick={saveNote}
                disabled={savingNote || note === (card.notes ?? "")}
                className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: `linear-gradient(140deg, ${accent}, ${accent}cc)` }}
              >
                {savingNote ? t.saving : t.saveNote}
              </button>
            </div>
          </section>
        </div>
      </div>
    </MobileShell>
  );
}
