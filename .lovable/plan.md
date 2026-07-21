# Cardix Global i18n Architecture

Rebuild internationalization around URL-prefixed locales (`/en`, `/ar`, `/fr`, …) with per-language SEO, hreflang, sitemaps, and localized landing pages. This is a large multi-phase change — I'll ship it in ordered, verifiable phases rather than one giant commit.

## Scope

**20 locales:** ar, en, fr, de, es, it, pt, ru, tr, nl, pl, zh, zh-TW, ja, ko, hi, id, ms, th, vi
**RTL:** ar (auto `dir="rtl"`)
**Default:** en; **x-default → en**
**Canonical domain:** https://cardix1.lovable.app

## URL Structure

```text
/                       → redirect to detected/preferred locale
/:lang                  → localized landing
/:lang/features
/:lang/pricing
/:lang/about
/:lang/contact
/:lang/blog
/:lang/blog/:slug
/:lang/l/:landingSlug   → SEO landing pages (30+ topics)
/:lang/auth
/:lang/dashboard        (app — still localized UI, noindex)
/:lang/scan | vault | vault/:id | cards/:id/edit | cards/:id/analytics
/c/:slug                (public card — stays unprefixed; owner-selected card locale)
```

App routes stay under the locale prefix so UI language is deterministic. Public card pages keep the short `/c/:slug` (shared links shouldn't break); card content itself is user-authored.

## Technical Design

**Route layout (TanStack file routes):**
- New pathless/segment layout `src/routes/$lang.tsx` acts as the locale gate: validates `params.lang` against the supported list (else `notFound()`), sets `<html lang dir>` via `useEffect`, provides `I18nContext`.
- Move existing pages under `src/routes/$lang.*` (e.g. `$lang.index.tsx`, `$lang.dashboard.tsx`, `$lang.features.tsx`, `$lang.blog.tsx`, `$lang.blog.$slug.tsx`, `$lang.l.$slug.tsx`, etc.).
- Root `src/routes/index.tsx` becomes a redirector: reads `localStorage.cardix_lang` → else `navigator.language` match → else `en`, then `navigate({ to: '/$lang', params })`.
- Keep `/c/$slug` and `/auth/callback` unprefixed.

**Translation files:** `src/i18n/locales/{lang}/{namespace}.json` (namespaces: `common`, `nav`, `landing`, `dashboard`, `card`, `scan`, `vault`, `auth`, `errors`). Lazy-loaded per locale via dynamic `import()` and cached; only current locale ships to client.

**I18n runtime:** Replace `src/lib/i18n.tsx` with a new provider that:
- Takes `lang` from route params (single source of truth — no more local state drift)
- Exposes `t(key, vars?)`, `locale`, `dir`, `switchLocale(nextLang)` (which navigates to the same route under the new lang using `router.buildLocation`)
- Sets `document.documentElement.lang` and `dir`

**Language switcher:** Premium dropdown (flag + native name) in `MobileShell` header + desktop sidebar; on change → `switchLocale` preserves current path + search.

**Auto-detect:** Only on root `/` (one-shot). After first navigation the URL is the source of truth; selection persists to `localStorage`.

## SEO

Per-route `head()` reads `params.lang` and returns:
- Localized `title` / `description` / `og:title` / `og:description` from the namespace JSON
- `og:locale` (e.g. `ar_SA`, `en_US`) + `og:locale:alternate` list
- Canonical `https://cardix1.lovable.app/:lang/...` (self-referential on leaves)
- `<link rel="alternate" hreflang="xx" href="…">` for every locale + `x-default`
- Structured data (WebSite/Organization on root; Article on blog; FAQPage on landing)

Dashboard/app routes emit `<meta name="robots" content="noindex,nofollow">`.

## Sitemaps

Replace single sitemap with an index:
- `src/routes/sitemap[.]xml.ts` → `<sitemapindex>` listing per-locale sitemaps
- `src/routes/sitemap-$lang[.]xml.ts` → `<urlset>` for that locale, each `<url>` carries full `<xhtml:link rel="alternate" hreflang>` set
- Enumerate: landing, features, pricing, about, contact, blog index, published blog posts, all landing-page slugs
- Update `public/robots.txt` `Sitemap:` line to point at the index

## Blog & SEO Landing Pages

- Two new tables: `blog_posts` (id, slug, lang, title, excerpt, body_md, cover_url, published_at, status) and `landing_pages` (id, slug, lang, title, meta_description, hero_json, sections_json, faq_json, published). Both have `(slug, lang)` uniqueness and public `SELECT` policies for published rows; admin-only writes.
- `$lang.blog.tsx` lists posts for that lang; `$lang.blog.$slug.tsx` renders MDX-ish markdown.
- `$lang.l.$slug.tsx` renders SEO landing pages with H1/H2 hierarchy + FAQ (FAQPage JSON-LD) + internal links.
- **Content authoring:** I'll seed the schema + a small starter set (EN + AR for 3–5 landing topics, 1 blog post per language) so the pipeline is real end-to-end. Filling all 30 topics × 20 langs × 2500 words = ~1.5M words of copy and is not something to auto-generate blindly in one shot — I'll wire an admin editor (or accept structured JSON drops) so real localized copy can be added incrementally without code changes.

## Emails

Auth email templates: I'll scaffold localized templates and switch by user's `preferred_language` column added to `profiles`. (Best-effort — Supabase auth emails support one template per event; I'll use a locale-router that inlines all languages with a language-tagged section, or per-lang templates keyed off metadata.)

## Performance

- Lazy `import()` per-locale namespace bundles
- Route-level code splitting (TanStack default)
- Cache-Control on sitemaps
- Only the active locale's JSON is fetched at runtime

## Phased Rollout

1. **Foundation:** i18n provider rewrite, locale registry, `$lang` route layout, root redirector, language switcher, migrate current pages (landing, dashboard, scan, vault, editor, analytics, auth) under `$lang.*`. All existing English strings extracted to `en/*.json`; Arabic ported from current i18n; other 18 langs seeded with English fallback + machine-translated `common`/`nav` so the UI never shows raw keys.
2. **SEO plumbing:** per-route localized `head()`, hreflang helper, sitemap index + per-locale sitemaps, robots update, `og:locale` alternates, structured data.
3. **Content surfaces:** blog + landing-page schema/migrations, list/detail routes, admin authoring page (protected), seed set (EN + AR).
4. **Polish:** email localization scaffold, `preferred_language` on profile, QA pass on RTL.

## Technical Details

- **Route param validation:** `parseParams: ({ lang }) => ({ lang: SUPPORTED.includes(lang) ? lang : throw notFound() })` on `$lang` layout.
- **Locale registry:** `src/i18n/config.ts` exports `SUPPORTED_LOCALES`, `DEFAULT_LOCALE = 'en'`, `RTL_LOCALES = ['ar']`, `LOCALE_META` (native name, flag, `og:locale` code).
- **Translation loading:** `loadNamespace(lang, ns)` returns cached promise; provider suspends via React `use()` inside a boundary or loader-level `ensureQueryData` so SSR head sees translated strings.
- **hreflang helper:** `buildAlternates(pathTemplate, params)` → array of `{ rel:'alternate', hreflang, href }` including `x-default`.
- **Sitemap enumeration:** static route list constant + Supabase queries for published blog posts and landing pages (via server route with `supabase` publishable client; `SELECT` policy allows `anon` for published rows).
- **Migration:** existing `/dashboard`, `/scan`, `/vault/...`, `/cards/...` URLs redirect to `/en/...` (or detected lang) via a catch-style redirect route so bookmarks don't 404.
- **What I will NOT do this pass:** hand-author 30×20 fully localized 2500-word landing pages, or a full CMS. The plumbing supports them; content lands over time through the admin editor or JSON seeds. Say the word if you want me to prioritize a specific subset (e.g. EN+AR+ES for "qr-business-card", "nfc-business-card", "business-card-scanner") and I'll draft real long-form copy for those first.

Approve and I'll start with Phase 1.
