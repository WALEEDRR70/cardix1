import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { finalizeCheckout } from "@/lib/billing.functions";
import { getPreferredLocale } from "@/lib/locale-routing";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/billing/return")({
  head: () => ({
    meta: [
      { title: "Payment status — Cardixn" },
      { name: "description", content: "Confirming your Cardixn payment with PayPal." },
      { property: "og:title", content: "Payment status — Cardixn" },
      { property: "og:description", content: "Confirming your Cardixn payment with PayPal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BillingReturn,
});

function BillingReturn() {
  const ar = getPreferredLocale() === "ar";
  const nav = useNavigate();
  const finalize = useServerFn(finalizeCheckout);
  const [state, setState] = useState<"loading" | "done" | "error" | "cancel">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const type = q.get("type");
    const orderId = q.get("token");
    const subscriptionId = q.get("subscription_id");

    if (type === "cancel") {
      setState("cancel");
      return;
    }
    finalize({ data: subscriptionId ? { subscriptionId } : { orderId: orderId ?? undefined } })
      .then((r: { status: string }) => {
        setState(r.status === "COMPLETED" || r.status === "ACTIVE" ? "done" : "error");
        setMessage(r.status);
      })
      .catch((e: Error) => {
        setState("error");
        setMessage(e.message);
      });
  }, [finalize]);

  return (
    <main className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div className="glass w-full max-w-md space-y-4 rounded-3xl border border-border/60 p-8">
        {state === "loading" && <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}
        {state === "done" && <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />}
        {(state === "error" || state === "cancel") && <XCircle className="mx-auto h-10 w-10 text-destructive" />}

        <h1 className="text-lg font-semibold">
          {state === "loading" && (tx("Confirming your payment…"))}
          {state === "done" && (tx("Payment successful"))}
          {state === "cancel" && (tx("Payment cancelled"))}
          {state === "error" && (tx("Could not confirm payment"))}
        </h1>
        {message && state === "error" && <p className="text-xs text-muted-foreground">{message}</p>}

        <button
          onClick={() => nav({ to: "/$lang/dashboard", params: { lang: ar ? "ar" : "en" } })}
          className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          {tx("Go to dashboard")}
        </button>
      </div>
    </main>
  );
}
