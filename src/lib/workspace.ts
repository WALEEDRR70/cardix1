import { useI18n } from "@/lib/i18n";
import { wsDict, type WsDict } from "@/i18n/workspace";
import type { Tables } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type CompanyMember = Tables<"company_members">;
export type CompanyDepartment = Tables<"company_departments">;
export type CompanyInvitation = Tables<"company_invitations">;
export type CompanyBranch = Tables<"company_branches">;
export type CompanyTemplate = Tables<"company_templates">;
export type CompanyCustomField = Tables<"company_custom_fields">;

export type CompanyRole = CompanyMember["role"];
export type MemberStatus = CompanyMember["status"];

/** Locale-aware workspace dictionary. */
export function useWs(): { w: WsDict; lang: string } {
  const { lang } = useI18n();
  return { w: wsDict(lang), lang };
}

/* ----------------------------- RBAC ----------------------------- */

export const ROLE_RANK: Record<CompanyRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  employee: 2,
  viewer: 1,
};

export function canManageCompany(role?: CompanyRole | null): boolean {
  return role === "owner" || role === "admin";
}
export function canManageEmployees(role?: CompanyRole | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}
export function isOwner(role?: CompanyRole | null): boolean {
  return role === "owner";
}

export function roleLabel(role: CompanyRole, w: WsDict): string {
  return {
    owner: w.roleOwner,
    admin: w.roleAdmin,
    manager: w.roleManager,
    employee: w.roleEmployee,
    viewer: w.roleViewer,
  }[role];
}

export function statusLabel(status: MemberStatus, w: WsDict): string {
  return {
    active: w.statusActive,
    inactive: w.statusInactive,
    suspended: w.statusSuspended,
    former: w.statusFormer,
  }[status];
}

/* --------------------- Corporate identity ------------------------ */

/**
 * Fields on an employee card that are owned by the company and can never be
 * edited by the employee.
 */
export const COMPANY_LOCKED_CARD_FIELDS = [
  "company",
  "accent_color",
  "template",
  "website",
  "address",
] as const;

export type LockedCardField = (typeof COMPANY_LOCKED_CARD_FIELDS)[number];

/** Values an employee card inherits from the corporate brand. */
export function brandDefaults(company: Pick<Company, "name" | "brand_primary" | "default_template" | "website" | "address">) {
  return {
    company: company.name,
    accent_color: company.brand_primary,
    template: company.default_template,
    website: company.website ?? "",
    address: company.address ?? "",
  };
}

/* ------------------------- URLs / slugs -------------------------- */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "company";
}

export function companyPath(slug: string): string {
  return `/company/${slug}`;
}
export function employeeCardPath(companySlug: string, cardSlug: string): string {
  return `/company/${companySlug}/${cardSlug}`;
}
export function absoluteUrl(path: string): string {
  if (typeof window === "undefined") return `https://cardixn.com${path}`;
  return `${window.location.origin}${path}`;
}

/* --------------------- Email signature --------------------------- */

export function buildEmailSignature(opts: {
  name: string;
  title?: string | null;
  companyName: string;
  logoUrl?: string | null;
  accent: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  cardUrl: string;
  qrUrl?: string | null;
}): string {
  const line = (label: string, value?: string | null, href?: string) =>
    value
      ? `<div style="font-size:12px;color:#555;margin-top:2px">${label}: ${
          href ? `<a href="${href}" style="color:${opts.accent};text-decoration:none">${value}</a>` : value
        }</div>`
      : "";
  return `<table cellpadding="0" cellspacing="0" style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <tr>
    ${opts.logoUrl ? `<td style="padding-right:16px;vertical-align:top"><img src="${opts.logoUrl}" alt="${opts.companyName}" width="64" style="border-radius:12px;display:block" /></td>` : ""}
    <td style="border-left:3px solid ${opts.accent};padding-left:16px;vertical-align:top">
      <div style="font-size:16px;font-weight:700;color:#111">${opts.name}</div>
      ${opts.title ? `<div style="font-size:13px;color:${opts.accent};font-weight:600">${opts.title}</div>` : ""}
      <div style="font-size:13px;color:#111;font-weight:600;margin-top:2px">${opts.companyName}</div>
      ${line("T", opts.phone, opts.phone ? `tel:${opts.phone}` : undefined)}
      ${line("E", opts.email, opts.email ? `mailto:${opts.email}` : undefined)}
      ${line("W", opts.website, opts.website ?? undefined)}
      <div style="margin-top:8px"><a href="${opts.cardUrl}" style="font-size:12px;font-weight:600;color:${opts.accent};text-decoration:none">Digital business card →</a></div>
    </td>
    ${opts.qrUrl ? `<td style="padding-left:16px;vertical-align:top"><img src="${opts.qrUrl}" alt="QR" width="72" style="display:block" /></td>` : ""}
  </tr>
</table>`;
}

/* ------------------------- CSV import ---------------------------- */

export type ImportRow = { name: string; email: string; job_title: string; department: string; phone: string };

export function parseEmployeeCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const first = lines[0].toLowerCase();
  const hasHeader = first.includes("email") || first.includes("name");
  const rows = hasHeader ? lines.slice(1) : lines;
  return rows
    .map((l) => {
      const cells = l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const [name = "", email = "", job_title = "", department = "", phone = ""] = cells;
      return { name, email, job_title, department, phone };
    })
    .filter((r) => /.+@.+\..+/.test(r.email));
}
