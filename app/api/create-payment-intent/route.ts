import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerConfig } from "@/lib/config.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, packageId, packageName, customerEmail, customerName } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!packageId || !packageName) {
      return NextResponse.json({ error: "Missing package info" }, { status: 400 });
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
