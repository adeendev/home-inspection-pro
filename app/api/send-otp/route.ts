import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailOtps } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendOtpEmail } from "@/lib/email";
import { getServerConfig } from "@/lib/config.server";

const SendOtpSchema = z.object({
  email: z.string().email(),
});

const MAX_SENDS = 3;
const WINDOW_MINUTES = 10;
const CODE_TTL_MINUTES = 10;

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
    const parsed = SendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    const recentSends = await db
      .select()
      .from(emailOtps)
      .where(and(eq(emailOtps.email, email), gte(emailOtps.createdAt, windowStart)));

    if (recentSends.length >= MAX_SENDS) {
      return NextResponse.json(
        { error: "Too many code requests. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashCode(email, code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await db.insert(emailOtps).values({
      id: nanoid(),
      email,
      codeHash,
      expiresAt,
    });

    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
