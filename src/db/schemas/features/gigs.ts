import { pgTable, text, serial, integer, timestamp, date, time, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

// Gigs table - performance opportunities
export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  hostId: text("host_id").notNull().references(() => users.id), // Who created the gig
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(), // What's required from performers
  location: text("location").notNull(),
  address: text("address"), // Full address
  city: text("city").notNull(),
  area: text("area"),
  date: date("date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  payment: integer("payment"), // Payment amount in paise
  spots: integer("spots").notNull(), // Number of spots available
  filledSpots: integer("filled_spots").default(0), // Number of spots filled
  status: text("status").notNull(), // open, closed, filled, cancelled
  gigType: text("gig_type"), // performance, workshop, event, etc.
  danceForm: text("dance_form"), // Required dance form
  skillLevel: text("skill_level"), // Required skill level
  ageGroup: text("age_group"), // Target age group
  equipment: jsonb("equipment"), // Equipment provided/required
  additionalInfo: jsonb("additional_info"), // Additional requirements or info
  contactInfo: jsonb("contact_info"), // Contact details
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gig applications table
export const gigApplications = pgTable("gig_applications", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull().references(() => gigs.id),
  userId: text("user_id").notNull().references(() => users.id), // Applicant
  status: text("status").notNull(), // applied, accepted, rejected
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  message: text("message"), // Application message
  portfolio: text("portfolio"), // Portfolio link
  experience: text("experience"), // Relevant experience
  availability: jsonb("availability"), // When applicant is available
  expectedPayment: integer("expected_payment"), // Expected payment in paise
  additionalInfo: jsonb("additional_info"), // Additional application info
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => users.id), // Who reviewed the application
  reviewNotes: text("review_notes"), // Review notes
});

// Insert schemas
export const insertGigSchema = createInsertSchema(gigs).omit({ 
  id: true, 
  createdAt: true, 
  filledSpots: true 
});

export const insertGigApplicationSchema = createInsertSchema(gigApplications).omit({ 
  id: true, 
  appliedAt: true 
});

// Type exports
export type Gig = typeof gigs.$inferSelect;
export type GigApplication = typeof gigApplications.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type InsertGigApplication = z.infer<typeof insertGigApplicationSchema>;
