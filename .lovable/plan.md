# Two Independent Products Inside Cardixn

Today the app has one dashboard with a "workspace" tab bolted on. This plan separates it into two products that share only auth and the public card renderer.

```text
                 sign in
                    |
        +-----------+-----------+
        |                       |
  PERSONAL ACCOUNT        COMPANY ACCOUNT
  /{lang}/app/*           /{lang}/co/{slug}/*
  mobile-app feel         enterprise SaaS feel
  own nav + shell         own nav + shell
                                |
                          EMPLOYEE VIEW
                          /{lang}/me/*  (card-only, no admin)
```

An account chooser after sign-in routes people to the right product. A user can hold both: personal cards always exist independently of any company.

## Phase 1 — Account separation & shells

- Account-type selection on first sign-in (Personal / Company), stored on the profile; `/{lang}/switch` to move between contexts.
- Three route trees with three distinct layouts:
  - `app/*` — Personal: bottom-nav mobile shell (Cards, Vault, Scan, Analytics, Settings). No company anything.
  - `co/$slug/*` — Company: desktop sidebar + topbar enterprise shell.
  - `me/*` — Employee: minimal shell (My Card, Edit, QR/NFC, Analytics, Share, Settings).
- Routing guard picks the shell from membership + role; employees can never reach `co/*` admin routes.
- Existing `/dashboard` and `/workspace` routes redirect into the new trees.

## Phase 2 — Company registration & data model

- Multi-step company onboarding wizard collecting all requested fields (identity, legal, location, contact, brand, domain, description, socials, business hours, verification docs), with save-and-resume.
- Database: extend `companies` and add `company_settings`, `company_media`, `company_roles`, `company_permissions`, `company_business_hours`, `company_socials`, `company_verification_docs`, plus a `company_analytics` events stream. Personal tables (`cards` where `company_id is null`, `saved_cards`, `profiles`) stay free of company foreign keys.
- Private storage buckets for logos, media library and verification documents, with company-scoped access rules.

## Phase 3 — Company dashboard

Sections: Overview, Company Card, Employee Cards, Departments, Templates, Brand Manager, Media Library, Invitations, Analytics, QR Manager, NFC Manager, Settings, SEO, Public Page, Permissions. Each is its own route (not tabs in one file), sharing the enterprise shell.

- Brand Center: logo variants (dark/light), primary/secondary/accent, typography, icons, backgrounds, card/button style, corner radius, animation preset, verification badge — applied as CSS variables across every company surface and card.
- Media Library: shared, approved-asset flagging, employees see only approved items.
- Employee management: invite, create card, assign department/template, activate/deactivate/suspend/archive, transfer department.
- Permissions matrix: per-field locked/editable rules per template and role.

## Phase 4 — Drag & drop card builder

Canvas editor (Canva/Figma-like) replacing the form for company templates:

- Element palette: logo, employee photo, company photo, background, gradient, glass layer, name, job title, company, department, phone, email, website, QR, NFC, buttons, social icons, divider, text, shapes, images, video, map, custom section.
- Per-element: drag, resize, rotate, duplicate, delete, align guides, snap-to-grid, layer ordering, lock, hide, opacity, radius, shadow, glow, animation.
- Layout stored as JSON; a shared renderer draws the same JSON on the public card page.
- Employees open the same canvas in restricted mode: locked elements are non-selectable, only permitted fields are editable.

## Phase 5 — Templates, employee experience, public company page

- Unlimited company templates with starter presets (Corporate, Executive, Sales, Marketing, Creative, Luxury, Minimal, Premium, Modern); assignment per employee or department.
- Employee product surface finalized — card-only, zero admin.
- `/company/{slug}`: profile, company card, services, branches, optional employee directory, contact, socials, QR, NFC, with per-company SEO metadata.

## Phase 6 — Analytics

Company analytics: total/active/inactive employees and cards, views, QR scans, NFC opens, contact saves, website clicks, country/city/device breakdowns, top employee cards, top departments. Personal analytics stays as-is, scoped to the individual.

## Design

Dark glassmorphism and purple gradient throughout. Personal = premium mobile app (large touch targets, bottom nav, card-stack motion). Company = premium desktop SaaS (dense sidebar, data tables, command palette). Company surfaces re-theme themselves from that company's brand tokens.

## Technical notes

- Company data access goes through server functions with role checks; RLS keeps company rows readable only by active members, personal rows only by their owner.
- The builder JSON schema is versioned so old cards keep rendering after builder changes.
- Bilingual AR/EN with RTL preserved on every new screen; all new strings go through the i18n dictionaries.

## Delivery

This is far too large for one pass. I will build phase by phase and check in after each, starting with Phase 1 so you can see the two shells side by side before the heavy work lands.
