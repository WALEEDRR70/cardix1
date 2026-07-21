import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Camera, Upload, Loader2, Save } from "lucide-react";
import { scanBusinessCard } from "@/lib/ocr.functions";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { CardPreview } from "@/components/CardPreview";

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
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Extracted | null>(null);

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
      if (!out.name) {
        toast.error(t.scanFailed);
      } else {
        setData(out);
      }
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t.dashboard}
          </Link>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-2">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">{t.scanCard}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.scanCardDesc}</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => camRef.current?.click()}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Camera className="h-4 w-4" /> {t.takePhoto}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Upload className="h-4 w-4" /> {t.uploadImage}
            </button>
          </div>

          <input
            ref={camRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {imgUrl && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="Scanned card" className="max-h-80 w-full object-contain" />
            </div>
          )}

          {busy && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t.scanning}
            </div>
          )}
        </section>

        <section>
          {data ? (
            <div className="space-y-4">
              <CardPreview card={{ ...data, name: data.name || "Unknown", accent_color: "#D4AF37" }} />
              <button
                onClick={save}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "…" : t.saveToVault}
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {t.scanCardDesc}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
