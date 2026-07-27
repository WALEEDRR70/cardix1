// Read-only thumbnail renderer for a Studio document (used in the template gallery).
import { NodeContent } from "@/components/studio/CanvasStage";
import type { StudioDoc } from "@/lib/studio/types";

export function StaticCardPreview({
  doc,
  width = 260,
  values,
  className,
}: {
  doc: StudioDoc;
  width?: number;
  values?: Record<string, string>;
  className?: string;
}) {
  const scale = width / doc.w;
  return (
    <div
      className={className}
      style={{ width, height: doc.h * scale, overflow: "hidden", position: "relative", borderRadius: 14 }}
    >
      <div
        style={{
          width: doc.w,
          height: doc.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          background: doc.background.gradient ?? doc.background.color,
        }}
      >
        {doc.background.image && (
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
