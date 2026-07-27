import { useEffect, useState } from "react";
import { Link } from "@/lib/nav";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";

export type MobileNavLink = { to?: string; href?: string; label: string };

/**
 * Hamburger menu for phones — the marketing header hides its nav below `md`,
 * so without this the whole site is unreachable on mobile.
 */
export function MobileNav({ links, authed }: { links: readonly MobileNavLink[]; authed: boolean | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.menu ?? "Menu"}
        className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card/60 text-foreground backdrop-blur"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-strong absolute inset-x-0 top-0 safe-top rounded-b-3xl border-b border-border/60 px-5 pb-6 pt-4 shadow-luxe animate-in slide-in-from-top duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
                <span className="text-sm font-semibold tracking-tight">{t.brand}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close ?? "Close"}
                className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-5 grid gap-1">
              {links.map((l) =>
                l.to ? (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-[15px] font-medium text-foreground/90 transition hover:bg-secondary/70"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-[15px] font-medium text-foreground/90 transition hover:bg-secondary/70"
                  >
                    {l.label}
                  </a>
                ),
              )}
            </nav>

            <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <LangToggle compact />
              </div>
              <Link
                to={authed === false ? "/auth" : "/dashboard"}
                onClick={() => setOpen(false)}
                className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground"
              >
                {authed === false ? t.signIn : t.dashboard}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
