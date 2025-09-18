import { pgTable, text, serial, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

// Studios table - extends users with studio-specific information
export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id), // Studio owner
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  pincode: text("pincode"),
  capacity: integer("capacity").notNull(), // Maximum capacity
  amenities: jsonb("amenities"), // Available amenities
  images: jsonb("images"), // Studio images
  pricePerHour: integer("price_per_hour").notNull(), // Rate in paise
  rentalFeePerClass: integer("rental_fee_per_class").default(20000), // Fixed rental fee per class in paise (default ₹200)
  rating: real("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  description: text("description"),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  latitude: real("latitude"), // Location coordinates for map services
  longitude: real("longitude"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  operatingHours: jsonb("operating_hours"), // Studio operating hours
  rules: jsonb("rules"), // Studio rules and policies
  equipment: jsonb("equipment"), // Available equipment
});

// Insert schema
export const insertStudioSchema = createInsertSchema(studios).omit({ 
  id: true 
});

// Type exports
export type Studio = typeof studios.$inferSelect;
export type InsertStudio = z.infer<typeof insertStudioSchema>;
