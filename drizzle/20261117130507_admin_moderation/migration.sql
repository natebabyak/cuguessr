ALTER TABLE "photo" ADD COLUMN "rotation" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "response" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "resolved_by" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_rotation_check" CHECK ("rotation" in (0, 90, 180, 270));