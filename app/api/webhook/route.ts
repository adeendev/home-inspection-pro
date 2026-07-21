import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { orders, processedWebhookEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerConfig } from "@/lib/config.server";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const config = getServerConfig();
  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    return new NextResponse("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2026-05-27.dahlia",
  });

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, config.stripeWebhookSecret);
  } catch (err) {
    return new NextResponse(`Invalid signature: ${(err as Error).message}`, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(processedWebhookEvents)
    .where(eq(processedWebhookEvents.stripeEventId, event.id));
  if (existing) {
    return NextResponse.json({ received: true, deduped: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata.orderId;

    if (orderId) {
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
      if (order && order.status === "pending") {
        await db
          .update(orders)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(orders.id, orderId));

        try {
          await sendOrderConfirmationEmail(order.customerEmail, order.accessToken, order.id);
        } catch (emailErr) {
          console.error("[webhook] Failed to send confirmation email:", emailErr);
        }
      }
    }
  }

  await db.insert(processedWebhookEvents).values({ stripeEventId: event.id });

  return new NextResponse("OK", { status: 200 });
}
