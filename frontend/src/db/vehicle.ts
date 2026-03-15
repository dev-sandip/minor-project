
import {
  decimal,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'


export const vehicle = pgTable(
    'vehicle',
    {
      id: text('id').primaryKey(),
      vehicleNumber: text('vehicle_number').notNull().unique(),
      imageUrl: text('image_url').notNull(),
      entryTime: timestamp('entry_time').notNull(),
      exitTime: timestamp('exit_time'),
      parkingCost: decimal('parking_cost', { precision: 10, scale: 2 }).default(
        '0',
      ),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    },
    (table) => [index('vehicle_vehicleNumber_idx').on(table.vehicleNumber)],
  )

