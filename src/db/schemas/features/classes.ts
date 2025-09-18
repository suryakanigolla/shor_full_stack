import { pgTable, text, serial, integer, boolean, timestamp, date, time, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";
import { artists } from "../user-types/artists";
import { studios } from "../user-types/studios";

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // workshop, regular, bundle
  style: text("style").notNull(), // Dance form
  level: text("level").notNull(), // beginner, intermediate, advanced, all
  artistId: integer("artist_id").notNull().references(() => artists.id),
  studioId: integer("studio_id").notNull().references(() => studios.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  earlyBirdPrice: integer("early_bird_price"), // Price in paise
  regularPrice: integer("regular_price").notNull(), // Price in paise
  groupPrice: integer("group_price"), // Group booking price in paise
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0).notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements"), // What students need to bring
  image: text("image"), // Class image URL
  songName: text("song_name"), // Song for the class
  choreographyVideoUrl: text("choreography_video_url"), // Preview video
  isActive: boolean("is_active").default(true).notNull(),
  // Studio rental system fields
  studioApprovalStatus: text("studio_approval_status").default("pending"), // pending, approved, rejected
  studioRentalFee: integer("studio_rental_fee").default(0), // Fixed rental fee in paise
  studioApprovedAt: timestamp("studio_approved_at"),
  studioRejectedAt: timestamp("studio_rejected_at"),
  studioRejectionReason: text("studio_rejection_reason"),
  classCompletedAt: timestamp("class_completed_at"),
  rentalPaymentStatus: text("rental_payment_status").default("pending"), // pending, paid, failed
  rentalPaidAt: timestamp("rental_paid_at"),
  // Location fields inherited from studio
  latitude: real("latitude"), // Location coordinates from associated studio
  longitude: real("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Class bookings table
export const classBookings = pgTable("class_bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id), // Student
  classId: integer("class_id").notNull().references(() => classes.id),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  price: integer("price").notNull(), // Price paid in paise
  originalPrice: integer("original_price").notNull(), // Original price before discount
  discountAmount: integer("discount_amount").default(0), // Discount applied in paise
  finalPrice: integer("final_price").notNull(), // Price after discount in paise
  gstAmount: integer("gst_amount").notNull(), // GST calculated on final price in paise
  totalAmount: integer("total_amount").notNull(), // Final price + GST in paise
  status: text("status").notNull(), // confirmed, pending, cancelled
  bookingCode: text("booking_code").notNull().unique(),
  paymentMethod: text("payment_method"),
  attended: boolean("attended").default(false),
  notes: text("notes"), // Special notes for the booking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertClassSchema = createInsertSchema(classes).omit({ 
  id: true, 
  createdAt: true, 
  currentParticipants: true 
});

export const insertClassBookingSchema = createInsertSchema(classBookings).omit({ 
  id: true, 
  bookingDate: true, 
  bookingCode: true, 
  createdAt: true 
});

// Type exports
export type Class = typeof classes.$inferSelect;
export type ClassBooking = typeof classBookings.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertClassBooking = z.infer<typeof insertClassBookingSchema>;
