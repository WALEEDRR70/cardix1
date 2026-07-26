import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyProvider } from "@/lib/company-context";
import { useWs, type Company, type CompanyRole } from "@/lib/workspace";
import { Link } from "@/lib/nav";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug")({
  component: CompanyWorkspaceLayout,
});

function CompanyWorkspaceLayout() {
  const { slug } = Route.useParams();
  const { w } = useWs();

  const { data, isLoading } = useQuery({
    queryKey: ["co-workspace", slug],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      const { data: company } = await supabase.from("companies").select("*").eq("slug", slug).maybeSingle();
      if (!company || !userId) return { company: null as Company | null, role: null as CompanyRole | null };
      const { data: member } = await supabase
        .from("company_members")
        .select("role, status")
        .eq("company_id", company.id)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      return { company: company as Company, role: (member?.role as CompanyRole | undefined) ?? null };
    },
  });

  if (isLoading) {
    return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  }

  if (!data?.company || !data.role) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold">{data?.company ? w.noAccessTitle : w.companyNotFound}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{data?.company ? w.noAccessDesc : ""}</p>
          <Link
            to="/switch"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            {w.switchAccount}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CompanyProvider value={{ company: data.company, role: data.role }}>
      <Outlet />
    </CompanyProvider>
  );
}
