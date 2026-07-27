// Renders a saved Studio design (from card.design) responsively inside any container.
import { useEffect, useRef, useState } from "react";
import { NodeContent } from "@/components/studio/CanvasStage";
import type { StudioDoc } from "@/lib/studio/types";

export function DesignPreview({
  doc,
  values,
  className,
  radius,
}: {
  doc: StudioDoc;
  values?: Record<string, string>;
  className?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const scale = w ? w / doc.w : 0;
  // Keep corner rounding visually proportional to the rendered card size.
  const r = radius ?? Math.max(12, Math.round((w || doc.w) * 0.045));

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: "100%",
        aspectRatio: `${doc.w} / ${doc.h}`,
        overflow: "hidden",
        position: "relative",
        borderRadius: r,
        isolation: "isolate",
      }}
    >
      <div
        dir="ltr"
        style={{
          width: doc.w,
          height: doc.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          insetInlineStart: "auto",
          left: 0,
          top: 0,
          background: doc.background?.gradient ?? doc.background?.color,

        }}
      >
        {doc.background?.image && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${doc.background.image})`,
              backgroundSize:
                doc.background.fit === "contain" ? "contain" : doc.background.fit === "repeat" ? "auto" : "cover",
              backgroundRepeat: doc.background.fit === "repeat" ? "repeat" : "no-repeat",
              backgroundPosition: "center",
              opacity: doc.background.imageOpacity ?? 1,
            }}
          />
        )}
        {doc.nodes.map((n) => (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: n.w,
              height: n.h,
              transform: `rotate(${n.rot}deg)`,
              opacity: n.hidden ? 0 : n.opacity,
            }}
          >
            <NodeContent n={n} values={values} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Maps a card row's fields onto the Studio placeholder tokens. */
export function cardDesignValues(card: {
  name?: string | null;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  slug?: string | null;
  socials?: Record<string, string> | null | unknown;
  logo_url?: string | null;
  department?: string | null;
  tagline?: string | null;
  working_hours?: string | null;
}): Record<string, string> {
  const v: Record<string, string> = {};
  // Always define known tokens (even as an empty string) so real cards never
  // fall back to the studio's demo sample text.
  const put = (k: string, val?: string | null) => {
    v[k] = val ?? "";
  };
  const socials = (card.socials && typeof card.socials === "object" ? card.socials : {}) as Record<string, string>;

  put("{{Name}}", card.name);
  put("{{Employee Name}}", card.name);
  put("{{Title}}", card.title);
  put("{{Job Title}}", card.title);
  put("{{Department}}", card.department);
  put("{{Company}}", card.company);
  put("{{Tagline}}", card.tagline);
  put("{{Bio}}", card.bio);
  put("{{Phone}}", card.phone);
  put("{{Mobile}}", card.phone);
  put("{{WhatsApp}}", card.whatsapp || card.phone);
  put("{{Email}}", card.email);
  put("{{Website}}", card.website);
  put("{{Address}}", card.address);
  put("{{Hours}}", card.working_hours);
  put("{{LinkedIn}}", socials.linkedin);
  put("{{Instagram}}", socials.instagram);
  put("{{X}}", socials.x || socials.twitter);
  if (card.avatar_url) v["{{Photo}}"] = card.avatar_url;
  if (card.logo_url) v["{{Logo}}"] = card.logo_url;
  if (card.slug && typeof window !== "undefined") v["{{QR}}"] = `${window.location.origin}/c/${card.slug}`;
  return v;
}

