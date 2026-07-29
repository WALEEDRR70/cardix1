/** Server-only billing helpers (never imported from client code). */
export async function assertAdmin(ctx: { supabase: any; userId: string }) {
  // Role lookup runs as the signed-in user; RLS on user_roles only exposes their own rows.
  const { data } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}
