// Renders a saved Studio design (from card.design) responsively inside any container.
import { useEffect, useRef, useState } from "react";
import { NodeContent } from "@/components/studio/CanvasStage";
import type { StudioDoc } from "@/lib/studio/types";

export function DesignPreview({
  doc,
  values,
  className,
  radius = 20,
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

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: "100%",
        aspectRatio: `${doc.w} / ${doc.h}`,
        overflow: "hidden",
        position: "relative",
        borderRadius: radius,
      }}
    >
      <div
        style={{
          width: doc.w,
          height: doc.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
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
}): Record<string, string> {
  const v: Record<string, string> = {};
  const put = (k: string, val?: string | null) => {
    if (val) v[k] = val;
  };
  put("{{Name}}", card.name);
  put("{{Title}}", card.title);
  put("{{Company}}", card.company);
  put("{{Bio}}", card.bio);
  put("{{Phone}}", card.phone);
  put("{{Mobile}}", card.phone);
  put("{{WhatsApp}}", card.whatsapp);
  put("{{Email}}", card.email);
  put("{{Website}}", card.website);
  put("{{Address}}", card.address);
  put("{{Photo}}", card.avatar_url);
  if (card.slug && typeof window !== "undefined") v["{{QR}}"] = `${window.location.origin}/c/${card.slug}`;
  return v;
}
