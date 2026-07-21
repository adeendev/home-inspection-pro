import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerConfig } from "@/lib/config.server";

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 10, windowMs = 300_000) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

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
