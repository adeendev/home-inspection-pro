import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import Stripe from "stripe";

import { getServerConfig } from "@/lib/config.server";

export const Route = createFileRoute("/api/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const config = getServerConfig();
        if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
          return new Response("Stripe not configured", { status: 500 });
        }
        const stripe = new Stripe(config.stripeSecretKey, {
          apiVersion: "2026-05-27.dahlia",
        });
        const body = await request.text();
        const sig = request.headers.get("stripe-signature");
        if (!sig) {
          return new Response("Missing stripe-signature header", { status: 400 });
        }
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, config.stripeWebhookSecret);
        } catch (err) {
          return new Response(`Invalid signature: ${(err as Error).message}`, { status: 400 });
        }
        switch (event.type) {
          case "payment_intent.succeeded": {
            const pi = event.data.object as Stripe.PaymentIntent;
            console.log("Payment succeeded:", pi.id, pi.metadata);
            break;
          }
          case "payment_intent.payment_failed": {
            const pi = event.data.object as Stripe.PaymentIntent;
            console.log("Payment failed:", pi.id, pi.last_payment_error?.message);
            break;
          }
        }
        return new Response("OK", { status: 200 });
      },
    },
  },
});
