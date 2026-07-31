import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { stripLocalePrefix } from "@/lib/locale-routing";

export const Route = createFileRoute("/$lang/_authenticated")({
  ssr: false,
  beforeLoad: async ({ params, location }) => {
    // getSession() reads the locally cached session (no network round-trip),
    // keeping page-to-page navigation instant.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    if (!user) {
      // Business surfaces have their own entrance, fully separate from personal.
      const path = stripLocalePrefix(location.pathname);
      const business = path === "/co" || path.startsWith("/co/") || path === "/me";
      throw redirect({
        to: business ? "/$lang/co/auth" : "/$lang/auth",
        params: { lang: params.lang },
        search: { next: location.href },
      });
    }
    return { user };
  },

  component: () => <Outlet />,
});
