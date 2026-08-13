CREATE TABLE "payment_intent_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"attempted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "payment_intent_attempts_ip_idx" ON "payment_intent_attempts" USING btree ("ip_address","attempted_at");