import { db } from "@/lib/db";
import { adminLoginAttempts } from "@/lib/db/schema";
import { createAdminSessionToken } from "@/lib/admin-session";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { eq, and, gte } from "drizzle-orm";
import { z } from "zod";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

const LoginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recentAttempts = await db
    .select()
    .from(adminLoginAttempts)
    .where(
      and(eq(adminLoginAttempts.ipAddress, ip), gte(adminLoginAttempts.attemptedAt, windowStart)),
    );

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { password } = parsed.data;
  const succeeded = password === process.env.ADMIN_PASSWORD;

  await db.insert(adminLoginAttempts).values({ id: nanoid(), ipAddress: ip, succeeded });

  if (!succeeded) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 90,
    path: "/",
  });
  return response;
}
