import { relations } from "drizzle-orm";
import { users } from "./core/users";
import { roles, actions } from "./core/roles";
import { userRoles, rolePermissions } from "./core/user-roles";
import { sessions, accounts, verifications } from "./core/sessions";
import { artists } from "./user-types/artists";
import { studios } from "./user-types/studios";
import { students } from "./user-types/students";
import { classes, classBookings } from "./features/classes";
import { studioBookings, studioRentalTransactions } from "./features/studio-rentals";
import { gigs, gigApplications } from "./features/gigs";
import { auditLog } from "./shared/audit";

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  // One-to-one relationships with user types
  artist: one(artists, {
    fields: [users.id],
    references: [artists.userId],
  }),
  studio: one(studios, {
    fields: [users.id],
    references: [studios.userId],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  
  // Many-to-many relationships
  userRoles: many(userRoles),
  
  // One-to-many relationships
  classBookings: many(classBookings),
  studioBookings: many(studioBookings),
  gigs: many(gigs),
  gigApplications: many(gigApplications),
  
  // Audit relationships
  auditLogs: many(auditLog, { relationName: "user" }),
  targetAuditLogs: many(auditLog, { relationName: "targetUser" }),
  
  // Better Auth relationships
  sessions: many(sessions),
  accounts: many(accounts),
}));

// Roles relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

// Actions relations
export const actionsRelations = relations(actions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

// User Roles relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedBy: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
    relationName: "assignedBy",
  }),
}));

// Role Permissions relations
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  action: one(actions, {
    fields: [rolePermissions.actionId],
    references: [actions.id],
  }),
}));

// Artists relations
export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
  classes: many(classes),
}));

// Studios relations
export const studiosRelations = relations(studios, ({ one, many }) => ({
  user: one(users, {
    fields: [studios.userId],
    references: [users.id],
  }),
  classes: many(classes),
  studioBookings: many(studioBookings),
  studioRentalTransactions: many(studioRentalTransactions),
}));

// Students relations
export const studentsRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
}));

// Classes relations
export const classesRelations = relations(classes, ({ one, many }) => ({
  artist: one(artists, {
    fields: [classes.artistId],
    references: [artists.id],
  }),
  studio: one(studios, {
    fields: [classes.studioId],
    references: [studios.id],
  }),
  classBookings: many(classBookings),
}));

// Class Bookings relations
export const classBookingsRelations = relations(classBookings, ({ one }) => ({
  user: one(users, {
    fields: [classBookings.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [classBookings.classId],
    references: [classes.id],
  }),
}));

// Studio Bookings relations
export const studioBookingsRelations = relations(studioBookings, ({ one, many }) => ({
  user: one(users, {
    fields: [studioBookings.userId],
    references: [users.id],
  }),
  studio: one(studios, {
    fields: [studioBookings.studioId],
    references: [studios.id],
  }),
  studioRentalTransactions: many(studioRentalTransactions),
}));

// Studio Rental Transactions relations
export const studioRentalTransactionsRelations = relations(studioRentalTransactions, ({ one }) => ({
  studioBooking: one(studioBookings, {
    fields: [studioRentalTransactions.studioBookingId],
    references: [studioBookings.id],
  }),
  studio: one(studios, {
    fields: [studioRentalTransactions.studioId],
    references: [studios.id],
  }),
  renter: one(users, {
    fields: [studioRentalTransactions.renterId],
    references: [users.id],
  }),
}));

// Gigs relations
export const gigsRelations = relations(gigs, ({ one, many }) => ({
  host: one(users, {
    fields: [gigs.hostId],
    references: [users.id],
  }),
  gigApplications: many(gigApplications),
}));

// Gig Applications relations
export const gigApplicationsRelations = relations(gigApplications, ({ one }) => ({
  gig: one(gigs, {
    fields: [gigApplications.gigId],
    references: [gigs.id],
  }),
  user: one(users, {
    fields: [gigApplications.userId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [gigApplications.reviewedBy],
    references: [users.id],
    relationName: "reviewedBy",
  }),
}));

// Audit Log relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
    relationName: "user",
  }),
  targetUser: one(users, {
    fields: [auditLog.targetUserId],
    references: [users.id],
    relationName: "targetUser",
  }),
}));

// Better Auth session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
