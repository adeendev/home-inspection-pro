# Accurate Home Report — Backend Implementation Plan

**Goal:** Give the app real persistence (Neon), a view-only admin panel, tamper-proof payments, and working email/report delivery — closing every gap from the original audit without overbuilding auth you don't need.

**Tech added:** Neon (Postgres) + Drizzle ORM, Resend (email), Vercel Blob or S3/R2 (file storage), `iron-session` (admin cookie).

---

## 1. Database schema (Neon + Drizzle)

Install:

```bash
bun add drizzle-orm @neondatabase/serverless
bun add -d drizzle-kit
```

`lib/db/schema.ts`:

```ts
import { pgTable, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // e.g. nanoid
  accessToken: text("access_token").notNull().unique(), // for customer status link
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  packageTier: text("package_tier").notNull(), // 'basic' | 'premium' | 'verified'
  rushRequested: boolean("rush_requested").notNull().default(false),
  amountCents: integer("amount_cents").notNull(), // server-derived, never client-trusted
  status: text("status").notNull().default("pending"), // pending | paid | in_progress | delivered
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  reportFileKey: text("report_file_key"), // blob storage key, set when analyst uploads PDF
  orderData: text("order_data").notNull(), // JSON blob of wizard answers (property address etc.)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("orders_email_idx").on(table.customerEmail),
  statusIdx: index("orders_status_idx").on(table.status),
}));

export const processedWebhookEvents = pgTable("processed_webhook_events", {
  stripeEventId: text("stripe_event_id").primaryKey(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: text("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
  succeeded: boolean("succeeded").notNull(),
});
```

`lib/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

`drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

Run once: `bunx drizzle-kit generate && bunx drizzle-kit migrate`

---

## 2. Single shared pricing config (kills the duplication bug)

`lib/pricing.ts`:

```ts
export const PACKAGE_PRICES_CENTS = {
  basic: 39900,
  premium: 89900,
  verified: 250000,
} as const;

export const RUSH_FEE_CENTS = 14900;

export type PackageTier = keyof typeof PACKAGE_PRICES_CENTS;

export function calculateAmountCents(tier: PackageTier, rush: boolean): number {
  const base = PACKAGE_PRICES_CENTS[tier];
  if (base === undefined) throw new Error(`Invalid package tier: ${tier}`);
  return rush ? base + RUSH_FEE_CENTS : base;
}
```

Both the client-facing price display *and* the server route below import from this one file — no more hardcoding in two places.

---

## 3. Order creation — write to Neon as `pending` before payment

`app/api/create-order/route.ts` (new route, called when the wizard finishes, before `create-payment-intent`):

```ts
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { calculateAmountCents, type PackageTier } from "@/lib/pricing";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { packageTier, rushRequested, customerEmail, customerName, wizardData } = body;

  const amountCents = calculateAmountCents(packageTier as PackageTier, !!rushRequested);
  const orderId = nanoid();
  const accessToken = nanoid(32); // long, unguessable

  await db.insert(orders).values({
    id: orderId,
    accessToken,
    customerEmail,
    customerName,
    packageTier,
    rushRequested: !!rushRequested,
    amountCents,
    status: "pending",
    orderData: JSON.stringify(wizardData),
  });

  return NextResponse.json({ orderId, amountCents });
}
```

`app/api/create-payment-intent/route.ts` (modified — server re-derives the amount, ignores whatever the client sends):

```ts
import Stripe from "stripe";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { orderId } = await req.json();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // amountCents came from calculateAmountCents() at order-creation time — never from this request
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.amountCents,
    currency: "usd",
    metadata: { orderId: order.id },
  });

  await db.update(orders)
    .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
```

---

## 4. Webhook — the only thing allowed to mark an order `paid`

`app/api/webhook/route.ts`:

```ts
import Stripe from "stripe";
import { db } from "@/lib/db";
import { orders, processedWebhookEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Dedup: skip if we've already processed this exact event
  const [existing] = await db.select().from(processedWebhookEvents)
    .where(eq(processedWebhookEvents.stripeEventId, event.id));
  if (existing) {
    return NextResponse.json({ received: true, deduped: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata.orderId;

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (order && order.status === "pending") {
      await db.update(orders)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await sendOrderConfirmationEmail(order.customerEmail, order.accessToken, order.id);
    }
  }

  // Record this event as processed, regardless of type, so retries of irrelevant events short-circuit too
  await db.insert(processedWebhookEvents).values({ stripeEventId: event.id });

  return NextResponse.json({ received: true });
}
```

---

## 5. Admin auth — hardcoded password, signed cookie, short session, rate-limited

`.env` additions:

```
ADMIN_PASSWORD=<strong random string, not "admin123">
SESSION_SECRET=<32+ char random string>
```

`lib/admin-session.ts`:

```ts
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_DURATION_SECONDS = 60 * 90; // 1.5 hours

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
```

`app/api/admin/login/route.ts`:

```ts
import { db } from "@/lib/db";
import { adminLoginAttempts } from "@/lib/db/schema";
import { createAdminSessionToken } from "@/lib/admin-session";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { eq, and, gte } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recentAttempts = await db.select().from(adminLoginAttempts)
    .where(and(
      eq(adminLoginAttempts.ipAddress, ip),
      gte(adminLoginAttempts.attemptedAt, windowStart)
    ));

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }

  const { password } = await req.json();
  const succeeded = password === process.env.ADMIN_PASSWORD;

  await db.insert(adminLoginAttempts).values({ id: nanoid(), ipAddress: ip, succeeded });

  if (!succeeded) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 90,
    path: "/",
  });
  return response;
}
```

`middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-session";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
    const token = req.cookies.get("admin_session")?.value;
    if (!token || !(await verifyAdminSessionToken(token))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

---

## 6. Admin panel (view-only v1)

`app/admin/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function AdminOrdersPage() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Order ID</th>
            <th>Customer</th>
            <th>Package</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {allOrders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="py-2 font-mono text-xs">{order.id}</td>
              <td>{order.customerName} ({order.customerEmail})</td>
              <td className="capitalize">{order.packageTier}{order.rushRequested ? " + rush" : ""}</td>
              <td>${(order.amountCents / 100).toFixed(2)}</td>
              <td className="capitalize">{order.status}</td>
              <td>{order.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 7. Email (Resend)

```bash
bun add resend
```

`lib/email.ts`:

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmationEmail(to: string, accessToken: string, orderId: string) {
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/status/${accessToken}`;

  await resend.emails.send({
    from: "orders@accuratehomereport.com",
    to,
    subject: "Your Accurate Home Report order is confirmed",
    html: `
      <p>Thanks — your order (${orderId}) is confirmed and our analysts are getting started.</p>
      <p>You can check your order status or download your report here once it's ready:</p>
      <p><a href="${statusUrl}">${statusUrl}</a></p>
    `,
  });
}
```

---

## 8. Customer status page (token link, no login)

`app/order/status/[token]/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/storage";

export default async function OrderStatusPage({ params }: { params: { token: string } }) {
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, params.token));
  if (!order) notFound();

  const downloadUrl = order.reportFileKey ? await getSignedDownloadUrl(order.reportFileKey) : null;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-2">Order {order.id}</h1>
      <p className="capitalize mb-4">Status: {order.status}</p>
      {downloadUrl ? (
        <a href={downloadUrl} className="underline">Download your report</a>
      ) : (
        <p className="text-sm text-gray-500">Your report isn't ready yet — we'll email you when it is.</p>
      )}
    </div>
  );
}
```

---

## 9. Report file storage (Vercel Blob, signed short-lived URLs)

```bash
bun add @vercel/blob
```

`lib/storage.ts`:

```ts
import { put } from "@vercel/blob";

export async function uploadReport(orderId: string, file: Buffer): Promise<string> {
  const blob = await put(`reports/${orderId}.pdf`, file, {
    access: "public", // Vercel Blob has no private+signed-URL mode; see note below
    addRandomSuffix: true, // makes the key unguessable
  });
  return blob.pathname; // store this as reportFileKey
}

export async function getSignedDownloadUrl(fileKey: string): Promise<string> {
  // Vercel Blob URLs with addRandomSuffix are already unguessable and long-lived.
  // For true short-lived signed URLs, use S3/R2 with getSignedUrl() from
  // @aws-sdk/s3-request-presigner instead — swap this function's implementation only.
  return `${process.env.BLOB_BASE_URL}/${fileKey}`;
}
```

**Note:** Vercel Blob doesn't support time-expiring signed URLs natively — only unguessable long-lived ones (fine given the token-link model, since both are protected by an unguessable secret). If you want true short-lived expiry, use S3/R2 with `getSignedUrl` from `@aws-sdk/s3-request-presigner` — same function signature, swap the implementation.

---

## 10. Environment variables checklist

```
DATABASE_URL=              # Neon connection string
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ADMIN_PASSWORD=
SESSION_SECRET=
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=     # Vercel Blob
NEXT_PUBLIC_APP_URL=
```

Confirm `STRIPE_SECRET_KEY` has never been committed to git history — if it has, rotate it in the Stripe dashboard before going further.

---

## Build order

1. Neon schema + Drizzle setup (§1)
2. Shared pricing config (§2) — do this before touching payment routes
3. Order creation + payment intent re-derivation (§3)
4. Webhook rewrite with dedup (§4)
5. Admin auth + middleware (§5)
6. Admin orders list page (§6)
7. Resend integration (§7)
8. Customer status page (§8)
9. File storage wiring (§9) — last, since analysts need a place to upload PDFs to (a simple admin upload form can be added once storage works)