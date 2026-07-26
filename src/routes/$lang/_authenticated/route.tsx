import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$lang/_authenticated")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    // getSession() reads the locally cached session (no network round-trip),
    // keeping page-to-page navigation instant.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    if (!user) throw redirect({ to: "/$lang/auth", params: { lang: params.lang } });
    return { user };
  },

  component: () => <Outlet />,
});
