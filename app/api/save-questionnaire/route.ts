import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const SaveQuestionnaireSchema = z.object({
  token: z.string().min(1),
  responses: z.record(z.unknown()),
  progress: z.number().int().nonnegative(),
  completed: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SaveQuestionnaireSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { token, responses, progress, completed } = parsed.data;

    // Find order
    const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with questionnaire responses, progress and completion status
    await db
      .update(orders)
      .set({
        questionnaireResponses: JSON.stringify(responses),
        questionnaireProgress: progress,
        questionnaireCompleted: completed,
        updatedAt: new Date(),
      })
      .where(eq(orders.accessToken, token));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[save-questionnaire]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
