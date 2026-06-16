import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";

import { getServerConfig } from "../config.server";

export const createPaymentIntent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().positive(),
      currency: z.string().default("usd"),
      packageId: z.string(),
      packageName: z.string(),
      customerEmail: z.string().email().optional(),
      customerName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();
    if (!config.stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }
    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: "2026-05-27.dahlia",
    });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: data.currency,
      metadata: {
        packageId: data.packageId,
        packageName: data.packageName,
      },
      receipt_email: data.customerEmail,
      ...(data.customerName ? { description: `Report order — ${data.customerName}` } : {}),
    });
    return { clientSecret: paymentIntent.client_secret };
  });
