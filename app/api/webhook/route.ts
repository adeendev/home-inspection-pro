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

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata.orderId;

    if (orderId) {
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
      if (order && order.status === "pending") {
        await db
          .update(orders)
          .set({ status: "payment_failed", updatedAt: new Date() })
          .where(eq(orders.id, orderId));
      }
      console.error(
        `[webhook] Payment failed for order ${orderId}:`,
        intent.last_payment_error?.message,
      );
    }
  }

  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId =
      typeof dispute.payment_intent === "string"
        ? dispute.payment_intent
        : dispute.payment_intent?.id;

    if (paymentIntentId) {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, paymentIntentId));
      if (order) {
        await db
          .update(orders)
          .set({ status: "disputed", updatedAt: new Date() })
          .where(eq(orders.id, order.id));
      }
      console.error(
        `[webhook] Dispute created for payment intent ${paymentIntentId} (order ${order?.id ?? "unknown"}), amount: ${dispute.amount}, reason: ${dispute.reason}`,
      );
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

    if (paymentIntentId) {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, paymentIntentId));
      if (order) {
        await db
          .update(orders)
          .set({ status: "refunded", updatedAt: new Date() })
          .where(eq(orders.id, order.id));
      }
      console.error(
        `[webhook] Refund issued for payment intent ${paymentIntentId} (order ${order?.id ?? "unknown"}), amount refunded: ${charge.amount_refunded}`,
      );
    }
  }

  await db.insert(processedWebhookEvents).values({ stripeEventId: event.id });

  return new NextResponse("OK", { status: 200 });
}
