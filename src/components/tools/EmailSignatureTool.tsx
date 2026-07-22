import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function EmailSignatureTool({ lang }: { lang: Locale }) {
  const isAr = lang === "ar";
  const [f, setF] = useState({
    name: "", title: "", company: "", phone: "", email: "", url: "", accent: "#7C34FF",
  });
  const [copied, setCopied] = useState<"html" | "rich" | null>(null);
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const html = `<table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;font-size:14px;line-height:1.5">
  <tr><td style="padding-bottom:6px"><strong style="font-size:16px;color:${f.accent}">${f.name || "Your Name"}</strong></td></tr>
  <tr><td style="padding-bottom:4px;color:#475569">${f.title || "Your Title"}${f.company ? " · " + f.company : ""}</td></tr>
  ${f.phone ? `<tr><td style="padding-bottom:2px">📱 <a href="tel:${f.phone}" style="color:#0f172a;text-decoration:none">${f.phone}</a></td></tr>` : ""}
  ${f.email ? `<tr><td style="padding-bottom:2px">✉️ <a href="mailto:${f.email}" style="color:#0f172a;text-decoration:none">${f.email}</a></td></tr>` : ""}
  ${f.url ? `<tr><td style="padding-bottom:2px">🌐 <a href="${f.url}" style="color:${f.accent};text-decoration:none">${f.url.replace(/^https?:\/\//, "")}</a></td></tr>` : ""}
</table>`;

  const copy = async (type: "html" | "rich") => {
    if (type === "html") {
      await navigator.clipboard.writeText(html);
    } else {
      // Rich copy for pasting directly into Gmail/Outlook composer
      const blob = new Blob([html], { type: "text/html" });
      const txt = new Blob([html.replace(/<[^>]+>/g, "")], { type: "text/plain" });
      try {
        await navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": txt })]);
      } catch { await navigator.clipboard.writeText(html); }
    }
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const L = isAr
    ? { name: "الاسم", title: "المسمى", company: "الشركة", phone: "الهاتف", email: "البريد", url: "الموقع", accent: "لون التمييز", preview: "معاينة", rich: "نسخ للصق في Gmail/Outlook", raw: "نسخ HTML الخام" }
    : { name: "Full name", title: "Job title", company: "Company", phone: "Phone", email: "Email", url: "Website", accent: "Accent color", preview: "Preview", rich: "Copy for Gmail/Outlook", raw: "Copy raw HTML" };

  const field = (label: string, k: keyof typeof f, type = "text") => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={f[k]} onChange={upd(k)} className="mt-2 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
    </label>
  );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        {field(L.name, "name")}
        {field(L.title, "title")}
        {field(L.company, "company")}
        {field(L.phone, "phone", "tel")}
        {field(L.email, "email", "email")}
        {field(L.url, "url", "url")}
        <label className="block">
          <span className="text-sm font-medium">{L.accent}</span>
          <input type="color" value={f.accent} onChange={upd("accent")} className="mt-2 h-11 w-full rounded-xl border border-border/60 bg-background/50" />
        </label>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium">{L.preview}</div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 min-h-[200px]" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="flex flex-wrap gap-3">
          <button onClick={() => copy("rich")} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/40 transition-shadow">
            {copied === "rich" ? <Check className="size-4" /> : <Copy className="size-4" />} {L.rich}
          </button>
          <button onClick={() => copy("html")} className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
            {copied === "html" ? <Check className="size-4" /> : <Copy className="size-4" />} {L.raw}
          </button>
        </div>
      </div>
    </div>
  );
}
