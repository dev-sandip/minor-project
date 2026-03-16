ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_license_plate_unique";--> statement-breakpoint
CREATE INDEX "idx_license_plate" ON "vehicle" USING btree ("license_plate");--> statement-breakpoint
CREATE INDEX "idx_license_plate_exit" ON "vehicle" USING btree ("license_plate","exit_time");