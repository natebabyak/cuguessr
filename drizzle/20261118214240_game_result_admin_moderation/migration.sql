CREATE TABLE "game_result" (
	"game_id" integer,
	"user_id" text,
	"points" integer NOT NULL,
	"on_time" boolean NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_result_pkey" PRIMARY KEY("game_id","user_id")
);
--> statement-breakpoint
CREATE INDEX "game_result_leaderboard_idx" ON "game_result" ("game_id","points");--> statement-breakpoint
CREATE INDEX "game_result_user_idx" ON "game_result" ("user_id","on_time");--> statement-breakpoint
ALTER TABLE "game_result" ADD CONSTRAINT "game_result_game_id_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_result" ADD CONSTRAINT "game_result_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
INSERT INTO "game_result" ("game_id", "user_id", "points", "on_time", "completed_at")
SELECT
	"round"."game_id",
	"round_result"."user_id",
	sum("round_result"."points")::integer,
	(max("round_result"."created_at") AT TIME ZONE 'America/Toronto')::date = "game"."date",
	max("round_result"."created_at")
FROM "round_result"
INNER JOIN "round" ON "round_result"."round_id" = "round"."id"
INNER JOIN "game" ON "round"."game_id" = "game"."id"
GROUP BY "round"."game_id", "round_result"."user_id", "game"."date"
HAVING count(*) = 5
ON CONFLICT ("game_id", "user_id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "rotation" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "response" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "resolved_by" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_rotation_check" CHECK ("rotation" in (0, 90, 180, 270));