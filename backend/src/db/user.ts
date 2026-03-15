import { pgTable,text, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema, } from 'drizzle-zod';

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name : text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export const UserInsertSchema = createInsertSchema(users);
export const UserSelectSchema = createSelectSchema(users);
export const UserUpdateSchema = createUpdateSchema(users);
