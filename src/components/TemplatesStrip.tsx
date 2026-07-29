import { Heart, LayoutTemplate } from "lucide-react";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { CommunityTemplates } from "@/components/CommunityTemplates";
import { tx } from "@/lib/tx";

/** Community templates surfaced inside the personal account (personal + mixed kinds only). */
export function TemplatesStrip({ limit = 6 }: { limit?: number }) {
  const { lang } = useI18n();
  const ar = lang === "ar";

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <LayoutTemplate className="h-3.5 w-3.5" />
          {tx("Ready-made templates")}
        </h2>
        <Link to="/templates" className="text-[11px] font-semibold text-primary">
          {tx("See all")}
        </Link>
      </div>

      <CommunityTemplates ar={ar} audience="personal" target={{ kind: "personal" }} limit={limit} />
    </section>
  );
}

/** Templates the user liked — falls back to the most-liked community designs. */
export function FavoriteTemplatesStrip({ limit = 6 }: { limit?: number }) {
  const { lang } = useI18n();
  const ar = lang === "ar";

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Heart className="h-3.5 w-3.5" />
          {tx("My favourite templates")}
        </h2>
        <Link to="/templates" className="text-[11px] font-semibold text-primary">
          {tx("See all")}
        </Link>
      </div>

      <CommunityTemplates ar={ar} audience="personal" target={{ kind: "personal" }} limit={limit} mode="favorites" />
    </section>
  );
}
