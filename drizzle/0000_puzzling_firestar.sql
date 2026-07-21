CREATE TABLE "admin_login_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"attempted_at" timestamp DEFAULT now() NOT NULL,
	"succeeded" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"package_tier" text NOT NULL,
	"rush_requested" boolean DEFAULT false NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"report_file_key" text,
	"order_data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "processed_webhook_events" (
	"stripe_event_id" text PRIMARY KEY NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");