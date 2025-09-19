import { z } from "zod";

// Request Validation Schemas

// Login request
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Registration request
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  role: z.enum(["student", "artist", "studio_owner"]).default("student"),
  profilePic: z.string().url("Invalid URL format").or(z.literal("")).optional(),
  gender: z.string().optional(),
  instagram: z.string().optional(),
  height: z.string().optional(),
  bio: z.string().optional(),
});

// Password reset request
export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Password reset confirmation
export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Email verification
export const EmailVerificationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Profile update
export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  profilePic: z.string().url("Invalid URL format").or(z.literal("")).optional(),
  gender: z.string().optional(),
  instagram: z.string().optional(),
  height: z.string().optional(),
  bio: z.string().optional(),
});

// Password change
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Session query
export const SessionQuerySchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
});

// Response Schemas

// Better Auth user response (what Better Auth actually returns)
export const BetterAuthUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Add this new enriched user schema
export const EnrichedUserSchema = z.object({
  // Basic user fields
  id: z.string(),
  email: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  profilePic: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // New enriched fields from hooks
  permissions: z.array(z.string()).optional(),
  userType: z.enum(['artist', 'studio', 'student', 'basic']).optional(),
  recentActivity: z.object({
    classBookings: z.number(),
    studioBookings: z.number(),
    gigApplications: z.number(),
  }).optional(),

  // User type specific data
  artist: z.object({
    id: z.number(),
    userId: z.string(),
    // ... other artist fields
  }).optional(),
  studio: z.object({
    id: z.number(),
    userId: z.string(),
    // ... other studio fields
  }).optional(),
  student: z.object({
    id: z.number(),
    userId: z.string(),
    // ... other student fields
  }).optional(),
});

// Update the auth response to use enriched user
export const AuthResponseSchema = z.object({
  user: EnrichedUserSchema, // Changed from BetterAuthUserSchema
  session: z.object({
    id: z.string(),
    token: z.string(),
    expiresAt: z.date(),
  }),
});

// Update user profile response
export const UserProfileSchema = EnrichedUserSchema;

// Session info response
export const SessionInfoSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Error response
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.any()).optional(),
});

// Success message response
export const SuccessMessageSchema = z.object({
  message: z.string(),
});

// Type exports
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;
export type EmailVerification = z.infer<typeof EmailVerificationSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type PasswordChange = z.infer<typeof PasswordChangeSchema>;
export type SessionQuery = z.infer<typeof SessionQuerySchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type SessionInfo = z.infer<typeof SessionInfoSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessMessage = z.infer<typeof SuccessMessageSchema>;
