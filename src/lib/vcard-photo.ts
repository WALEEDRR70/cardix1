// Builds a base64 PHOTO line for vCards so saved contacts show the card's picture.
const MAX = 300;
const JPEG_QUALITY = 0.75;

function fold(line: string): string {
  // vCard 3.0 lines must be folded at 75 octets; continuation lines start with a space.
  const out: string[] = [];
  let rest = line;
  out.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length) {
    out.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return out.join("\r\n");
}

function toJpegBase64(source: CanvasImageSource, w0: number, h0: number): string {
  const scale = Math.min(1, MAX / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * scale));
  const h = Math.max(1, Math.round(h0 * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  // JPEG has no alpha: paint a white backdrop so transparent PNGs don't turn black on iOS.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1] ?? "";
}

/** Loads the image through an <img> tag (works when fetch() is blocked by CORS preflight). */
function loadViaImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.naturalWidth ? img : null);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

async function base64FromUrl(url: string): Promise<string> {
  // Already inlined.
  if (url.startsWith("data:image/jpeg")) return url.split(",")[1] ?? "";

  try {
    const res = await fetch(url, { mode: "cors", cache: "no-cache" });
    if (res.ok) {
      const blob = await res.blob();
      if (typeof createImageBitmap === "function") {
        const bitmap = await createImageBitmap(blob);
        const b64 = toJpegBase64(bitmap, bitmap.width, bitmap.height);
        bitmap.close?.();
        if (b64) return b64;
      }
      const objUrl = URL.createObjectURL(blob);
      try {
        const img = await loadViaImage(objUrl);
        if (img) return toJpegBase64(img, img.naturalWidth, img.naturalHeight);
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    }
  } catch {
    /* fall through to <img> path */
  }

  const img = await loadViaImage(url);
  if (!img) return "";
  try {
    return toJpegBase64(img, img.naturalWidth, img.naturalHeight);
  } catch {
    return ""; // tainted canvas
  }
}

/** Returns a folded `PHOTO;ENCODING=b;TYPE=JPEG:<base64>` line, or "" when unavailable. */
export async function avatarPhotoLine(url?: string | null): Promise<string> {
  if (!url || typeof window === "undefined") return "";
  const b64 = await base64FromUrl(url);
  if (!b64) return "";
  // iOS Contacts parses `ENCODING=b` (RFC 2426) and must not be followed by a blank line.
  return fold(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`);
}
