/** Public company URLs, optionally prefixed with a locale segment. */
export const companyHref = (lang: string | undefined, slug: string, sub = "") =>
  `${lang ? `/${lang}` : ""}/company/${slug}${sub}`;

export const serviceHref = (lang: string | undefined, slug: string, service: string) =>
  companyHref(lang, slug, `/services/${encodeURIComponent(service)}`);

export const employeeHref = (lang: string | undefined, slug: string, employee: string) =>
  companyHref(lang, slug, `/${encodeURIComponent(employee)}`);
