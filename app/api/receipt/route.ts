import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateReceiptPdf } from "@/lib/receipt";

const PAID_STATUSES = new Set(["paid", "in_progress", "delivered", "refunded", "disputed"]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!PAID_STATUSES.has(order.status) || !order.stripePaymentIntentId) {
      return NextResponse.json({ error: "No payment recorded for this order" }, { status: 403 });
    }

    const pdfBytes = await generateReceiptPdf(order);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${order.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[receipt]", err);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
