/**
 * Client-side image validation + normalisation.
 *
 * Guarantees that whatever we store can actually be rendered by a browser:
 * - decodes the file first (rejects corrupt / unsupported formats early)
 * - downscales very large images (huge logos otherwise cost MBs per card view)
 * - converts exotic-but-decodable formats (avif/heif/tiff…) to PNG
 */

const SAFE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_EDGE = 1600;
const MAX_BYTES = 1_200_000;

export type PreparedImage = { file: File; width: number; height: number; converted: boolean };

async function decode(file: File): Promise<{ w: number; h: number; bitmap?: ImageBitmap }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { w: bitmap.width, h: bitmap.height, bitmap };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode-failed"));
      el.src = url;
    });
    return { w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImageFile(file: File): Promise<PreparedImage> {
  // SVG can't be decoded to a bitmap reliably and is already tiny — pass through.
  if (file.type === "image/svg+xml") return { file, width: 0, height: 0, converted: false };

  let info: { w: number; h: number; bitmap?: ImageBitmap };
  try {
    info = await decode(file);
  } catch {
    throw new Error("unsupported-image");
  }
  if (!info.w || !info.h) throw new Error("unsupported-image");

  const tooBig = Math.max(info.w, info.h) > MAX_EDGE || file.size > MAX_BYTES;
  const unsafeType = !SAFE_TYPES.includes(file.type);
  if (!tooBig && !unsafeType) {
    info.bitmap?.close?.();
    return { file, width: info.w, height: info.h, converted: false };
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(info.w, info.h));
  const w = Math.max(1, Math.round(info.w * scale));
  const h = Math.max(1, Math.round(info.h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    info.bitmap?.close?.();
    return { file, width: info.w, height: info.h, converted: false };
  }
  if (info.bitmap) ctx.drawImage(info.bitmap, 0, 0, w, h);
  else {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("unsupported-image"));
      el.src = url;
    });
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
  }
  info.bitmap?.close?.();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
  if (!blob) return { file, width: info.w, height: info.h, converted: false };
  const name = file.name.replace(/\.[^.]+$/, "") || "image";
  return {
    file: new File([blob], `${name}.png`, { type: "image/png" }),
    width: w,
    height: h,
    converted: true,
  };
}

/** Resolves true when the URL can actually be painted by the browser. */
export function canDisplayImage(url: string, timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    const done = (ok: boolean) => {
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), timeoutMs);
    img.onload = () => done(img.naturalWidth > 0);
    img.onerror = () => done(false);
    img.src = url;
  });
}
