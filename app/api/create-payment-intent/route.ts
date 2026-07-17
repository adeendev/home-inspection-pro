import { NextResponse } from "next/server";
import Stripe from "stripe";
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

const VALID_AMOUNTS: Record<string, number> = {
  basic: 399,
  premium: 899,
  verified: 2500,
};

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
    const body = await request.json();
    const { amount, currency, packageId, packageName, customerEmail, customerName } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!packageId || !packageName) {
      return NextResponse.json({ error: "Missing package info" }, { status: 400 });
    }

    const expectedAmount = VALID_AMOUNTS[packageId];
    if (!expectedAmount) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }
    if (amount !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    const config = getServerConfig();
    if (!config.stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: "2026-05-27.dahlia",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency ?? "usd",
      metadata: { packageId, packageName },
      receipt_email: customerEmail,
      ...(customerName ? { description: `Report order — ${customerName}` } : {}),
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
