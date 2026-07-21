import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
  if (!order) notFound();

  const downloadUrl = order.reportFileKey ? await getSignedDownloadUrl(order.reportFileKey) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg p-8 border rounded-lg">
        <h1 className="text-xl font-semibold mb-2 font-[family-name:var(--font-display)]">
          Order {order.id}
        </h1>
        <p className="text-sm text-muted-foreground mb-1">
          {order.customerName} — {order.customerEmail}
        </p>
        <p className="capitalize mb-4">
          Status:{" "}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              order.status === "paid"
                ? "bg-green-100 text-green-700"
                : order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "delivered"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mb-4 capitalize">
          Package: {order.packageTier}
          {order.rushRequested ? " (rush)" : ""}
        </p>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="inline-block px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium"
          >
            Download your report
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your report isn&apos;t ready yet — we&apos;ll email you when it is.
          </p>
        )}
      </div>
    </div>
  );
}
