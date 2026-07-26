// Re-flows a measured card layout onto a DIFFERENT canvas size while keeping
// the same visual identity (roles, order, hierarchy, alignment side).
// Used when the AI-scanned card is e.g. landscape but the user wants a
// portrait / square / story size: instead of stretching the scan, we rebuild a
// professional layout for the target format from the same measured blocks.
import type { AiBlock, AiBlockRole, AiCardAnalysis } from "./ai.functions";

const CONTACT: AiBlockRole[] = ["phone", "email", "website", "address"];

/** height (in % of the canvas height) for a size expressed in % of the short edge */
function hOf(sizePct: number, aspect: number) {
  return aspect < 1 ? sizePct * aspect : sizePct;
}

export function reflowBlocks(
  a: AiCardAnalysis,
  targetAspect: number,
  opts: { pad?: number } = {},
): AiBlock[] {
  const src = a.blocks ?? [];
  const rtl = a.direction === "rtl";
  const landscape = targetAspect >= 1;
  const square = targetAspect > 0.9 && targetAspect < 1.15;
  const pad = opts.pad ?? (landscape ? 7 : 8);

  const has = (r: AiBlockRole) => src.some((b) => b.role === r);
  const of = (r: AiBlockRole) => src.find((b) => b.role === r);
  const sizeOf = (r: AiBlockRole, fb: number) => of(r)?.sizePct ?? fb;

  const out: AiBlock[] = [];
  const align: AiBlock["align"] = square && !landscape ? "center" : rtl ? "right" : "left";

  // ---- text roles, keeping their original reading order -------------------
  const heads = src
    .filter((b) => ["name", "title", "company", "tagline"].includes(b.role))
    .sort((p, q) => p.y - q.y || p.x - q.x);
  const contacts = src
    .filter((b) => CONTACT.includes(b.role))
    .sort((p, q) => p.y - q.y || p.x - q.x);

  const colW = landscape ? 52 : 100 - pad * 2;
  const colX = rtl ? 100 - pad - colW : pad;

  // ---- logo ---------------------------------------------------------------
  if (has("logo")) {
    const lw = landscape ? 16 : 26;
    // keep a ~2.6:1 logo box in physical proportions on the target canvas
    const logoH = Math.max(4, (lw / 2.6) * targetAspect);
    out.push({
      role: "logo",
      x: a.logoPosition === "center" ? (100 - lw) / 2 : rtl ? pad : 100 - pad - lw,
      y: pad,
      w: lw,
      h: logoH,
      align: "center",
    });
  }

  // ---- photo --------------------------------------------------------------
  let cursor = pad + (has("logo") ? (landscape ? 12 : 14) : 0);
  if (has("photo")) {
    const pw = landscape ? 20 : 24;
    const ph = targetAspect < 1 ? pw * targetAspect : pw / targetAspect;
    out.push({
      role: "photo",
      x: landscape ? (rtl ? 100 - pad - pw : pad) : square ? (100 - pw) / 2 : colX,
      y: landscape ? Math.max(pad + 2, 50 - ph / 2) : cursor,
      w: pw,
      h: ph,
      align: "center",
    });
    if (!landscape) cursor += ph + 4;
  }

  const textX = landscape && has("photo") ? (rtl ? colX - 24 : colX + 24) : colX;
  const textW = landscape && has("photo") ? colW - 24 : colW;

  // ---- headline stack -----------------------------------------------------
  let y = landscape ? Math.max(cursor, 26) : Math.max(cursor, 34);
  for (const b of heads) {
    const s =
      b.role === "name" ? sizeOf("name", 6.4)
        : b.role === "company" ? sizeOf("company", 4.4)
          : sizeOf(b.role, 3.4);
    const h = Math.max(3, hOf(s * 1.5, targetAspect));
    out.push({
      role: b.role,
      x: textX, y, w: textW, h,
      align, sizePct: s,
      weight: b.weight ?? (b.role === "name" ? 700 : b.role === "title" ? 600 : 500),
      color: b.color ?? null,
      letterSpacing: b.letterSpacing ?? 0,
      uppercase: b.uppercase,
    });
    y += h + (b.role === "name" ? 1.5 : 1);
  }

  // ---- contact stack ------------------------------------------------------
  const qr = has("qr");
  const qrW = landscape ? 18 : 22;
  const qrH = targetAspect < 1 ? qrW * targetAspect : qrW / targetAspect;
  const contactBottom = 100 - pad - (landscape ? 0 : qr ? qrH + 4 : 0);

  const cS = sizeOf("phone", 2.9);
  const cH = Math.max(2.6, hOf(cS * 1.5, targetAspect));
  const cCount = contacts.length;
  let cy = Math.max(y + 3, contactBottom - cCount * (cH + 0.8));
  const cW = landscape && qr ? textW - qrW - 3 : textW;
  for (const b of contacts) {
    out.push({
      role: b.role, x: textX, y: cy, w: cW, h: cH,
      align, sizePct: cS, weight: 400, color: b.color ?? null,
    });
    cy += cH + 0.8;
  }

  // ---- QR + CTA -----------------------------------------------------------
  if (qr) {
    out.push({
      role: "qr",
      x: landscape ? (rtl ? pad : 100 - pad - qrW) : square ? (100 - qrW) / 2 : rtl ? pad : 100 - pad - qrW,
      y: 100 - pad - qrH,
      w: qrW, h: qrH,
    });
  }
  if (has("cta")) {
    const bw = landscape ? 26 : 42;
    const bh = Math.max(5, hOf(7, targetAspect));
    out.push({
      role: "cta",
      x: rtl ? 100 - pad - bw : pad,
      y: 100 - pad - bh - (landscape ? 0 : qr ? qrH + 3 : 0),
      w: bw, h: bh, align: "center",
    });
  }

  return out;
}

/** true when the target canvas has a different orientation than the scan */
export function needsReflow(sourceAspect: number, targetAspect: number) {
  const cls = (v: number) => (v > 1.12 ? "l" : v < 0.89 ? "p" : "s");
  return cls(sourceAspect) !== cls(targetAspect) ||
    Math.abs(sourceAspect - targetAspect) / Math.max(sourceAspect, targetAspect) > 0.22;
}
