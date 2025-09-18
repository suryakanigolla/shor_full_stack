import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base users table - Better Auth integrated
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Changed to text for Better Auth compatibility
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  profilePic: text("profile_pic"),
  gender: text("gender"),
  instagram: text("instagram"),
  height: text("height"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"), // Better Auth expects this field
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema for users
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
