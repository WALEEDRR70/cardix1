import { avatarPhotoLine } from "@/lib/vcard-photo";

export type ContactSource = {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
};

export const telHref = (v?: string | null) => (v ? `tel:${v.replace(/\s+/g, "")}` : undefined);
export const mailHref = (v?: string | null) => (v ? `mailto:${v}` : undefined);
export const waHref = (v?: string | null) =>
  v ? `https://wa.me/${v.replace(/[^\d]/g, "")}` : undefined;
export const siteHref = (v?: string | null) =>
  v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : undefined;
export const mapsHref = (...parts: (string | null | undefined)[]) => {
  const q = parts.filter(Boolean).join(" ").trim();
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : undefined;
};

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** Builds and downloads a vCard for a company (organization contact). */
export async function downloadCompanyVCard(company: {
  slug: string;
  name: string;
  legal_name?: string | null;
  tagline?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  logo_url?: string | null;
}) {
  const photoLine = await avatarPhotoLine(company.logo_url);
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${esc(company.name)};;;`,
    `FN:${esc(company.name)}`,
    `ORG:${esc(company.legal_name || company.name)}`,
    company.tagline && `TITLE:${esc(company.tagline)}`,
    company.phone && `TEL;TYPE=WORK:${company.phone}`,
    company.email && `EMAIL;TYPE=INTERNET:${company.email}`,
    company.website && `URL:${siteHref(company.website)}`,
    (company.address || company.city) &&
      `ADR;TYPE=WORK:;;${esc(company.address ?? "")};${esc(company.city ?? "")};;;${esc(company.country ?? "")}`,
    company.description && `NOTE:${esc(company.description.slice(0, 400))}`,
    `URL;TYPE=Cardixn:https://cardixn.com/company/${company.slug}`,
    photoLine,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${company.slug}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
