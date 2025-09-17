import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

// Students table - extends users with student-specific information
// Note: This might not be needed if base users table is sufficient for students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  danceExperience: text("dance_experience"), // beginner, intermediate, advanced
  preferredDanceForms: jsonb("preferred_dance_forms"), // Array of dance forms
  skillLevel: text("skill_level"), // Current skill level
  goals: text("goals"), // Learning goals
  medicalConditions: text("medical_conditions"), // Any relevant medical info
  emergencyContact: jsonb("emergency_contact"), // Emergency contact info
  isActive: boolean("is_active").default(true).notNull(),
});

// Insert schema
export const insertStudentSchema = createInsertSchema(students).omit({ 
  id: true 
});

// Type exports
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
