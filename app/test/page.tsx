"use client";

import { useState } from "react";

type LogEntry = {
  id: number;
  time: string;
  type: "info" | "success" | "error" | "warn";
  message: string;
  data?: Record<string, unknown>;
};

let logId = 0;

export default function TestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  function log(type: LogEntry["type"], message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      id: ++logId,
      time: new Date().toLocaleTimeString(),
      type,
      message,
      data,
    };
    setLogs((prev) => [...prev, entry]);
  }

  async function testCreateOrder() {
    setLoading(true);
    log("info", "Creating test order...");

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
        log("error", `Create order failed (${res.status})`, data);
        return;
      }

      log("success", `Order created: ${data.orderId}`, data);
      return data.orderId as string;
    } catch (err) {
      log("error", `Network error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function testCreatePaymentIntent(orderId: string) {
    log("info", `Creating PaymentIntent for order ${orderId}...`);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        log("error", `PaymentIntent failed (${res.status})`, data);
        return null;
      }

      log("success", "PaymentIntent created", {
        clientSecret: data.clientSecret?.slice(0, 20) + "...",
      });
      return data.clientSecret as string;
    } catch (err) {
      log("error", `Network error: ${(err as Error).message}`);
      return null;
    }
  }

  async function testFullFlow() {
    setLogs([]);
    log("info", "=== Full flow test started ===");

    const orderId = await testCreateOrder();
    if (!orderId) return;

    const clientSecret = await testCreatePaymentIntent(orderId);
    if (!clientSecret) return;

    log("success", "=== Flow test passed ===");
    log(
      "warn",
      "To complete payment: go to /order, fill the wizard, and use Stripe test card 4242 4242 4242 4242",
    );
  }

  function testValidation() {
    setLogs([]);
    log("info", "=== Validation test ===");

    fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageTier: "invalid" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          log("success", `Validation works — rejected invalid input: ${data.error}`);
        } else {
          log("error", "Validation failed — should have rejected", data);
        }
      })
      .catch((err) => log("error", err.message));

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "nonexistent-id" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          log("success", `Payment validation works — rejected bad order: ${data.error}`);
        } else {
          log("error", "Payment validation failed — should have rejected", data);
        }
      })
      .catch((err) => log("error", err.message));
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2 font-[family-name:var(--font-display)]">
          DB & Payment Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Tests the backend pipeline — database, orders, and Stripe payment intent creation.
        </p>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={testFullFlow}
            disabled={loading}
            className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium disabled:opacity-50"
          >
            Run Full Flow
          </button>
          <button
            onClick={testCreateOrder}
            disabled={loading}
            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
          >
            Create Order Only
          </button>
          <button
            onClick={testValidation}
            disabled={loading}
            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
          >
            Test Validation
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 border rounded-md text-sm font-medium text-muted-foreground"
          >
            Clear
          </button>
        </div>

        <div className="border rounded-lg bg-muted/30 p-4 font-mono text-sm max-h-[500px] overflow-y-auto">
          {logs.length === 0 && (
            <p className="text-muted-foreground">Click a button to run tests...</p>
          )}
          {logs.map((entry) => (
            <div key={entry.id} className="py-1 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground mr-2">{entry.time}</span>
              <span
                className={
                  entry.type === "success"
                    ? "text-green-600"
                    : entry.type === "error"
                      ? "text-red-500"
                      : entry.type === "warn"
                        ? "text-yellow-600"
                        : "text-foreground"
                }
              >
                [{entry.type.toUpperCase()}]
              </span>{" "}
              {entry.message}
              {entry.data != null && (
                <pre className="text-xs text-muted-foreground mt-1 pl-16">
                  {JSON.stringify(entry.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-display)]">
            Stripe Test Cards
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use these in the <code>/order</code> checkout flow with your Stripe test keys:
          </p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-4">
              <code className="font-mono bg-muted px-2 py-0.5 rounded">4242 4242 4242 4242</code>
              <span className="text-muted-foreground">Succeeds (Visa)</span>
            </div>
            <div className="flex items-center gap-4">
              <code className="font-mono bg-muted px-2 py-0.5 rounded">4000 0025 0000 3155</code>
              <span className="text-muted-foreground">Requires 3D authentication</span>
            </div>
            <div className="flex items-center gap-4">
              <code className="font-mono bg-muted px-2 py-0.5 rounded">4000 0000 0000 9995</code>
              <span className="text-muted-foreground">Declined (insufficient funds)</span>
            </div>
            <div className="flex items-center gap-4">
              <code className="font-mono bg-muted px-2 py-0.5 rounded">4000 0000 0000 0069</code>
              <span className="text-muted-foreground">Declined (expired card)</span>
            </div>
            <div className="flex items-center gap-4">
              <code className="font-mono bg-muted px-2 py-0.5 rounded">4000 0000 0000 0127</code>
              <span className="text-muted-foreground">Declined (incorrect CVC)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Any future expiry date, any 3-digit CVC. Full list at{" "}
            <a
              href="https://docs.stripe.com/testing#cards"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Stripe test cards docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
