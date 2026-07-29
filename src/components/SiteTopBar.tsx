import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { tx } from "@/lib/tx";

/**
 * Slim global site bar so in-app workspaces keep the same header identity
 * (logo, main site links, theme + language) as the public website.
 */
export function SiteTopBar() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";

  const links = [
    { to: "/templates", label: tx("Templates") },
    { to: "/tools", label: tx("Tools") },
    { to: "/pricing", label: tx("Pricing") },
    { to: "/blog", label: tx("Blog") },
  ] as const;

  return (
    <div className="border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="flex h-11 items-center gap-4 px-4 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-6 w-6 object-contain" />
          <span className="text-[13px] font-semibold tracking-tight">{t.brand}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-[12px] text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <ThemeToggle compact />
          <LangToggle compact />
          <Link
            to="/dashboard"
            className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            {tx("My dashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
