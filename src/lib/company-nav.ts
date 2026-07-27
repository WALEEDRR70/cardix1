import {
  LayoutDashboard, IdCard, Users, Building, LayoutTemplate, Palette, Images,
  MailPlus, BarChart3, QrCode, Nfc, Settings, Search, Globe, ShieldCheck, ScrollText, Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WsDict } from "@/i18n/workspace";

export type CompanyTab = {
  /** Path suffix appended to /co/$slug */
  path: string;
  icon: LucideIcon;
  label: (w: WsDict) => string;
  /** Rarely used — shown last, visually quieter. */
  advanced?: boolean;
};

export type CompanySection = CompanyTab & {
  /** Sub-pages surfaced as tabs inside this section (includes the section itself). */
  tabs: CompanyTab[];
};

/**
 * Five top-level sections. Everything else lives as a tab inside one of them,
 * so the sidebar stays calm while no feature is lost.
 */
export const COMPANY_SECTIONS: CompanySection[] = [
  {
    path: "",
    icon: LayoutDashboard,
    label: (w) => w.overview,
    tabs: [
      { path: "", icon: LayoutDashboard, label: (w) => w.overview },
      { path: "/card", icon: IdCard, label: (w) => w.companyCard },
      { path: "/activity", icon: ScrollText, label: (w) => w.auditLog, advanced: true },
    ],
  },
  {
    path: "/employees",
    icon: Users,
    label: (w) => w.employees,
    tabs: [
      { path: "/employees", icon: Users, label: (w) => w.employees },
      { path: "/departments", icon: Building, label: (w) => w.departments },
      { path: "/invitations", icon: MailPlus, label: (w) => w.invite },
    ],
  },
  {
    path: "/templates",
    icon: LayoutTemplate,
    label: (w) => w.templates,
    tabs: [
      { path: "/templates", icon: LayoutTemplate, label: (w) => w.templates },
      { path: "/studio", icon: Wand2, label: (w) => w.designStudio },
      { path: "/brand", icon: Palette, label: (w) => w.brand },
      { path: "/media", icon: Images, label: (w) => w.mediaLibrary },
    ],
  },
  {
    path: "/analytics",
    icon: BarChart3,
    label: (w) => w.analytics,
    tabs: [
      { path: "/analytics", icon: BarChart3, label: (w) => w.analytics },
      { path: "/qr", icon: QrCode, label: (w) => w.qrManager },
      { path: "/page", icon: Globe, label: (w) => w.publicPage },
      { path: "/nfc", icon: Nfc, label: (w) => w.nfcManager, advanced: true },
    ],
  },
  {
    path: "/settings",
    icon: Settings,
    label: (w) => w.settings,
    tabs: [
      { path: "/settings", icon: Settings, label: (w) => w.settings },
      { path: "/permissions", icon: ShieldCheck, label: (w) => w.permissions, advanced: true },
      { path: "/seo", icon: Search, label: (w) => w.seo, advanced: true },
    ],
  },
];

/** Section that owns a given path suffix (e.g. "/qr" -> the Reach section). */
export function findCompanySection(pathSuffix: string): CompanySection {
  const clean = pathSuffix.replace(/\/$/, "");
  return (
    COMPANY_SECTIONS.find((s) => s.tabs.some((t) => t.path === clean)) ??
    COMPANY_SECTIONS.find((s) => s.tabs.some((t) => t.path !== "" && clean.startsWith(t.path))) ??
    COMPANY_SECTIONS[0]
  );
}
