import { useState } from "react";
import { Check, ChevronsUpDown, Building2, User as UserIcon, Plus, ArrowLeftRight } from "lucide-react";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { useAccount, type Membership } from "@/lib/account";
import { tx } from "@/lib/tx";

/**
 * Context switcher. Personal and business are two separate surfaces: in the
 * personal shell we only offer the door to the business side (and vice-versa),
 * never a mixed list of personal + company entries.
 */
export function AccountSwitcher({ activeCompanySlug }: { activeCompanySlug?: string }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const { data } = useAccount();
  const memberships = data?.memberships ?? [];
  const managed = data?.managed ?? [];

  const business = Boolean(activeCompanySlug);
  const active = memberships.find((m) => m.company.slug === activeCompanySlug);
  const label = active ? active.company.name : tx("Personal account");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 px-3 py-2.5 text-start text-[13px] font-medium transition hover:bg-secondary/60"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
          {business ? <Building2 className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-xl border border-border/60 p-1 shadow-luxe">
            {business ? (
              <>
                <p className="px-2.5 pb-1 pt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {tx("Business")}
                </p>
                {managed.map((m) => (
                  <CompanyRow
                    key={m.company_id}
                    m={m}
                    active={m.company.slug === activeCompanySlug}
                    onClick={() => setOpen(false)}
                  />
                ))}
                <Row
                  to="/co/new"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  label={tx("Create a company")}
                  active={false}
                  onClick={() => setOpen(false)}
                />
                <div className="my-1 h-px bg-border/60" />
                <Row
                  to="/dashboard"
                  icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
                  label={tx("Switch to personal account")}
                  active={false}
                  onClick={() => setOpen(false)}
                />
              </>
            ) : (
              <>
                <p className="px-2.5 pb-1 pt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {tx("Personal account")}
                </p>
                <Row
                  to="/dashboard"
                  icon={<UserIcon className="h-3.5 w-3.5" />}
                  label={tx("Personal account")}
                  active
                  onClick={() => setOpen(false)}
                />
                <div className="my-1 h-px bg-border/60" />
                <Row
                  to="/co"
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label={managed.length > 0 ? tx("Switch to company account") : tx("Create a company")}
                  active={false}
                  onClick={() => setOpen(false)}
                />
              </>
            )}
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
