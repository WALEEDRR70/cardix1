import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getInvitation, acceptInvitation } from "@/lib/workspace.functions";
import { wsDict } from "@/i18n/workspace";
import { getPreferredLocale } from "@/lib/locale-routing";
import { BadgeCheck, Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/join/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Join your company — Cardixn" }, { name: "robots", content: "noindex" }] }),
  component: JoinPage,
});

function JoinPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const lang = getPreferredLocale();
  const w = wsDict(lang);
  const accept = useServerFn(acceptInvitation);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitation({ data: { token } }),
  });

  async function onAccept() {
    if (!signedIn) {
      navigate({ to: "/$lang/auth", params: { lang }, search: { next: `/join/${token}` } as never });
      return;
    }
    setBusy(true);
    try {
      const res = await accept({ data: { token } });
      toast.success(w.invitationAccepted);
      if (res.cardSlug) window.location.href = `/${lang}/dashboard`;
    } catch (err: unknown) {
      toast.error(err instanceof Error && err.message === "EMAIL_MISMATCH" ? w.invitationInvalid : w.invitationInvalid);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  }

  if (!data?.ok) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <p className="text-sm text-muted-foreground">{w.invitationInvalid}</p>
      </div>
    );
  }

  const company = data.company!;

  return (
    <div className="grid min-h-[100dvh] place-items-center px-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="glass w-full max-w-sm rounded-3xl border border-border/60 p-7 text-center">
        <span
          className="mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-2xl"
          style={{ background: company.brand_primary + "22", color: company.brand_primary }}
        >
          {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6" />}
        </span>
        <h1 className="mt-4 flex items-center justify-center gap-1.5 text-lg font-semibold tracking-tight">
          {company.name}
          {company.is_verified && <BadgeCheck className="h-4 w-4 text-accent" />}
        </h1>
        <p className="mt-1 text-sm font-medium">{w.joinTitle}</p>
        <p className="mt-2 text-xs text-muted-foreground">{w.joinDesc}</p>
        <p className="mt-4 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">{data.invitation!.email}</p>
        <button
          onClick={onAccept}
          disabled={busy}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}
        >
          {busy ? w.accepting : w.acceptInvitation}
        </button>
      </div>
    </div>
  );
}
