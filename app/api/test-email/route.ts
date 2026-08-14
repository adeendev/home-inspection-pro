import { NextResponse } from "next/server";
import { z } from "zod";
import { sendTestEmail } from "@/lib/email";

const TestEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = TestEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await sendTestEmail(parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[test-email]", err);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
