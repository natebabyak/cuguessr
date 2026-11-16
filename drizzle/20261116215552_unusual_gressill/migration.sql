CREATE TYPE "submission_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "game" (
	"id" serial PRIMARY KEY,
	"date" date NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" serial PRIMARY KEY,
	"user_id" text,
	"object_key" text NOT NULL UNIQUE,
	"height" integer NOT NULL,
	"width" integer NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"status" "submission_status" DEFAULT 'pending'::"submission_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" serial PRIMARY KEY,
	"photo_id" integer NOT NULL,
	"user_id" text,
	"description" text NOT NULL,
	"status" "submission_status" DEFAULT 'pending'::"submission_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "round" (
	"id" serial PRIMARY KEY,
	"game_id" integer NOT NULL,
	"photo_id" integer NOT NULL,
	"index" smallint NOT NULL,
	CONSTRAINT "round_game_id_index_unique" UNIQUE("game_id","index"),
	CONSTRAINT "round_game_id_photo_id_unique" UNIQUE("game_id","photo_id")
);
--> statement-breakpoint
CREATE TABLE "round_result" (
	"round_id" integer,
	"user_id" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"distance" double precision NOT NULL,
	"points" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "round_result_pkey" PRIMARY KEY("round_id","user_id")
);
--> statement-breakpoint
CREATE INDEX "photo_user_id_idx" ON "photo" ("user_id");--> statement-breakpoint
CREATE INDEX "photo_status_idx" ON "photo" ("status");--> statement-breakpoint
CREATE INDEX "report_photo_id_idx" ON "report" ("photo_id");--> statement-breakpoint
CREATE INDEX "report_user_id_idx" ON "report" ("user_id");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "report" ("status");--> statement-breakpoint
CREATE INDEX "round_result_user_id_idx" ON "round_result" ("user_id");--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_photo_id_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "round" ADD CONSTRAINT "round_game_id_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "round" ADD CONSTRAINT "round_photo_id_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "round_result" ADD CONSTRAINT "round_result_round_id_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "round_result" ADD CONSTRAINT "round_result_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;