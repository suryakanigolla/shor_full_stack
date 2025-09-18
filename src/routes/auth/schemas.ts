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

// User profile response (for our API responses)
export const UserProfileSchema = z.object({
  id: z.string(), // Changed to string to match Better Auth
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
});

// Session info response
export const SessionInfoSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Auth response (login/register)
export const AuthResponseSchema = z.object({
  user: BetterAuthUserSchema,
  session: z.object({
    id: z.string(),
    token: z.string(),
    expiresAt: z.date(),
  }),
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
