import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { cancelMySubscription, getMyBilling } from "@/lib/billing.functions";
import { Link } from "@/lib/nav";
import { tx } from "@/lib/tx";

function fmtDate(v: string | null, ar: boolean) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString(tx("en"), { year: "numeric", month: "short", day: "numeric" });
}

export function SubscriptionCard({ ar }: { ar: boolean }) {
  const load = useServerFn(getMyBilling);
  const cancel = useServerFn(cancelMySubscription);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-billing"],
    queryFn: () => load({}),
  });

  const cancelling = useMutation({
    mutationFn: (id: string) => cancel({ data: { subscriptionId: id } }),
    onSuccess: () => {
      toast.success(tx("Subscription cancelled"));
      qc.invalidateQueries({ queryKey: ["my-billing"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = (data as any)?.active ?? null;

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        {tx("Subscription")}
      </div>

      {isLoading ? (
        <Loader2 className="mt-4 h-4 w-4 animate-spin text-muted-foreground" />
      ) : active ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold">
              {ar ? active.plan?.name_ar ?? "باقة" : active.plan?.name_en ?? "Plan"}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
              {active.status === "active" ? (tx("Active")) : active.status}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {tx("Renews on")}: {fmtDate(active.current_period_end, ar)}
          </p>
          <button
            onClick={() => cancelling.mutate(active.paypal_subscription_id)}
            disabled={cancelling.isPending}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-destructive disabled:opacity-60"
          >
            {cancelling.isPending ? (tx("Cancelling…")) : tx("Cancel subscription")}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            {tx("You are currently on the Free plan.")}
          </p>
          <Link
            to="/pricing"
            className="inline-flex rounded-full px-4 py-2 text-xs font-semibold text-accent-foreground"
            style={{ background: "var(--gradient-gold)" }}
          >
            {tx("Upgrade plan")}
          </Link>
        </div>
      )}
    </div>
  );
}
