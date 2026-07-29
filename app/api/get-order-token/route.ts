import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get("payment_intent");

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment_intent" }, { status: 400 });
    }

    const [order] = await db
      .select({ accessToken: orders.accessToken })
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ accessToken: order.accessToken });
  } catch (err) {
    console.error("[get-order-token]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
