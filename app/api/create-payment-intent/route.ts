import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { orders, paymentIntentAttempts } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getServerConfig } from "@/lib/config.server";

const RATE_LIMIT = 10;
const RATE_WINDOW_MINUTES = 5;

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

  const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000);
  const recentAttempts = await db
    .select()
    .from(paymentIntentAttempts)
    .where(
      and(
        eq(paymentIntentAttempts.ipAddress, ip),
        gte(paymentIntentAttempts.attemptedAt, windowStart),
      ),
    );

  if (recentAttempts.length >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  await db.insert(paymentIntentAttempts).values({ id: nanoid(), ipAddress: ip });

  try {
    const { orderId } = await request.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not in pending status" }, { status: 400 });
    }

    const config = getServerConfig();
    if (!config.stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: "2026-05-27.dahlia",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.amountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order.id },
    });

    await db
      .update(orders)
      .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[create-payment-intent]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
