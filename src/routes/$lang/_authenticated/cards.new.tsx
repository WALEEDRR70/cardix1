import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@/lib/nav";
import { supabase } from "@/integrations/supabase/client";
import { CardForm, type CardFormData } from "@/components/CardForm";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { toast } from "sonner";

export const Route = createFileRoute("/$lang/_authenticated/cards/new")({
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
    website: "", address: "", avatar_url: "", accent_color: "#7c34ff", template: "luxury", is_published: true,
    socials: {},
  };

  async function onSubmit(d: CardFormData): Promise<void> {
    const { data, error } = await supabase.from("cards").insert({ ...d, user_id: user.id }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success(t.cardCreated);
    nav({ to: "/cards/$id", params: { id: data.id } });
  }

  return (
    <MobileShell topBar={<PageHeader title={t.createCard} back="/dashboard" />}>
      <div className="px-5 lg:px-8">
        <CardForm initial={initial} onSubmit={onSubmit} submitLabel={t.createCard} />
      </div>
    </MobileShell>
  );
}
