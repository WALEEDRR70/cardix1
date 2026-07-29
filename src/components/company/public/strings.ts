// Copy for the public company landing page. Localised through the shared
// phrase table so every supported locale is covered, not just Arabic/English.
import { tx } from "@/lib/tx";

export type PublicLocale = string;

export function publicDict(locale: PublicLocale) {
  const p = (en: string) => tx(en, locale);
  return {
    saveContact: p("Save contact"),
    whatsapp: p("WhatsApp"),
    call: p("Call"),
    email: p("Email"),
    website: p("Website"),
    share: p("Share"),
    linkCopied: p("Link copied"),
    more: p("More"),
    less: p("Less"),
    verified: p("Verified"),
    founded: p("Founded"),
    branchesCount: (n: number) => (n === 1 ? p("1 branch") : p("{n} branches").replace("{n}", String(n))),
    teamCount: (n: number) => (n === 1 ? p("1 team member") : p("{n} team members").replace("{n}", String(n))),
    services: p("Our services"),
    allServices: p("All services"),
    requestService: p("Request"),
    team: p("Our team"),
    fullTeam: p("View full team"),
    branches: p("Branches"),
    directions: p("Directions"),
    scanTitle: p("Scan to open this page"),
    scanDesc: p("Share the company profile instantly."),
    copyLink: p("Copy link"),
    getInTouch: p("Get in touch"),
  };
}
