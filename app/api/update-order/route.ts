import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { calculateAmountCents, type PackageTier } from "@/lib/pricing";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateOrderSchema = z.object({
  token: z.string().min(1),
  wizardData: z.record(z.unknown()).optional(),
  customerName: z.string().min(1).max(200).optional(),
  customerEmail: z.string().email().optional(),
  packageTier: z.enum(["basic", "premium", "verified"]).optional(),
  rushRequested: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = UpdateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { token, wizardData, customerName, customerEmail, packageTier, rushRequested } =
      parsed.data;

    const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "This order can no longer be edited" }, { status: 400 });
    }

    let existing: Record<string, unknown> = {};
    try {
      existing = JSON.parse(order.orderData) || {};
    } catch {
      existing = {};
    }

    const nextTier = (packageTier ?? order.packageTier) as PackageTier;
    const nextRush = rushRequested ?? order.rushRequested;

    await db
      .update(orders)
      .set({
        orderData: wizardData ? JSON.stringify({ ...existing, ...wizardData }) : order.orderData,
        customerName: customerName ?? order.customerName,
        customerEmail: customerEmail ?? order.customerEmail,
        packageTier: nextTier,
        rushRequested: nextRush,
        amountCents: calculateAmountCents(nextTier, nextRush),
        updatedAt: new Date(),
      })
      .where(eq(orders.accessToken, token));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[update-order]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
