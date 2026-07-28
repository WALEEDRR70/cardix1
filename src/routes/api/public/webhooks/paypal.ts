import { createFileRoute } from "@tanstack/react-router";

/**
 * PayPal webhook receiver. We never trust the payload body: we take only the
 * resource id from it and re-fetch the authoritative state from PayPal's API
 * before writing anything to the database.
 */
export const Route = createFileRoute("/api/public/webhooks/paypal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const eventType: string = payload?.event_type ?? "";
        const resource = payload?.resource ?? {};

        try {
          const subscriptionId: string | undefined =
            eventType.startsWith("BILLING.SUBSCRIPTION.")
              ? resource.id
              : resource?.billing_agreement_id;

          if (subscriptionId) {
            const { syncSubscriptionState } = await import("@/lib/paypal.server");
            await syncSubscriptionState(subscriptionId);
            return new Response("ok");
          }

          if (eventType.startsWith("PAYMENT.CAPTURE.") && resource?.id) {
            const { paypalFetch } = await import("@/lib/paypal.server");
            const capture = await paypalFetch<{ status: string; supplementary_data?: any }>(
              `/v2/payments/captures/${resource.id}`,
            );
            const orderId = capture?.supplementary_data?.related_ids?.order_id;
            if (orderId) {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              await (supabaseAdmin as any)
                .from("billing_orders")
                .update({
                  status: capture.status === "COMPLETED" ? "paid" : String(capture.status).toLowerCase(),
                  raw: capture,
                })
                .eq("paypal_order_id", orderId);
            }
            return new Response("ok");
          }
        } catch (e) {
          console.error("PayPal webhook error", e);
          return new Response("error", { status: 500 });
        }

        return new Response("ignored");
      },
    },
  },
});
