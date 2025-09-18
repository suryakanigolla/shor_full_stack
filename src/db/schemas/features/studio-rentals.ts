import { pgTable, text, serial, integer, timestamp, date, time, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";
import { studios } from "../user-types/studios";

// Studio rental bookings table
export const studioBookings = pgTable("studio_bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id), // Renter
  studioId: integer("studio_id").notNull().references(() => studios.id),
  bookingDate: date("booking_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  price: integer("price").notNull(), // Price in paise
  originalPrice: integer("original_price").notNull(), // Original price before discount
  discountAmount: integer("discount_amount").default(0), // Discount applied in paise
  finalPrice: integer("final_price").notNull(), // Price after discount in paise
  gstAmount: integer("gst_amount").notNull(), // GST calculated on final price in paise
  totalAmount: integer("total_amount").notNull(), // Final price + GST in paise
  status: text("status").notNull(), // confirmed, pending, cancelled
  bookingCode: text("booking_code").notNull().unique(),
  additionalServices: jsonb("additional_services"), // Extra services requested
  paymentMethod: text("payment_method"),
  notes: text("notes"), // Special notes for the booking
  purpose: text("purpose"), // Purpose of rental (class, practice, event, etc.)
  equipmentNeeded: jsonb("equipment_needed"), // Equipment requirements
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Studio rental transactions table (for tracking payments to studio owners)
export const studioRentalTransactions = pgTable("studio_rental_transactions", {
  id: serial("id").primaryKey(),
  studioBookingId: integer("studio_booking_id").notNull().references(() => studioBookings.id),
  studioId: integer("studio_id").notNull().references(() => studios.id),
  renterId: text("renter_id").notNull().references(() => users.id),
  rentalFee: integer("rental_fee").notNull(), // Amount paid to studio in paise
  platformFee: integer("platform_fee").notNull(), // Platform commission in paise
  totalAmount: integer("total_amount").notNull(), // Total amount in paise
  status: text("status").default("pending"), // pending, paid, failed
  paymentDate: timestamp("payment_date"),
  transactionId: text("transaction_id"), // Payment gateway transaction ID
  notes: text("notes"), // Transaction notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertStudioBookingSchema = createInsertSchema(studioBookings).omit({ 
  id: true, 
  bookingCode: true, 
  createdAt: true 
});

export const insertStudioRentalTransactionSchema = createInsertSchema(studioRentalTransactions).omit({ 
  id: true, 
  createdAt: true 
});

// Type exports
export type StudioBooking = typeof studioBookings.$inferSelect;
export type StudioRentalTransaction = typeof studioRentalTransactions.$inferSelect;
export type InsertStudioBooking = z.infer<typeof insertStudioBookingSchema>;
export type InsertStudioRentalTransaction = z.infer<typeof insertStudioRentalTransactionSchema>;
