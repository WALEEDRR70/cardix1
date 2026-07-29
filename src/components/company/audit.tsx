// Activity log for the company workspace.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWs, type Company } from "@/lib/workspace";
import { Card } from "@/components/company/sections";
import { ScrollText } from "lucide-react";
import { txDict } from "@/lib/tx";

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

/** Records an administrative action. Never throws — logging must not break UX. */
export async function logCompanyAction(
  companyId: string,
  actorId: string,
  action: string,
  entity?: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    await supabase
      .from("company_audit_logs")
      .insert({ company_id: companyId, actor_id: actorId, action, entity: entity ?? null, metadata: metadata as never });
  } catch {
    /* non-critical */
  }
}

const ACTION_LABEL: Record<string, { en: string; ar: string }> = {
  "member.status": { en: "Changed employee status", ar: "غيّر حالة موظف" },
  "member.role": { en: "Changed employee role", ar: "غيّر دور موظف" },
  "invitation.created": { en: "Created an invitation", ar: "أنشأ دعوة" },
  "invitation.revoked": { en: "Revoked an invitation", ar: "ألغى دعوة" },
  "company.updated": { en: "Updated company settings", ar: "حدّث إعدادات الشركة" },
  "brand.updated": { en: "Updated brand identity", ar: "حدّث الهوية البصرية" },
  "department.created": { en: "Created a department", ar: "أنشأ قسمًا" },
  "department.deleted": { en: "Deleted a department", ar: "حذف قسمًا" },
};

export function AuditTab({ company, userId }: { company: Company; userId: string }) {
  const { w, lang } = useWs();

  const { data, isLoading } = useQuery({
    queryKey: ["company-audit", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_audit_logs")
        .select("id, actor_id, action, entity, metadata, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as AuditRow[];
    },
  });

  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold">{w.auditLog}</p>
        <p className="mt-1 text-xs text-muted-foreground">{w.auditDesc}</p>
      </Card>

      {isLoading ? (
        <Card className="text-sm text-muted-foreground">{w.loading}</Card>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <ScrollText className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{w.auditEmpty}</p>
        </Card>
      ) : (
        <Card className="divide-y divide-border/50 p-0">
          {data!.map((row) => {
            const label = ACTION_LABEL[row.action];
            const target = (row.metadata?.label ?? row.metadata?.name ?? row.entity ?? "") as string;
            return (
              <div key={row.id} className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: company.brand_primary }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {label ? (txDict(label.en, label.ar)) : row.action}
                    {target && <span className="text-muted-foreground"> — {target}</span>}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {row.actor_id === userId ? w.auditYou : row.actor_id ? row.actor_id.slice(0, 8) : "—"} ·{" "}
                    {fmt.format(new Date(row.created_at))}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
