import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CardForm, type CardFormData } from "@/components/CardForm";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cards/new")({
  head: () => ({ meta: [{ title: "New card — Cardix" }] }),
  component: NewCard,
});

function NewCard() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { user } = Route.useRouteContext();

  const initial: CardFormData = {
    name: "", slug: "card-" + Math.random().toString(36).slice(2, 7),
    title: "", company: "", bio: "", phone: "", whatsapp: "", email: user.email ?? "",
    website: "", address: "", accent_color: "#D4AF37", is_published: true,
  };

  async function onSubmit(d: CardFormData): Promise<void> {
    const { data, error } = await supabase.from("cards").insert({ ...d, user_id: user.id }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success("Card created");
    nav({ to: "/cards/$id", params: { id: data.id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.dashboard}
        </Link>
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">{t.createCard}</h1>
        <CardForm initial={initial} onSubmit={onSubmit} submitLabel={t.createCard} />
      </div>
    </div>
  );
}
