import { pgTable, text, serial, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

// Artists table - extends users with artist-specific information
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  experience: integer("experience").notNull(), // Years of experience
  specialization: text("specialization").notNull(), // Dance form specialization
  portfolio: text("portfolio"), // Portfolio URL or JSON
  ratePerHour: integer("rate_per_hour"), // Rate in paise
  ratePerClass: integer("rate_per_class"), // Rate in paise
  availability: jsonb("availability"), // Availability schedule
  socialLinks: jsonb("social_links"), // Instagram, YouTube, etc.
  achievements: jsonb("achievements"), // Awards, certifications
  teachingStyle: text("teaching_style"), // Teaching approach
  languages: jsonb("languages"), // Languages spoken
  isVerified: boolean("is_verified").default(false).notNull(),
  rating: real("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
});

// Insert schema
export const insertArtistSchema = createInsertSchema(artists).omit({ 
  id: true 
});

// Type exports
export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
