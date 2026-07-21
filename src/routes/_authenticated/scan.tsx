import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Upload, Loader2, Save, RefreshCw, QrCode } from "lucide-react";
import { scanBusinessCard } from "@/lib/ocr.functions";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { QrScanner } from "@/components/QrScanner";


export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({
    meta: [
      { title: "Scan a card — Cardix" },
      { name: "description", content: "Scan any paper business card. Cardix AI extracts contacts in seconds." },
      { property: "og:title", content: "Scan a card — Cardix" },
      { property: "og:description", content: "AI-powered paper business card scanner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

type Extracted = Awaited<ReturnType<typeof scanBusinessCard>>;

function ScanPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const scan = useServerFn(scanBusinessCard);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Extracted | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrBusy, setQrBusy] = useState(false);

  async function handleQrDetect(text: string) {
    setQrBusy(true);
    try {
      // Extract slug: accept full URLs (…/c/<slug>) or bare slug
      let slug: string | null = null;
      try {
        const u = new URL(text);
        const m = u.pathname.match(/\/c\/([^/?#]+)/);
        if (m) slug = decodeURIComponent(m[1]);
      } catch {
        const m = text.match(/\/c\/([^/?#]+)/) ?? text.match(/^([a-zA-Z0-9_-]{2,64})$/);
        if (m) slug = m[1];
      }
      if (!slug) {
        toast.error(t.invalidQr);
        return;
      }
      const { data: card, error } = await supabase
        .from("cards")
        .select("id,user_id,slug,name,title,company,phone,whatsapp,email,website,address,bio,avatar_url")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error || !card) {
        toast.error(t.invalidQr);
        return;
      }
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      if (u.user.id === card.user_id) {
        toast.info(t.ownCard);
        nav({ to: "/c/$slug", params: { slug } });
        return;
      }
      const { data: existing } = await supabase
        .from("saved_cards")
        .select("id")
        .eq("user_id", u.user.id)
        .eq("card_id", card.id)
        .maybeSingle();
      if (existing) {
        toast.info(t.alreadySaved);
        nav({ to: "/vault" });
        return;
      }
      const { error: insErr } = await supabase.from("saved_cards").insert({
        user_id: u.user.id,
        card_id: card.id,
        source: "qr",
        name: card.name,
        title: card.title,
        company: card.company,
        phone: card.phone,
        whatsapp: card.whatsapp,
        email: card.email,
        website: card.website,
        address: card.address,
        bio: card.bio,
        avatar_url: card.avatar_url,
      });
      if (insErr) {
        toast.error(insErr.message);
        return;
      }
      // log analytics event (best-effort)
      supabase.from("card_events").insert({ card_id: card.id, kind: "save" }).then(() => {});
      toast.success(t.savedToVault);
      nav({ to: "/vault" });
    } finally {
      setQrBusy(false);
      setQrOpen(false);
    }
  }



  async function handleFile(f: File) {
    const reader = new FileReader();
    const dataUrl: string = await new Promise((res, rej) => {
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(reader.error);
      reader.readAsDataURL(f);
    });
    setImgUrl(dataUrl);
    setData(null);
    setBusy(true);
    try {
      const out = await scan({ data: { imageDataUrl: dataUrl } });
      if (!out.name) toast.error(t.scanFailed);
      else setData(out);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t.scanFailed);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("saved_cards").insert({
      user_id: u.user.id,
      source: "scan",
      name: data.name || "Unknown",
      title: data.title ?? null,
      company: data.company ?? null,
      phone: data.phone ?? null,
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      address: data.address ?? null,
      bio: data.bio ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t.savedToVault);
    nav({ to: "/vault" });
  }

  function reset() { setImgUrl(null); setData(null); }

  return (
    <MobileShell topBar={<PageHeader title={t.scanCard} subtitle={t.scanCardDesc} />}>
      <div className="px-4 lg:px-8">
        {!imgUrl ? (
          <div className="mt-2 grid gap-3 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
            <div className="glass relative grid aspect-[4/5] w-full place-items-center overflow-hidden rounded-3xl border border-dashed border-border/60 lg:aspect-[4/3]">
              {/* Corner scan brackets */}
              <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-accent/70 rounded-tl-lg" />
              <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-accent/70 rounded-tr-lg" />
              <span className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-accent/70 rounded-bl-lg" />
              <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-accent/70 rounded-br-lg" />
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-accent-foreground shadow-glow lg:h-20 lg:w-20" style={{ background: "var(--gradient-gold)" }}>
                  <Camera className="h-6 w-6 lg:h-9 lg:w-9" />
                </div>
                <p className="mt-3 max-w-[220px] text-xs text-muted-foreground lg:text-sm">Position the card inside the frame.</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 lg:mt-0 lg:space-y-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow lg:py-4"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Camera className="h-4 w-4 lg:h-5 lg:w-5" /> {t.takePhoto}
              </button>
              <button
                onClick={() => uploadRef.current?.click()}
                className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium lg:py-3.5"
              >
                <Upload className="h-4 w-4" /> {t.uploadImage}
              </button>
              <p className="hidden pt-2 text-xs text-muted-foreground lg:block">
                {t.scanCardDesc}
              </p>
            </div>
          </div>

        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-black">
              <img src={imgUrl} alt="Scanned" className="max-h-[420px] w-full object-contain lg:max-h-[520px]" />
              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">{t.scanning}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {data && !busy && (
                <div className="glass space-y-1 rounded-3xl p-5">
                  <p className="text-lg font-semibold">{data.name || "Unknown"}</p>
                  {data.title && <p className="text-xs text-muted-foreground">{data.title}</p>}
                  {data.company && <p className="text-xs text-muted-foreground">{data.company}</p>}
                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    {data.phone && <p>📞 {data.phone}</p>}
                    {data.email && <p>✉️ {data.email}</p>}
                    {data.website && <p>🌐 {data.website}</p>}
                    {data.address && <p>📍 {data.address}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={reset}
                  className="glass flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
                <button
                  onClick={save}
                  disabled={!data || saving}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-60"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <Save className="h-4 w-4" /> {saving ? "…" : t.saveToVault}
                </button>
              </div>
            </div>
          </div>
        )}


        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    </MobileShell>
  );
}
