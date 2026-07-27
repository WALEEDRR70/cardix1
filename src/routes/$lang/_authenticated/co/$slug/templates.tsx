import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { Card, TemplatesTab } from "@/components/company/sections";
import { CardDesignsTab } from "@/components/company/card-designs";
import { CommunityTemplates } from "@/components/CommunityTemplates";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/templates")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w, lang } = useWs();
  const ar = lang === "ar";
  return (
    <CompanyShell company={company} role={role} title={w.templates} subtitle={company.name}>
      <CardDesignsTab company={company} canEdit={canManageCompany(role)} />

      <div className="mt-4">
        <TemplatesTab company={company} canEdit={canManageCompany(role)} />
      </div>


      <Card className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">{ar ? "قوالب المجتمع لموظفي الشركات" : "Community templates for employees"}</p>
          <p className="text-xs text-muted-foreground">
            {ar
              ? "أضف أي قالب كنسخة داخل مساحة العمل هذه — لن يُضاف إلى ملفك الشخصي."
              : "Add any template as a copy inside this workspace — it will not go to your personal profile."}
          </p>
        </div>
        <CommunityTemplates
          ar={ar}
          audience="employee"
          target={{
            kind: "company",
            companyId: company.id,
            companyName: company.name,
            companySlug: company.slug,
            accent: company.brand_primary,
          }}
        />
      </Card>
    </CompanyShell>
  );
}
