"use client";

import { useState } from "react";
import { PenLine, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/ui/signature-pad";
import { StripePaymentSection } from "@/components/order/StripeCheckout";
import { toast } from "sonner";

export default function CheckoutClient({
  token,
  orderId,
  amountCents,
  packageId,
  packageName,
  delivery,
  initialSignature,
}: {
  token: string;
  orderId: string;
  amountCents: number;
  packageId: string;
  packageName: string;
  delivery: string;
  initialSignature: string;
}) {
  const [signature, setSignature] = useState(initialSignature);
  const [consent, setConsent] = useState(!!initialSignature);
  const [confirmed, setConfirmed] = useState(!!initialSignature);
  const [saving, setSaving] = useState(false);
  const amount = amountCents / 100;

  const confirmSignature = async () => {
    if (!signature || !consent) {
      toast.error("Please sign and confirm to continue.");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          wizardData: { signature, signatureConsent: consent },
        }),
      });
      setConfirmed(true);
    } catch {
      toast.error("Failed to save your signature. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.04)] sm:p-6 md:p-10">
      <div className="rounded-2xl border border-border bg-secondary/20 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{packageName} Report</span>
          <span className="font-display text-xl text-ink">${amount.toLocaleString()}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Delivery: {delivery}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brass/10 text-brass">
            <PenLine className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-lg text-ink">Digital signature</h3>
            <p className="text-xs text-muted-foreground">
              Sign to authorize this order and confirm accuracy.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <SignaturePad value={signature} onChange={setSignature} height={140} />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-all hover:border-brass/40 hover:shadow-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[oklch(0.76_0.12_80)]"
          />
          <div className="flex-1 text-sm text-muted-foreground">
            I confirm that the information provided is accurate and I authorize Accurate Home Report
            to prepare this order. I understand that reports are non-refundable once preparation
            begins.
          </div>
        </label>

        {!confirmed && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={confirmSignature}
            disabled={saving || !signature || !consent}
            className="mt-4 w-full rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming…
              </>
            ) : (
              "Confirm signature"
            )}
          </Button>
        )}
      </div>

      {confirmed && (
        <div className="mt-6 max-w-full overflow-hidden">
          <StripePaymentSection orderId={orderId} amount={amount} packageId={packageId} />
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-3 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-brass" /> Encrypted · PCI-compliant
      </div>
    </div>
  );
}
