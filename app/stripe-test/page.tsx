"use client";

import { useState } from "react";
import { StripePaymentSection } from "@/components/order/StripeCheckout";

export default function StripeTestPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function sendTestEmail() {
    setEmailSending(true);
    setEmailResult(null);

    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailResult({ ok: false, message: data.error ?? "Failed to send test email" });
        return;
      }

      setEmailResult({ ok: true, message: `Test email sent to ${testEmail}` });
    } catch (err) {
      setEmailResult({ ok: false, message: (err as Error).message });
    } finally {
      setEmailSending(false);
    }
  }

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

        <div className="mt-8 rounded-2xl border p-6">
          <h2 className="mb-1 text-lg font-semibold">Test Email Delivery</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your email and send a test message to confirm Resend is working.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-w-[240px] flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={sendTestEmail}
              disabled={emailSending || !testEmail}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {emailSending ? "Sending…" : "Send Test Email"}
            </button>
          </div>
          {emailResult && (
            <div
              className={`mt-4 rounded-md p-3 text-sm ${
                emailResult.ok
                  ? "bg-green-500/10 text-green-700"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {emailResult.message}
            </div>
          )}
        </div>

        {orderId && (
          <div className="mt-8 rounded-2xl border p-6">
            <StripePaymentSection orderId={orderId} amount={399} packageId="basic" />
          </div>
        )}
      </div>
    </div>
  );
}
