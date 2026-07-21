import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { Trash2, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { NoteDialog } from "@/components/NoteDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { CardPreview } from "@/components/CardPreview";

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
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [noteTarget, setNoteTarget] = useState<{ id: string; notes: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: cards } = useQuery({
    queryKey: ["saved_cards", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_cards")
        .select("*, source_card:cards!saved_cards_source_card_id_fkey(slug,name,title,company,phone,whatsapp,email,website,address,avatar_url,is_published)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      type Row = {
        id: string; name: string; title: string | null; company: string | null;
        avatar_url: string | null; notes: string | null; phone: string | null;
        email: string | null; website: string | null; source: string;
        source_card: {
          slug: string; name: string; title: string | null; company: string | null;
          phone: string | null; whatsapp: string | null; email: string | null;
          website: string | null; address: string | null; avatar_url: string | null;
          is_published: boolean;
        } | null;
      };
      // Overlay live source-card fields so owner edits appear automatically.
      return ((data ?? []) as unknown as Row[]).map((c) => {
        const s = c.source_card;
        if (!s || !s.is_published) return c;
        return {
          ...c,
          name: s.name ?? c.name,
          title: s.title ?? c.title,
          company: s.company ?? c.company,
          avatar_url: s.avatar_url ?? c.avatar_url,
          phone: s.phone ?? c.phone,
          email: s.email ?? c.email,
          website: s.website ?? c.website,
        };
      });
    },
  });

  function askDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("saved_cards").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success(t.deleted);
    setDeleteId(null);
  }

  function askEditNote(e: React.MouseEvent, id: string, current: string | null) {
    e.preventDefault();
    e.stopPropagation();
    setNoteTarget({ id, notes: current ?? "" });
  }

  async function saveNote(value: string) {
    if (!noteTarget) return;
    setBusy(true);
    const { error } = await supabase.from("saved_cards").update({ notes: value }).eq("id", noteTarget.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["saved_cards"] });
    toast.success(t.saveNote);
    setNoteTarget(null);
  }


  return (
    <MobileShell topBar={<PageHeader title={t.vault} subtitle={cards ? `${cards.length}` : undefined} />}>
      <div className="px-4 lg:px-8">
        {!cards || cards.length === 0 ? (
          <div className="glass mt-4 rounded-3xl p-10 text-center lg:p-16">
            <p className="text-sm text-muted-foreground lg:text-base">{t.emptyVault}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((c) => (
              <div key={c.id} className="group relative">
                <div
                  role="link"
                  tabIndex={0}
                  onClick={() => {
                    if (c.source_card?.slug) navigate({ to: "/c/$slug", params: { slug: c.source_card.slug } });
                    else navigate({ to: "/vault/$id", params: { id: c.id } });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (c.source_card?.slug) navigate({ to: "/c/$slug", params: { slug: c.source_card.slug } });
                      else navigate({ to: "/vault/$id", params: { id: c.id } });
                    }
                  }}
                  className="block cursor-pointer"
                >
                  <CardPreview card={c as any} size="xs" />
                </div>

                <div className="absolute end-2 top-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => askEditNote(e, c.id, c.notes)}
                    className="glass-strong grid h-7 w-7 place-items-center rounded-full text-foreground/80 backdrop-blur transition hover:text-foreground"
                    aria-label={c.notes ? t.editNote : t.addNote}
                    title={c.notes || t.addNote}
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => askDelete(e, c.id)}
                    className="glass-strong grid h-7 w-7 place-items-center rounded-full text-foreground/70 backdrop-blur opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    aria-label={t.delete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {c.notes && (
                  <p dir="auto" className="mt-1.5 line-clamp-1 px-1 text-[10.5px] italic text-muted-foreground/80">
                    {c.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <NoteDialog
        open={!!noteTarget}
        initial={noteTarget?.notes ?? ""}
        saving={busy}
        onOpenChange={(v) => { if (!v) setNoteTarget(null); }}
        onSave={(v) => { void saveNote(v); }}
      />
      <ConfirmDeleteDialog
        open={!!deleteId}
        loading={busy}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        onConfirm={() => { void confirmDelete(); }}
      />
    </MobileShell>
  );
}

