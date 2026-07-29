// Client-side admin hint. Every privileged action is re-checked server-side.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin(userId: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();
      return Boolean(data);
    },
  });
  return Boolean(data);
}
