CREATE TABLE "vehicle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_time" timestamp DEFAULT now() NOT NULL,
	"exit_time" timestamp,
	"license_plate" text NOT NULL,
	"vehicle_type" text,
	CONSTRAINT "vehicle_license_plate_unique" UNIQUE("license_plate")
);
