// MVP Schema - Single source of truth for all database schemas
// Organized by domain with flexible role-based permissions

// Core authentication and permission schemas
export * from "./core/users";
export * from "./core/roles";
export * from "./core/user-roles";
export * from "./core/sessions";

// User type extension schemas
export * from "./user-types/artists";
export * from "./user-types/studios";
export * from "./user-types/students";

// Feature schemas
export * from "./features/classes";
export * from "./features/studio-rentals";
export * from "./features/gigs";

// Shared schemas
export * from "./shared/enums";
export * from "./shared/audit";

// Relations
export * from "./relations";

// Re-export all tables for easy access
export {
  // Core tables
  users,
} from "./core/users";

export {
  roles,
  actions,
} from "./core/roles";

export {
  userRoles,
  rolePermissions,
} from "./core/user-roles";

export {
  sessions,
  accounts,
  verifications,
} from "./core/sessions";

export {
  artists,
} from "./user-types/artists";

export {
  studios,
} from "./user-types/studios";

export {
  students,
} from "./user-types/students";

export {
  classes,
  classBookings,
} from "./features/classes";

export {
  studioBookings,
  studioRentalTransactions,
} from "./features/studio-rentals";

export {
  gigs,
  gigApplications,
} from "./features/gigs";

export {
  auditLog,
} from "./shared/audit";

// Re-export all relations
export {
  usersRelations,
  rolesRelations,
  actionsRelations,
  userRolesRelations,
  rolePermissionsRelations,
  sessionsRelations,
  accountsRelations,
  artistsRelations,
  studiosRelations,
  studentsRelations,
  classesRelations,
  classBookingsRelations,
  studioBookingsRelations,
  studioRentalTransactionsRelations,
  gigsRelations,
  gigApplicationsRelations,
  auditLogRelations,
} from "./relations";

// Re-export all types
export type {
  User,
  InsertUser,
} from "./core/users";

export type {
  Role,
  Action,
  InsertRole,
  InsertAction,
} from "./core/roles";

export type {
  UserRole,
  RolePermission,
  InsertUserRole,
  InsertRolePermission,
} from "./core/user-roles";

export type {
  Session,
  Account,
  Verification,
  InsertSession,
  InsertAccount,
  InsertVerification,
} from "./core/sessions";

export type {
  Artist,
  InsertArtist,
} from "./user-types/artists";

export type {
  Studio,
  InsertStudio,
} from "./user-types/studios";

export type {
  Student,
  InsertStudent,
} from "./user-types/students";

export type {
  Class,
  ClassBooking,
  InsertClass,
  InsertClassBooking,
} from "./features/classes";

export type {
  StudioBooking,
  StudioRentalTransaction,
  InsertStudioBooking,
  InsertStudioRentalTransaction,
} from "./features/studio-rentals";

export type {
  Gig,
  GigApplication,
  InsertGig,
  InsertGigApplication,
} from "./features/gigs";

export type {
  AuditLog,
  InsertAuditLog,
} from "./shared/audit";

export type {
  UserType,
  ClassLevel,
  DanceForm,
  ClassType,
  BookingStatus,
  GigStatus,
  ApplicationStatus,
} from "./shared/enums";
