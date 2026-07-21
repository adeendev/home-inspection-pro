import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { calculateAmountCents, type PackageTier } from "@/lib/pricing";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateOrderSchema = z.object({
  packageTier: z.enum(["basic", "premium", "verified"]),
  rushRequested: z.boolean(),
  customerEmail: z.string().email(),
  customerName: z.string().min(1).max(200),
  wizardData: z.record(z.unknown()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { packageTier, rushRequested, customerEmail, customerName, wizardData } = parsed.data;

    const amountCents = calculateAmountCents(packageTier as PackageTier, rushRequested);
    const orderId = nanoid();
    const accessToken = nanoid(32);

    await db.insert(orders).values({
      id: orderId,
      accessToken,
      customerEmail,
      customerName,
      packageTier,
      rushRequested,
      amountCents,
      status: "pending",
      orderData: JSON.stringify(wizardData),
    });

    return NextResponse.json({ orderId, amountCents });
  } catch (err) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
