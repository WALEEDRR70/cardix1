import {
  LayoutDashboard, IdCard, Users, Building, LayoutTemplate, Palette, Images,
  MailPlus, BarChart3, QrCode, Nfc, Settings, Search, Globe, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WsDict } from "@/i18n/workspace";

export type CompanySection = {
  /** Path suffix appended to /co/$slug */
  path: string;
  icon: LucideIcon;
  label: (w: WsDict) => string;
  group: "manage" | "identity" | "reach" | "admin";
};

export const COMPANY_SECTIONS: CompanySection[] = [
  { path: "", icon: LayoutDashboard, label: (w) => w.overview, group: "manage" },
  { path: "/card", icon: IdCard, label: (w) => w.companyCard, group: "manage" },
  { path: "/employees", icon: Users, label: (w) => w.employees, group: "manage" },
  { path: "/departments", icon: Building, label: (w) => w.departments, group: "manage" },
  { path: "/invitations", icon: MailPlus, label: (w) => w.invite, group: "manage" },

  { path: "/brand", icon: Palette, label: (w) => w.brand, group: "identity" },
  { path: "/templates", icon: LayoutTemplate, label: (w) => w.templates, group: "identity" },
  { path: "/media", icon: Images, label: (w) => w.mediaLibrary, group: "identity" },

  { path: "/analytics", icon: BarChart3, label: (w) => w.analytics, group: "reach" },
  { path: "/qr", icon: QrCode, label: (w) => w.qrManager, group: "reach" },
  { path: "/nfc", icon: Nfc, label: (w) => w.nfcManager, group: "reach" },
  { path: "/page", icon: Globe, label: (w) => w.publicPage, group: "reach" },
  { path: "/seo", icon: Search, label: (w) => w.seo, group: "reach" },

  { path: "/permissions", icon: ShieldCheck, label: (w) => w.permissions, group: "admin" },
  { path: "/settings", icon: Settings, label: (w) => w.settings, group: "admin" },
];

export const COMPANY_GROUP_LABEL: Record<CompanySection["group"], (w: WsDict) => string> = {
  manage: (w) => w.groupManage,
  identity: (w) => w.groupIdentity,
  reach: (w) => w.groupReach,
  admin: (w) => w.groupAdmin,
};
