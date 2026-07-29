import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, ClipboardList } from "lucide-react";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { PACKAGES } from "@/lib/site";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function OrderCheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
  if (!order) notFound();

  if (order.status === "paid") redirect(`/order/status/${token}`);
  if (!order.questionnaireCompleted) redirect(`/order/questionnaire/${token}`);

  const pkg = PACKAGES.find((p) => p.id === order.packageTier);

  let existingSignature = "";
  try {
    const wizardData = JSON.parse(order.orderData) || {};
    if (typeof wizardData.signature === "string") existingSignature = wizardData.signature;
  } catch {
    /* ignore */
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <SiteHeader />
      <div className="px-4 pt-24 pb-32 md:px-8 md:pt-36 md:pb-40">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">Sign &amp; pay</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Last step — sign to authorize your report, then complete payment.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <Link
                href={`/order/edit/${token}`}
                className="inline-flex items-center gap-1.5 text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
              >
                <Pencil className="h-3 w-3" /> Edit basic info
              </Link>
              <Link
                href={`/order/questionnaire/${token}`}
                className="inline-flex items-center gap-1.5 text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
              >
                <ClipboardList className="h-3 w-3" /> Edit questionnaire answers
              </Link>
            </div>
          </div>
          <CheckoutClient
            token={token}
            orderId={order.id}
            amountCents={order.amountCents}
            packageId={order.packageTier}
            packageName={pkg?.name ?? order.packageTier}
            delivery={pkg?.delivery ?? ""}
            initialSignature={existingSignature}
          />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
