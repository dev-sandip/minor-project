ALTER TABLE "vehicle" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "vehicle" ADD COLUMN "image_key" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "image_key";