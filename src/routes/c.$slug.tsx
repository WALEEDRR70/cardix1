import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardPreview } from "@/components/CardPreview";
import { Download, QrCode as QrIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Cardix` },
      { name: "description", content: "A digital business card on Cardix." },
      { property: "og:title", content: `${params.slug} — Cardix` },
      { property: "og:description", content: "Digital business card by Cardix." },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: PublicCard,
  errorComponent: () => <NotFoundView />,
  notFoundComponent: () => <NotFoundView />,
});

function NotFoundView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Card not found.</p>
    </div>
  );
}

function PublicCard() {
  const { slug } = Route.useParams();

  const { data: card } = useQuery({
    queryKey: ["public-card", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  useEffect(() => {
    if (!card) return;
    supabase.from("card_events").insert({ card_id: card.id, event_type: "view" });
    supabase.rpc; // noop guard
  }, [card]);

  if (!card) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;

  function vcard() {
    const vcf = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${card!.name}`,
      card!.title && `TITLE:${card!.title}`,
      card!.company && `ORG:${card!.company}`,
      card!.phone && `TEL;TYPE=CELL:${card!.phone}`,
      card!.email && `EMAIL:${card!.email}`,
      card!.website && `URL:${card!.website}`,
      card!.address && `ADR:;;${card!.address};;;;`,
      "END:VCARD",
    ].filter(Boolean).join("\n");
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${card!.slug}.vcf`; a.click();
    URL.revokeObjectURL(url);
  }

  const publicUrl = typeof window !== "undefined" ? window.location.href : `/c/${slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted px-4 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <CardPreview card={card} />

        <div className="flex w-full max-w-md flex-col gap-3">
          <button onClick={vcard} className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Download className="h-4 w-4" /> Save contact
          </button>

          <details className="rounded-2xl border border-border bg-card p-4">
            <summary className="flex cursor-pointer items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrIcon className="h-4 w-4" /> Show QR
            </summary>
            <div className="mt-4 flex justify-center rounded-xl bg-white p-4">
              <QRCodeSVG value={publicUrl} size={200} fgColor="#111" bgColor="#fff" />
            </div>
          </details>
        </div>

        <a href="/" className="mt-4 text-xs text-muted-foreground hover:text-foreground">
          Powered by Cardix
        </a>
      </div>
    </div>
  );
}
