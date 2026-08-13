import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import crypto from "crypto";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerConfig } from "@/lib/config.server";
import { PACKAGE_PRICES_CENTS, RUSH_FEE_CENTS, type PackageTier } from "@/lib/pricing";

const PAID_STATUSES = new Set(["paid", "in_progress", "delivered", "refunded", "disputed"]);

function verificationCode(orderId: string, paymentIntentId: string, amountCents: number): string {
  const config = getServerConfig();
  const hmac = crypto.createHmac("sha256", config.sessionSecret ?? "");
  hmac.update(`${orderId}:${paymentIntentId}:${amountCents}`);
  return hmac.digest("hex").slice(0, 12).toUpperCase();
}

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

    const tier = order.packageTier as PackageTier;
    const baseCents = PACKAGE_PRICES_CENTS[tier] ?? order.amountCents;
    const rushCents = order.rushRequested ? RUSH_FEE_CENTS : 0;
    const code = verificationCode(order.id, order.stripePaymentIntentId, order.amountCents);
    const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 740;
    const left = 56;
    const ink = rgb(0.1, 0.13, 0.21);
    const muted = rgb(0.45, 0.45, 0.45);
    const brass = rgb(0.72, 0.55, 0.24);

    const draw = (
      text: string,
      opts: { size?: number; f?: typeof font; color?: typeof ink } = {},
    ) => {
      page.drawText(text, {
        x: left,
        y,
        size: opts.size ?? 11,
        font: opts.f ?? font,
        color: opts.color ?? ink,
      });
    };

    draw("Accurate Home Report", { size: 20, f: bold, color: brass });
    y -= 20;
    draw("Payment Receipt", { size: 13, f: bold });
    y -= 30;

    page.drawLine({
      start: { x: left, y },
      end: { x: 556, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 26;

    const row = (label: string, value: string) => {
      draw(label, { size: 10, color: muted });
      page.drawText(value, { x: 260, y, size: 10, font: bold, color: ink });
      y -= 22;
    };

    row("Receipt Date", new Date(order.updatedAt).toLocaleString("en-US"));
    row("Order ID", order.id);
    row("Payment ID", order.stripePaymentIntentId);
    row("Customer Name", order.customerName);
    row("Customer Email", order.customerEmail);
    row("Package", `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Report`);

    y -= 10;
    page.drawLine({
      start: { x: left, y },
      end: { x: 556, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 26;

    row("Package Price", fmt(baseCents));
    if (order.rushRequested) row("Rush Fee", fmt(rushCents));

    y -= 6;
    page.drawLine({
      start: { x: left, y },
      end: { x: 556, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 26;

    draw("Total Paid (USD)", { size: 12, f: bold });
    page.drawText(fmt(order.amountCents), { x: 260, y, size: 14, font: bold, color: brass });
    y -= 50;

    draw("Verification Code", { size: 9, color: muted });
    y -= 16;
    page.drawText(code, { x: left, y, size: 13, font: bold, color: ink });
    y -= 40;

    page.drawText(
      "This receipt is generated directly from our payment records and reflects the actual",
      { x: left, y, size: 8, font, color: muted },
    );
    y -= 12;
    page.drawText(
      "amount charged by Stripe for this order. To verify authenticity, contact support with",
      { x: left, y, size: 8, font, color: muted },
    );
    y -= 12;
    page.drawText("the Order ID and Verification Code above.", {
      x: left,
      y,
      size: 8,
      font,
      color: muted,
    });

    const pdfBytes = await pdfDoc.save();

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
