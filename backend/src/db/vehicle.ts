import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
export const vehicles = pgTable("vehicle", {
    id: uuid("id").defaultRandom().primaryKey(),
    entryTime: timestamp("entry_time").defaultNow().notNull(),
    exitTime: timestamp("exit_time"),
    licensePlate: text("license_plate").notNull().unique(),
    vehicleType: text("vehicle_type"),
});

export const VehicleInsertSchema = createInsertSchema(vehicles);

export const updateVehicleSchema = createUpdateSchema(vehicles);

export const selectVehicleSchema = createSelectSchema(vehicles);
export type Vehicle = typeof vehicles.$inferSelect;