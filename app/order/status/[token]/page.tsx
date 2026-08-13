import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/storage";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import QuestionnaireWizard from "@/components/ui/QuestionnaireWizard";
import { CheckCircle2, Clock, FileDown, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
  if (!order) notFound();

  const downloadUrl = order.reportFileKey ? await getSignedDownloadUrl(order.reportFileKey) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <SiteHeader />
      <div className="container-x pt-24 pb-32 md:pt-36 md:pb-40">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">Order Status</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your property report details and submit verification disclosures.
            </p>
          </div>

          {(order.status === "paid" || order.status === "in_progress") && (
            <div className="mt-8">
              <div className="mb-6 flex justify-end">
                <a
                  href={`/api/receipt?token=${encodeURIComponent(order.accessToken)}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-secondary/50"
                >
                  <FileDown className="h-4 w-4" /> Download Receipt (PDF)
                </a>
              </div>
              <QuestionnaireWizard order={order} />
            </div>
          )}

          {order.status === "delivered" && (
            <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant md:p-14">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-500/10">
                <CheckCircle2 className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 font-display text-3xl text-ink">Your report is ready!</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Your custom property report has been prepared by our analysts. You can download the
                PDF below.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream hover:bg-ink-soft transition-all rounded-xl font-medium shadow-md"
                  >
                    <FileDown className="h-5 w-5" /> Download PDF Report
                  </a>
                )}
                <a
                  href={`/api/receipt?token=${encodeURIComponent(order.accessToken)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-ink transition hover:bg-secondary/50"
                >
                  <FileDown className="h-5 w-5" /> Download Receipt
                </a>
              </div>
            </div>
          )}

          {order.status === "pending" && (
            <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant md:p-14">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brass/10">
                <Clock className="h-10 w-10 text-brass" strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 font-display text-3xl text-brass">Payment Processing</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We are waiting for payment confirmation from Stripe. As soon as it clears, your
                property questionnaire will become available here.
              </p>
            </div>
          )}

          {order.status !== "pending" &&
            order.status !== "paid" &&
            order.status !== "in_progress" &&
            order.status !== "delivered" && (
              <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant md:p-14">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={1.5} />
                </div>
                <h2 className="mt-6 font-display text-3xl text-destructive">
                  Order Status: {order.status}
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  There is an issue or update on this order. Please reach out to customer support at
                  support@accuratehomereport.com.
                </p>
              </div>
            )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
