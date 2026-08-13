import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const pathname = searchParams.get("pathname");

    if (!token || !pathname) {
      return NextResponse.json({ error: "Missing token or pathname" }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!pathname.includes(`-${order.id}-`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode === 304 || !result.stream) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[documents]", err);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}
