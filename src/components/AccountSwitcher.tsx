import { useState } from "react";
import { Check, ChevronsUpDown, Building2, User as UserIcon, Plus } from "lucide-react";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { useAccount, type Membership } from "@/lib/account";

/**
 * One inline switcher for every context: personal account, the company
 * workspaces the user manages, and the employee card view.
 */
export function AccountSwitcher({ activeCompanySlug }: { activeCompanySlug?: string }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [open, setOpen] = useState(false);
  const { data } = useAccount();
  const memberships = data?.memberships ?? [];
  const managed = data?.managed ?? [];
  const employed = data?.employed ?? [];

  const active = memberships.find((m) => m.company.slug === activeCompanySlug);
  const label = active ? active.company.name : ar ? "حسابي الشخصي" : "Personal account";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 px-3 py-2.5 text-start text-[13px] font-medium transition hover:bg-secondary/60"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
          {active ? <Building2 className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-xl border border-border/60 p-1 shadow-luxe">
            <Row
              to="/dashboard"
              icon={<UserIcon className="h-3.5 w-3.5" />}
              label={ar ? "حسابي الشخصي" : "Personal account"}
              active={!active}
              onClick={() => setOpen(false)}
            />
            {managed.map((m) => (
              <CompanyRow key={m.company_id} m={m} active={m.company.slug === activeCompanySlug} onClick={() => setOpen(false)} />
            ))}
            {employed.length > 0 && (
              <Row
                to="/me"
                icon={<Building2 className="h-3.5 w-3.5" />}
                label={ar ? "بطاقتي في الشركة" : "My company card"}
                active={false}
                onClick={() => setOpen(false)}
              />
            )}
            <Row
              to="/co/new"
              icon={<Plus className="h-3.5 w-3.5" />}
              label={ar ? "إنشاء شركة" : "Create a company"}
              active={false}
              onClick={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  to,
  icon,
  label,
  active,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition " +
        (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
      }
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-secondary/70">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
    </Link>
  );
}

function CompanyRow({ m, active, onClick }: { m: Membership; active: boolean; onClick: () => void }) {
  return (
    <Link
      to="/co/$slug"
      params={{ slug: m.company.slug }}
      onClick={onClick}
      className={
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition " +
        (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
      }
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-md border border-border/60 text-[9px] font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${m.company.brand_primary}, ${m.company.brand_secondary})` }}
      >
        {m.company.logo_url ? (
          <img src={m.company.logo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          m.company.name.slice(0, 2).toUpperCase()
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{m.company.name}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
    </Link>
  );
}
