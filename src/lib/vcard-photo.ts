// Builds a base64 PHOTO line for vCards so saved contacts show the card's picture.
const MAX = 320;

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

/** Returns a folded `PHOTO;ENCODING=b;TYPE=JPEG:<base64>` line, or "" when unavailable. */
export async function avatarPhotoLine(url?: string | null): Promise<string> {
  if (!url || typeof window === "undefined") return "";
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return "";
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(bitmap, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const b64 = dataUrl.split(",")[1];
    if (!b64) return "";
    return fold(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`);
  } catch {
    return "";
  }
}
