import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import EditBasicInfoClient from "./EditBasicInfoClient";

export const dynamic = "force-dynamic";

export default async function OrderEditPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
  if (!order) notFound();

  if (order.status !== "pending") redirect(`/order/status/${token}`);

  let wizardData: Record<string, unknown> = {};
  try {
    wizardData = JSON.parse(order.orderData) || {};
  } catch {
    wizardData = {};
  }

  const [firstName, ...rest] = order.customerName.split(" ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
      <SiteHeader />
      <div className="px-4 pt-24 pb-32 md:px-8 md:pt-36 md:pb-40">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">Edit basic info</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your details, property, schedule, or package — then head back to checkout.
            </p>
          </div>
          <EditBasicInfoClient
            token={token}
            initial={{
              firstName: firstName || "",
              lastName: rest.join(" "),
              email: order.customerEmail,
              phone: (wizardData.phone as string) || "",
              address: (wizardData.address as string) || "",
              address2: (wizardData.address2 as string) || "",
              city: (wizardData.city as string) || "",
              state: (wizardData.state as string) || "",
              zip: (wizardData.zip as string) || "",
              yearBuilt: (wizardData.yearBuilt as string) || "",
              sqft: (wizardData.sqft as string) || "",
              ownershipType: (wizardData.ownershipType as "owner" | "authorized" | "") || "",
              notes: (wizardData.notes as string) || "",
              packageId: order.packageTier as "basic" | "premium" | "verified",
              preferredDate: (wizardData.preferredDate as string) || "",
              preferredWindow:
                (wizardData.preferredWindow as "morning" | "afternoon" | "either") || "either",
              rush: order.rushRequested,
            }}
          />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
