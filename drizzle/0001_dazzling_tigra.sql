ALTER TABLE "orders" ADD COLUMN "questionnaire_responses" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "questionnaire_progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "questionnaire_completed" boolean DEFAULT false NOT NULL;