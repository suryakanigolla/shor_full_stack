import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available roles in the system
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Available actions in the system
export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category"), // e.g., "classes", "studios", "gigs"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertRoleSchema = createInsertSchema(roles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertActionSchema = createInsertSchema(actions).omit({ 
  id: true, 
  createdAt: true 
});

// Type exports
export type Role = typeof roles.$inferSelect;
export type Action = typeof actions.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertAction = z.infer<typeof insertActionSchema>;
