import { useState } from "react";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/config";

function esc(v: string) {
  return v.replace(/[\\;,\n]/g, (c) => ({ "\\": "\\\\", ";": "\\;", ",": "\\,", "\n": "\\n" }[c]!));
}

export function VCardGeneratorTool({ lang }: { lang: Locale }) {
  const isAr = lang === "ar";
  const [f, setF] = useState({
    firstName: "", lastName: "", org: "", title: "",
    phone: "", email: "", url: "", street: "", city: "", country: "",
  });

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const build = () => {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(f.lastName)};${esc(f.firstName)};;;`,
      `FN:${esc(`${f.firstName} ${f.lastName}`.trim())}`,
    ];
    if (f.org) lines.push(`ORG:${esc(f.org)}`);
    if (f.title) lines.push(`TITLE:${esc(f.title)}`);
    if (f.phone) lines.push(`TEL;TYPE=CELL:${esc(f.phone)}`);
    if (f.email) lines.push(`EMAIL:${esc(f.email)}`);
    if (f.url) lines.push(`URL:${esc(f.url)}`);
    if (f.street || f.city || f.country) lines.push(`ADR:;;${esc(f.street)};${esc(f.city)};;;${esc(f.country)}`);
    lines.push("END:VCARD");
    return lines.join("\n");
  };

  const download = () => {
    const blob = new Blob([build()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(f.firstName || "contact").toLowerCase()}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const L = isAr
    ? { first: "الاسم الأول", last: "اسم العائلة", org: "الشركة", title: "المسمى الوظيفي", phone: "الهاتف", email: "البريد", url: "الموقع", street: "الشارع", city: "المدينة", country: "الدولة", dl: "تنزيل .vcf" }
    : { first: "First name", last: "Last name", org: "Company", title: "Job title", phone: "Phone", email: "Email", url: "Website", street: "Street", city: "City", country: "Country", dl: "Download .vcf" };

  const field = (label: string, k: keyof typeof f, type = "text") => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={f[k]} onChange={upd(k)} className="mt-2 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {field(L.first, "firstName")}
        {field(L.last, "lastName")}
        {field(L.org, "org")}
        {field(L.title, "title")}
        {field(L.phone, "phone", "tel")}
        {field(L.email, "email", "email")}
        {field(L.url, "url", "url")}
        {field(L.street, "street")}
        {field(L.city, "city")}
        {field(L.country, "country")}
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={download}
          disabled={!f.firstName && !f.lastName}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow disabled:opacity-50"
        >
          <Download className="size-4" /> {L.dl}
        </button>
      </div>
    </div>
  );
}
