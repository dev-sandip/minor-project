import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from "zod";

const confidenceStatsSchema = z.object({
  mean: z.number(),
  min: z.number(),
  max: z.number(),
  std: z.number(),
});

export type ConfidenceStats = z.infer<typeof confidenceStatsSchema>;


export const vehicles = pgTable("vehicle", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryTime: timestamp("entry_time").defaultNow().notNull(),
  exitTime: timestamp("exit_time"),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  licensePlate: text("license_plate").notNull().unique(),
  vehicleType: text("vehicle_type"),
  confidence: jsonb("confidence").$type<ConfidenceStats>(),
});


export const VehicleInsertSchema = createInsertSchema(vehicles, {
  confidence: confidenceStatsSchema.optional(),
});

export const updateVehicleSchema = createUpdateSchema(vehicles, {
  confidence: confidenceStatsSchema.optional(),
});

export const selectVehicleSchema = createSelectSchema(vehicles, {
  confidence: confidenceStatsSchema.nullable(),
});

export type Vehicle = typeof vehicles.$inferSelect;
