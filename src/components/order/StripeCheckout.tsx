"use client";

import { useState, useMemo, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";

export function StripePaymentSection({
  orderId,
  amount,
  packageId,
}: {
  orderId: string;
  amount: number;
  packageId: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stripePromise = useMemo(() => getStripe(), []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setClientSecret(null);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) {
          if (res.error) setError(res.error);
          else setClientSecret(res.clientSecret);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Secure payment</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Encrypted via Stripe
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">All major cards · Apple Pay · Google Pay</p>

      {error && (
        <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!clientSecret && !error && (
        <div className="mt-8 flex flex-col items-center gap-3 py-10 text-muted-foreground">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary/60">
            <Loader2 className="h-6 w-6 animate-spin text-brass" />
          </div>
          <p className="text-sm">Preparing secure checkout…</p>
        </div>
      )}

      {clientSecret && (
        <div className="min-w-0">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#1a2236",
                  colorBackground: "#ffffff",
                  colorText: "#1a2236",
                  colorDanger: "#dc2626",
                  fontFamily: "Inter, system-ui, sans-serif",
                  borderRadius: "12px",
                  spacingUnit: "4px",
                },
                rules: {
                  ".Input": {
                    border: "1px solid #e2e8f0",
                    padding: "12px",
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  ".Input:focus": {
                    borderColor: "#1a2236",
                    boxShadow: "0 0 0 1px #1a2236",
                  },
                  ".Label": {
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#6b7280",
                    fontWeight: "500",
                  },
                  ".Tab": {
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "12px",
                  },
                  ".Tab--selected": {
                    borderColor: "#1a2236",
                    boxShadow: "0 0 0 1px #1a2236",
                  },
                },
              },
            }}
          >
            <PaymentForm amount={amount} packageId={packageId} />
          </Elements>
        </div>
      )}
    </section>
  );
}

function PaymentForm({ amount, packageId }: { amount: number; packageId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success?package=${packageId}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed");
        setProcessing(false);
      } else if (result.paymentIntent?.status === "succeeded") {
        window.location.href = `/order/success?package=${packageId}&payment_intent=${result.paymentIntent.id}`;
      } else if (result.paymentIntent?.status === "processing") {
        window.location.href = `/order/pending?package=${packageId}`;
      } else {
        setProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed unexpectedly");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-6">
        <PaymentElement
          options={{
            defaultValues: {
              billingDetails: {
                address: { country: "US" },
              },
            },
            fields: {
              billingDetails: {
                address: { country: "never" },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="brass"
        size="lg"
        className="mt-6 w-full rounded-xl shadow-[0_4px_14px_-6px_oklch(0.76_0.12_80/0.4)]"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          <>
            Pay ${amount.toLocaleString()} <Lock className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
