/**
 * Human-readable job titles derived from a company role.
 *
 * Corporate cards are mostly Arabic-first, and the raw enum values ("employee",
 * "manager") used to leak straight onto the printed card. This map keeps the
 * fallback readable instead of exposing database enums to end users.
 */
export const ROLE_TITLE: Record<string, string> = {
  owner: "المالك",
  admin: "مدير النظام",
  manager: "مدير",
  employee: "موظف",
  viewer: "مشاهد",
};

/** Resolve the best available job title for a corporate card. */
export function resolveJobTitle(
  jobTitle: string | null | undefined,
  departmentName: string | null | undefined,
  role: string | null | undefined,
): string | null {
  if (jobTitle && jobTitle.trim()) return jobTitle.trim();
  if (departmentName && departmentName.trim()) return departmentName.trim();
  if (role && ROLE_TITLE[role]) return ROLE_TITLE[role];
  return null;
}
