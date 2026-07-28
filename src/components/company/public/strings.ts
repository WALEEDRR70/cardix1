// Copy for the public company landing page. Kept local so the workspace
// dictionary stays focused on the authenticated app.
export type PublicLocale = "ar" | "en";

const en = {
  saveContact: "Save contact",
  whatsapp: "WhatsApp",
  call: "Call",
  email: "Email",
  website: "Website",
  share: "Share",
  linkCopied: "Link copied",
  more: "More",
  less: "Less",
  verified: "Verified",
  founded: "Founded",
  branchesCount: (n: number) => (n === 1 ? "1 branch" : `${n} branches`),
  teamCount: (n: number) => (n === 1 ? "1 team member" : `${n} team members`),
  services: "Our services",
  allServices: "All services",
  requestService: "Request",
  team: "Our team",
  fullTeam: "View full team",
  branches: "Branches",
  directions: "Directions",
  scanTitle: "Scan to open this page",
  scanDesc: "Share the company profile instantly.",
  copyLink: "Copy link",
  getInTouch: "Get in touch",
};

const ar: typeof en = {
  saveContact: "حفظ جهة الاتصال",
  whatsapp: "واتساب",
  call: "اتصال",
  email: "بريد",
  website: "الموقع",
  share: "مشاركة",
  linkCopied: "تم نسخ الرابط",
  more: "المزيد",
  less: "أقل",
  verified: "موثّقة",
  founded: "التأسيس",
  branchesCount: (n: number) => (n === 1 ? "فرع واحد" : `${n} فروع`),
  teamCount: (n: number) => (n === 1 ? "موظف واحد" : `${n} موظفين`),
  services: "خدماتنا",
  allServices: "كل الخدمات",
  requestService: "اطلب الخدمة",
  team: "فريقنا",
  fullTeam: "عرض الفريق كاملًا",
  branches: "الفروع",
  directions: "الاتجاهات",
  scanTitle: "امسح الرمز لفتح الصفحة",
  scanDesc: "شارك ملف الشركة فورًا.",
  copyLink: "نسخ الرابط",
  getInTouch: "تواصل معنا",
};

export function publicDict(locale: PublicLocale) {
  return locale === "ar" ? ar : en;
}
