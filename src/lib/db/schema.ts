import { pgTable, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    accessToken: text("access_token").notNull().unique(),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    packageTier: text("package_tier").notNull(),
    rushRequested: boolean("rush_requested").notNull().default(false),
    amountCents: integer("amount_cents").notNull(),
    status: text("status").notNull().default("pending"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    reportFileKey: text("report_file_key"),
    orderData: text("order_data").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("orders_email_idx").on(table.customerEmail),
    statusIdx: index("orders_status_idx").on(table.status),
  }),
);

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
