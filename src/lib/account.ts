import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Company, CompanyRole } from "@/lib/workspace";

export type AccountType = "personal" | "company";

export type Membership = {
  company_id: string;
  role: CompanyRole;
  status: string;
  department_id: string | null;
  job_title: string | null;
  company: Company;
};

export type AccountContext = {
  userId: string | null;
  accountType: AccountType;
  activeCompanyId: string | null;
  memberships: Membership[];
  /** Companies the user can administrate (owner / admin / manager). */
  managed: Membership[];
  /** Memberships where the user is only an employee / viewer. */
  employed: Membership[];
};

const ADMIN_ROLES: CompanyRole[] = ["owner", "admin", "manager"];

export function isAdminRole(role?: CompanyRole | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

async function loadAccountContext(): Promise<AccountContext> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user?.id ?? null;

  if (!userId) {
    return { userId: null, accountType: "personal", activeCompanyId: null, memberships: [], managed: [], employed: [] };
  }

  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from("profiles").select("account_type, active_company_id").eq("id", userId).maybeSingle(),
    supabase
      .from("company_members")
      .select("company_id, role, status, department_id, job_title, companies(*)")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const memberships: Membership[] = ((rows ?? []) as any[])
    .filter((r) => r.companies)
    .map((r) => ({
      company_id: r.company_id,
      role: r.role as CompanyRole,
      status: r.status as string,
      department_id: r.department_id ?? null,
      job_title: r.job_title ?? null,
      company: r.companies as Company,
    }));

  return {
    userId,
    accountType: (profile?.account_type as AccountType) ?? "personal",
    activeCompanyId: (profile?.active_company_id as string | null) ?? null,
    memberships,
    managed: memberships.filter((m) => isAdminRole(m.role)),
    employed: memberships.filter((m) => !isAdminRole(m.role)),
  };
}

export const accountQueryKey = ["account-context"] as const;

export function useAccount() {
  return useQuery({ queryKey: accountQueryKey, queryFn: loadAccountContext, staleTime: 30_000 });
}

export function useAccountActions() {
  const qc = useQueryClient();
  return {
    async setAccountType(userId: string, accountType: AccountType) {
      await supabase.from("profiles").update({ account_type: accountType }).eq("id", userId);
      await qc.invalidateQueries({ queryKey: accountQueryKey });
    },
    async setActiveCompany(userId: string, companyId: string | null) {
      await supabase
        .from("profiles")
        .update({ active_company_id: companyId, account_type: companyId ? "company" : "personal" })
        .eq("id", userId);
      await qc.invalidateQueries({ queryKey: accountQueryKey });
    },
  };
}

/** Where a user should land after signing in, based on their saved context. */
export function homePathFor(ctx: AccountContext): string {
  if (ctx.accountType === "company") {
    const active =
      ctx.managed.find((m) => m.company_id === ctx.activeCompanyId) ?? ctx.managed[0];
    if (active) return `/co/${active.company.slug}`;
    const employee = ctx.employed.find((m) => m.company_id === ctx.activeCompanyId) ?? ctx.employed[0];
    if (employee) return "/me";
  }
  return "/dashboard";
}
