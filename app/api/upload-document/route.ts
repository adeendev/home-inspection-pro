import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;

    // If Vercel Blob token is configured, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`documents/${category || "other"}/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url, name: file.name });
    }

    // Fallback: Save to public/uploads directory locally for development/testing
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
