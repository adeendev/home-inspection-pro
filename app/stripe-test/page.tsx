"use client";

import { useState } from "react";
import { StripePaymentSection } from "@/components/order/StripeCheckout";

export default function StripeTestPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startTest() {
    setLoading(true);
    setError(null);
    setOrderId(null);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageTier: "basic",
          rushRequested: false,
          customerEmail: "test@example.com",
          customerName: "Test User",
          wizardData: {
            address: "123 Test St",
            city: "Austin",
            state: "TX",
            zip: "78701",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create test order");
        return;
      }

      setOrderId(data.orderId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 text-3xl font-semibold">Stripe Payment Test</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Click below to spin up a test order and load the real Stripe payment form. Use test card{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded">4242 4242 4242 4242</code>, any future
          expiry, any CVC.
        </p>

        {!orderId && (
          <button
            onClick={startTest}
            disabled={loading}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {loading ? "Creating test order…" : "Start Payment Test"}
          </button>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {orderId && (
          <div className="mt-8 rounded-2xl border p-6">
            <StripePaymentSection orderId={orderId} amount={399} packageId="basic" />
          </div>
        )}
      </div>
    </div>
  );
}
