import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

const ALLOWED_CATEGORIES = new Set(["roof", "hvac", "permits", "remodel", "disclosures", "other"]);

const EDITABLE_STATUSES = new Set(["pending", "paid", "in_progress"]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;
    const token = formData.get("token") as string | null;

    if (!token) {
      return NextResponse.json({ error: "Missing order token" }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.accessToken, token));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!EDITABLE_STATUSES.has(order.status)) {
      return NextResponse.json({ error: "This order can no longer be edited" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large. Max size is 25 MB." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or image." },
        { status: 400 },
      );
    }

    const safeCategory = ALLOWED_CATEGORIES.has(category ?? "") ? category : "other";
    const filename = `${Date.now()}-${order.id}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
    const pathname = `documents/${safeCategory}/${filename}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await put(pathname, file, {
        access: "private",
        addRandomSuffix: false,
      });
      return NextResponse.json({
        url: `/api/documents?token=${encodeURIComponent(token)}&pathname=${encodeURIComponent(pathname)}`,
        name: file.name,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      name: file.name,
    });
  } catch (err) {
    console.error("[upload-document]", err);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
