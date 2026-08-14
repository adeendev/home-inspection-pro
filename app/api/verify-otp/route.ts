import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailOtps } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { getServerConfig } from "@/lib/config.server";

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
});

const MAX_ATTEMPTS = 5;

function hashCode(email: string, code: string): string {
  const config = getServerConfig();
  return crypto
    .createHmac("sha256", config.sessionSecret ?? "")
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const [entry] = await db
      .select()
      .from(emailOtps)
      .where(
        and(
          eq(emailOtps.email, email),
          eq(emailOtps.verified, false),
          gte(emailOtps.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);

    if (!entry) {
      return NextResponse.json(
        { error: "No active code found. Please request a new one." },
        { status: 400 },
      );
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 },
      );
    }

    const expectedHash = hashCode(email, parsed.data.code);
    const providedHash = Buffer.from(expectedHash);
    const actualHash = Buffer.from(entry.codeHash);
    const matches =
      providedHash.length === actualHash.length && crypto.timingSafeEqual(providedHash, actualHash);

    if (!matches) {
      await db
        .update(emailOtps)
        .set({ attempts: entry.attempts + 1 })
        .where(eq(emailOtps.id, entry.id));
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    await db.update(emailOtps).set({ verified: true }).where(eq(emailOtps.id, entry.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
