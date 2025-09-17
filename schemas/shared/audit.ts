import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

// Audit log for tracking all role changes and permission updates
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // User who performed the action
  targetUserId: integer("target_user_id").references(() => users.id), // User affected by the action
  action: text("action").notNull(), // e.g., "role_assigned", "permission_granted", "user_created"
  entityType: text("entity_type").notNull(), // e.g., "user", "role", "permission"
  entityId: integer("entity_id"), // ID of the affected entity
  oldValues: jsonb("old_values"), // Previous values
  newValues: jsonb("new_values"), // New values
  metadata: jsonb("metadata"), // Additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema
export const insertAuditLogSchema = createInsertSchema(auditLog).omit({ 
  id: true, 
  createdAt: true 
});

// Type exports
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
