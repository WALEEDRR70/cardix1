// Rich company services stored in companies.services (jsonb).
// Legacy values were plain strings — parseServices upgrades them transparently.

export type CompanyService = {
  id: string;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  price?: string;
  duration?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  image_url?: string;
  features?: string[];
  is_published?: boolean;
};

export function slugifyService(name: string, fallback: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

export function parseServices(raw: unknown): CompanyService[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i): CompanyService => {
    if (typeof item === "string") {
      return { id: `s${i}`, slug: slugifyService(item, `service-${i + 1}`), name: item, is_published: true };
    }
    const o = (item ?? {}) as Record<string, unknown>;
    const name = String(o.name ?? "");
    const str = (k: string) => (o[k] == null ? undefined : String(o[k]) || undefined);
    return {
      id: String(o.id ?? `s${i}`),
      slug: String(o.slug ?? slugifyService(name, `service-${i + 1}`)),
      name,
      summary: str("summary"),
      description: str("description"),
      price: str("price"),
      duration: str("duration"),
      phone: str("phone"),
      whatsapp: str("whatsapp"),
      email: str("email"),
      website: str("website"),
      image_url: str("image_url"),
      features: Array.isArray(o.features) ? (o.features as unknown[]).map(String).filter(Boolean) : [],
      is_published: o.is_published !== false,
    };
  });
}

export function newService(name = ""): CompanyService {
  const id = rid();
  return { id, slug: slugifyService(name, `service-${id}`), name, features: [], is_published: true };
}

export function publishedServices(raw: unknown): CompanyService[] {
  return parseServices(raw).filter((s) => s.name && s.is_published !== false);
}

export function findService(raw: unknown, slug: string): CompanyService | undefined {
  return publishedServices(raw).find((s) => s.slug === slug);
}
