import { NextResponse } from "next/server";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

  const rate = getRateLimit(ip, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  try {
    const body = await request.json();
    const { first, last, email, address, message } = body;

    if (!first?.trim() || !last?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    console.log(
      "[CONTACT]",
      JSON.stringify({ first, last, email, address, message, ts: new Date().toISOString() }),
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
