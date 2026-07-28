import { useState } from "react";
import { Check, IdCard, Image as ImageIcon, Share2, X } from "lucide-react";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { accountQueryKey } from "@/lib/account";

type Card = {
  id: string;
  slug: string;
  avatar_url?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  is_published?: boolean | null;
  view_count?: number | null;
};

const COPY = {
  ar: {
    title: "ابدأ خلال ٣ خطوات",
    subtitle: "أكمل هذه الخطوات لتصبح بطاقتك جاهزة للمشاركة.",
    steps: [
      { t: "أنشئ بطاقتك الأولى", d: "اختر تصميمًا وأدخل بياناتك." },
      { t: "أضف صورتك وبيانات التواصل", d: "صورة + هاتف أو بريد إلكتروني." },
      { t: "شارك بطاقتك", d: "انشر البطاقة وشاركها برابط أو QR." },
    ],
    cta: ["إنشاء بطاقة", "إكمال البيانات", "مشاركة"],
    dismiss: "إخفاء",
    done: "كل شيء جاهز 🎉",
  },
  en: {
    title: "Get started in 3 steps",
    subtitle: "Finish these steps to make your card shareable.",
    steps: [
      { t: "Create your first card", d: "Pick a design and add your details." },
      { t: "Add a photo and contact info", d: "Photo + phone or email." },
      { t: "Share your card", d: "Publish it and share via link or QR." },
    ],
    cta: ["Create card", "Complete details", "Share"],
    dismiss: "Hide",
    done: "You're all set 🎉",
  },
};

export function OnboardingChecklist({ cards, userId }: { cards: Card[]; userId: string }) {
  const { lang } = useI18n();
  const qc = useQueryClient();
  const [hidden, setHidden] = useState(false);
  const c = lang === "ar" ? COPY.ar : COPY.en;

  const first = cards[0];
  const hasCard = !!first;
  const hasDetails =
    !!first?.avatar_url && !!(first?.phone || first?.email || first?.whatsapp);
  const shared = !!first?.is_published && (first?.view_count ?? 0) > 0;

  const done = [hasCard, hasDetails, shared];
  if (hidden || done.every(Boolean)) return null;

  async function dismiss() {
    setHidden(true);
    await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", userId);
    void qc.invalidateQueries({ queryKey: accountQueryKey });
  }

  const icons = [IdCard, ImageIcon, Share2];
  const links: { to: any; params?: any }[] = [
    { to: "/cards/new" },
    first ? { to: "/cards/$id", params: { id: first.id } } : { to: "/cards/new" },
    first ? { to: "/c/$slug", params: { slug: first.slug } } : { to: "/cards/new" },
  ];

  return (
    <section className="glass mt-6 rounded-3xl border border-border/40 p-4 lg:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{c.title}</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{c.subtitle}</p>
        </div>
        <button
          onClick={() => void dismiss()}
          aria-label={c.dismiss}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ol className="grid gap-2 sm:grid-cols-3">
        {c.steps.map((s, i) => {
          const Icon = icons[i];
          const isDone = done[i];
          const enabled = !isDone && (i === 0 || hasCard);
          const body = (
            <div
              className={
                "flex h-full items-start gap-3 rounded-2xl border p-3 transition " +
                (isDone
                  ? "border-primary/30 bg-primary/5"
                  : enabled
                    ? "border-border/50 hover:border-primary/40"
                    : "border-border/30 opacity-60")
              }
            >
              <div
                className={
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl " +
                  (isDone ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground/70")
                }
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-tight">{s.t}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{s.d}</p>
                {enabled && (
                  <span className="mt-1 inline-block text-[11px] font-semibold text-primary">{c.cta[i]}</span>
                )}
              </div>
            </div>
          );
          return (
            <li key={s.t}>
              {enabled ? (
                <Link {...(links[i] as any)} className="block h-full">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
