import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available roles in the system
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Available actions in the system - Database-contextualized permissions
export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // e.g., "classes", "class_bookings", "studios", "studio_bookings", "gigs", "gig_applications", "users", "system"
  tableName: text("table_name"), // Database table this action relates to
  operation: text("operation").notNull(), // CRUD operation: create, read, update, delete, manage
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertRoleSchema = createInsertSchema(roles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertActionSchema = createInsertSchema(actions).omit({ 
  id: true, 
  createdAt: true 
});

// Database-contextualized permission constants
export const PERMISSIONS = {
  // Classes Domain
  CLASSES: {
    CREATE: 'create_class',
    READ: 'read_class',
    UPDATE: 'update_class',
    DELETE: 'delete_class',
  },
  
  // Class Bookings Domain
  CLASS_BOOKINGS: {
    CREATE: 'create_class_booking',
    READ: 'read_class_booking',
    UPDATE: 'update_class_booking',
    DELETE: 'delete_class_booking',
  },
  
  // Studios Domain
  STUDIOS: {
    CREATE: 'create_studio',
    READ: 'read_studio',
    UPDATE: 'update_studio',
    DELETE: 'delete_studio',
  },
  
  // Studio Bookings Domain
  STUDIO_BOOKINGS: {
    CREATE: 'create_studio_booking',
    READ: 'read_studio_booking',
    UPDATE: 'update_studio_booking',
    DELETE: 'delete_studio_booking',
  },
  
  // Gigs Domain
  GIGS: {
    CREATE: 'create_gig',
    READ: 'read_gig',
    UPDATE: 'update_gig',
    DELETE: 'delete_gig',
  },
  
  // Gig Applications Domain
  GIG_APPLICATIONS: {
    CREATE: 'create_gig_application',
    READ: 'read_gig_application',
    UPDATE: 'update_gig_application',
    DELETE: 'delete_gig_application',
  },
  
  // Users Domain
  USERS: {
    CREATE: 'create_user',
    READ: 'read_user',
    UPDATE: 'update_user',
    DELETE: 'delete_user',
    MANAGE_ROLES: 'manage_user_roles',
    READ_ROLES: 'read_user_roles',
  },
  
  // System Domain
  SYSTEM: {
    READ_AUDIT_LOG: 'read_audit_log',
    MANAGE_ROLES: 'manage_roles',
    MANAGE_PERMISSIONS: 'manage_permissions',
    READ_ANALYTICS: 'read_analytics',
  },
} as const;

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  CLASSES: 'classes',
  CLASS_BOOKINGS: 'class_bookings',
  STUDIOS: 'studios',
  STUDIO_BOOKINGS: 'studio_bookings',
  GIGS: 'gigs',
  GIG_APPLICATIONS: 'gig_applications',
  USERS: 'users',
  SYSTEM: 'system',
} as const;

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  student: [
    // Classes
    PERMISSIONS.CLASSES.READ,
    
    // Class Bookings
    PERMISSIONS.CLASS_BOOKINGS.CREATE,
    PERMISSIONS.CLASS_BOOKINGS.READ,
    PERMISSIONS.CLASS_BOOKINGS.UPDATE,
    PERMISSIONS.CLASS_BOOKINGS.DELETE,
    
    // Studios
    PERMISSIONS.STUDIOS.READ,
    
    // Studio Bookings
    PERMISSIONS.STUDIO_BOOKINGS.CREATE,
    PERMISSIONS.STUDIO_BOOKINGS.READ,
    PERMISSIONS.STUDIO_BOOKINGS.UPDATE,
    PERMISSIONS.STUDIO_BOOKINGS.DELETE,
    
    // Gigs
    PERMISSIONS.GIGS.READ,
    
    // Gig Applications
    PERMISSIONS.GIG_APPLICATIONS.CREATE,
    PERMISSIONS.GIG_APPLICATIONS.READ,
    PERMISSIONS.GIG_APPLICATIONS.UPDATE,
    PERMISSIONS.GIG_APPLICATIONS.DELETE,
    
    // Users
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
  ],
  
  artist: [
    // All student permissions +
    PERMISSIONS.CLASSES.CREATE,
    PERMISSIONS.CLASSES.READ,
    PERMISSIONS.CLASSES.UPDATE,
    PERMISSIONS.CLASSES.DELETE,
    
    PERMISSIONS.GIGS.CREATE,
    PERMISSIONS.GIGS.READ,
    PERMISSIONS.GIGS.UPDATE,
    PERMISSIONS.GIGS.DELETE,
  ],
  
  studio_owner: [
    // All student permissions +
    PERMISSIONS.STUDIOS.CREATE,
    PERMISSIONS.STUDIOS.READ,
    PERMISSIONS.STUDIOS.UPDATE,
    PERMISSIONS.STUDIOS.DELETE,
  ],
  
  admin: [
    // All permissions - wildcard
    '*'
  ]
} as const;

// All available permissions as a flat array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(category => Object.values(category));

// Permission definitions for seeding
export const PERMISSION_DEFINITIONS = [
  // Classes
  { name: PERMISSIONS.CLASSES.CREATE, description: 'Create new dance classes', category: PERMISSION_CATEGORIES.CLASSES, tableName: 'classes', operation: 'create' },
  { name: PERMISSIONS.CLASSES.READ, description: 'View class details', category: PERMISSION_CATEGORIES.CLASSES, tableName: 'classes', operation: 'read' },
  { name: PERMISSIONS.CLASSES.UPDATE, description: 'Edit class information', category: PERMISSION_CATEGORIES.CLASSES, tableName: 'classes', operation: 'update' },
  { name: PERMISSIONS.CLASSES.DELETE, description: 'Cancel or delete classes', category: PERMISSION_CATEGORIES.CLASSES, tableName: 'classes', operation: 'delete' },
  
  // Class Bookings
  { name: PERMISSIONS.CLASS_BOOKINGS.CREATE, description: 'Book a dance class', category: PERMISSION_CATEGORIES.CLASS_BOOKINGS, tableName: 'class_bookings', operation: 'create' },
  { name: PERMISSIONS.CLASS_BOOKINGS.READ, description: 'View class bookings', category: PERMISSION_CATEGORIES.CLASS_BOOKINGS, tableName: 'class_bookings', operation: 'read' },
  { name: PERMISSIONS.CLASS_BOOKINGS.UPDATE, description: 'Modify class bookings', category: PERMISSION_CATEGORIES.CLASS_BOOKINGS, tableName: 'class_bookings', operation: 'update' },
  { name: PERMISSIONS.CLASS_BOOKINGS.DELETE, description: 'Cancel class bookings', category: PERMISSION_CATEGORIES.CLASS_BOOKINGS, tableName: 'class_bookings', operation: 'delete' },
  
  // Studios
  { name: PERMISSIONS.STUDIOS.CREATE, description: 'Create studio listings', category: PERMISSION_CATEGORIES.STUDIOS, tableName: 'studios', operation: 'create' },
  { name: PERMISSIONS.STUDIOS.READ, description: 'View studio details', category: PERMISSION_CATEGORIES.STUDIOS, tableName: 'studios', operation: 'read' },
  { name: PERMISSIONS.STUDIOS.UPDATE, description: 'Edit studio information', category: PERMISSION_CATEGORIES.STUDIOS, tableName: 'studios', operation: 'update' },
  { name: PERMISSIONS.STUDIOS.DELETE, description: 'Remove studio listings', category: PERMISSION_CATEGORIES.STUDIOS, tableName: 'studios', operation: 'delete' },
  
  // Studio Bookings
  { name: PERMISSIONS.STUDIO_BOOKINGS.CREATE, description: 'Rent studio space', category: PERMISSION_CATEGORIES.STUDIO_BOOKINGS, tableName: 'studio_bookings', operation: 'create' },
  { name: PERMISSIONS.STUDIO_BOOKINGS.READ, description: 'View studio rentals', category: PERMISSION_CATEGORIES.STUDIO_BOOKINGS, tableName: 'studio_bookings', operation: 'read' },
  { name: PERMISSIONS.STUDIO_BOOKINGS.UPDATE, description: 'Modify studio rentals', category: PERMISSION_CATEGORIES.STUDIO_BOOKINGS, tableName: 'studio_bookings', operation: 'update' },
  { name: PERMISSIONS.STUDIO_BOOKINGS.DELETE, description: 'Cancel studio rentals', category: PERMISSION_CATEGORIES.STUDIO_BOOKINGS, tableName: 'studio_bookings', operation: 'delete' },
  
  // Gigs
  { name: PERMISSIONS.GIGS.CREATE, description: 'Create gig opportunities', category: PERMISSION_CATEGORIES.GIGS, tableName: 'gigs', operation: 'create' },
  { name: PERMISSIONS.GIGS.READ, description: 'View gig details', category: PERMISSION_CATEGORIES.GIGS, tableName: 'gigs', operation: 'read' },
  { name: PERMISSIONS.GIGS.UPDATE, description: 'Edit gig information', category: PERMISSION_CATEGORIES.GIGS, tableName: 'gigs', operation: 'update' },
  { name: PERMISSIONS.GIGS.DELETE, description: 'Cancel gig opportunities', category: PERMISSION_CATEGORIES.GIGS, tableName: 'gigs', operation: 'delete' },
  
  // Gig Applications
  { name: PERMISSIONS.GIG_APPLICATIONS.CREATE, description: 'Apply for gigs', category: PERMISSION_CATEGORIES.GIG_APPLICATIONS, tableName: 'gig_applications', operation: 'create' },
  { name: PERMISSIONS.GIG_APPLICATIONS.READ, description: 'View gig applications', category: PERMISSION_CATEGORIES.GIG_APPLICATIONS, tableName: 'gig_applications', operation: 'read' },
  { name: PERMISSIONS.GIG_APPLICATIONS.UPDATE, description: 'Modify gig applications', category: PERMISSION_CATEGORIES.GIG_APPLICATIONS, tableName: 'gig_applications', operation: 'update' },
  { name: PERMISSIONS.GIG_APPLICATIONS.DELETE, description: 'Withdraw gig applications', category: PERMISSION_CATEGORIES.GIG_APPLICATIONS, tableName: 'gig_applications', operation: 'delete' },
  
  // Users
  { name: PERMISSIONS.USERS.CREATE, description: 'Register new users', category: PERMISSION_CATEGORIES.USERS, tableName: 'users', operation: 'create' },
  { name: PERMISSIONS.USERS.READ, description: 'View user profiles', category: PERMISSION_CATEGORIES.USERS, tableName: 'users', operation: 'read' },
  { name: PERMISSIONS.USERS.UPDATE, description: 'Edit user profiles', category: PERMISSION_CATEGORIES.USERS, tableName: 'users', operation: 'update' },
  { name: PERMISSIONS.USERS.DELETE, description: 'Deactivate users', category: PERMISSION_CATEGORIES.USERS, tableName: 'users', operation: 'delete' },
  { name: PERMISSIONS.USERS.MANAGE_ROLES, description: 'Assign and revoke user roles', category: PERMISSION_CATEGORIES.USERS, tableName: 'user_roles', operation: 'manage' },
  { name: PERMISSIONS.USERS.READ_ROLES, description: 'View user roles', category: PERMISSION_CATEGORIES.USERS, tableName: 'user_roles', operation: 'read' },
  
  // System
  { name: PERMISSIONS.SYSTEM.READ_AUDIT_LOG, description: 'View audit logs', category: PERMISSION_CATEGORIES.SYSTEM, tableName: 'audit_log', operation: 'read' },
  { name: PERMISSIONS.SYSTEM.MANAGE_ROLES, description: 'Create and manage roles', category: PERMISSION_CATEGORIES.SYSTEM, tableName: 'roles', operation: 'manage' },
  { name: PERMISSIONS.SYSTEM.MANAGE_PERMISSIONS, description: 'Manage role permissions', category: PERMISSION_CATEGORIES.SYSTEM, tableName: 'role_permissions', operation: 'manage' },
  { name: PERMISSIONS.SYSTEM.READ_ANALYTICS, description: 'View platform analytics', category: PERMISSION_CATEGORIES.SYSTEM, tableName: 'analytics', operation: 'read' },
] as const;


// Type exports
export type Role = typeof roles.$inferSelect;
export type Action = typeof actions.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertAction = z.infer<typeof insertActionSchema>;

// Permission types
export type Permission = typeof ALL_PERMISSIONS[number];
export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];
export type RoleName = keyof typeof DEFAULT_ROLE_PERMISSIONS;
