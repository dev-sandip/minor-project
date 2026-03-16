import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";


const confidenceStatsSchema = z.object({
  mean: z.number(),
  min: z.number(),
  max: z.number(),
  std: z.number(),
});

export type ConfidenceStats = z.infer<typeof confidenceStatsSchema>;


export const vehicles = pgTable(
  "vehicle",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryTime: timestamp("entry_time").defaultNow().notNull(),
    exitTime: timestamp("exit_time"),                          // null = still parked
    imageUrl: text("image_url"),
    imageKey: text("image_key"),
    licensePlate: text("license_plate").notNull(),             // ← no .unique() — same plate can re-enter
    vehicleType: text("vehicle_type"),
    confidence: jsonb("confidence").$type<ConfidenceStats>(),
    totalAmount: text("total_amount"),
  },
  (table) => [
    index("idx_license_plate").on(table.licensePlate),        // fast lookups by plate
    index("idx_license_plate_exit").on(table.licensePlate, table.exitTime), // fast active-entry checks
  ]
);


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