ALTER TABLE "quiz_session" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "quiz_session" ALTER COLUMN "status" SET DEFAULT 'in_progress'::text;--> statement-breakpoint
DROP TYPE "public"."quiz_session_status";--> statement-breakpoint
CREATE TYPE "public"."quiz_session_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
ALTER TABLE "quiz_session" ALTER COLUMN "status" SET DEFAULT 'in_progress'::"public"."quiz_session_status";--> statement-breakpoint
ALTER TABLE "quiz_session" ALTER COLUMN "status" SET DATA TYPE "public"."quiz_session_status" USING "status"::"public"."quiz_session_status";