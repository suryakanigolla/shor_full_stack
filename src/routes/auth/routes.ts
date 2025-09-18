import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";
import * as schemas from "./schemas";

// Route definitions as constants
export const loginRoute = createRoute({
  tags: ["Authentication"],
  method: "post",
  path: "/login",
  summary: "User login",
  description: "Authenticate user with email and password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.LoginRequestSchema,
        },
      },
      description: "Login credentials",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.AuthResponseSchema,
      "Login successful"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid credentials"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const registerRoute = createRoute({
  tags: ["Authentication"],
  method: "post",
  path: "/register",
  summary: "User registration",
  description: "Register a new user account",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.RegisterRequestSchema,
        },
      },
      description: "Registration data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      schemas.AuthResponseSchema,
      "Registration successful"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid registration data or user already exists"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const logoutRoute = createRoute({
  tags: ["Authentication"],
  method: "post",
  path: "/logout",
  summary: "User logout",
  description: "Logout user and invalidate session",
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Logout successful"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Logout failed"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const getProfileRoute = createRoute({
  tags: ["User Profile"],
  method: "get",
  path: "/me",
  summary: "Get current user profile",
  description: "Retrieve the current authenticated user's profile",
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.UserProfileSchema,
      "User profile retrieved successfully"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "No valid session found"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      schemas.ErrorResponseSchema,
      "User profile not found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const updateProfileRoute = createRoute({
  tags: ["User Profile"],
  method: "put",
  path: "/me",
  summary: "Update user profile",
  description: "Update the current authenticated user's profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.ProfileUpdateSchema,
        },
      },
      description: "Profile update data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.UserProfileSchema,
      "Profile updated successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "No valid session found"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      schemas.ErrorResponseSchema,
      "User profile not found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const changePasswordRoute = createRoute({
  tags: ["User Profile"],
  method: "post",
  path: "/change-password",
  summary: "Change user password",
  description: "Change the current authenticated user's password",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.PasswordChangeSchema,
        },
      },
      description: "Password change data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Password changed successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data or password change failed"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "No valid session found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const getSessionsRoute = createRoute({
  tags: ["Session Management"],
  method: "get",
  path: "/sessions",
  summary: "Get user sessions",
  description: "Retrieve all active sessions for the current user",
  security: [{ bearerAuth: [] }],
  request: {
    query: schemas.SessionQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(schemas.SessionInfoSchema),
      "Sessions retrieved successfully"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "No valid session found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const revokeSessionRoute = createRoute({
  tags: ["Session Management"],
  method: "delete",
  path: "/sessions/{id}",
  summary: "Revoke specific session",
  description: "Revoke a specific session by ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().min(1, "Session ID is required"),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Session revoked successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Session ID is required"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "No valid session found"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      schemas.ErrorResponseSchema,
      "Session not found or already revoked"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const revokeAllSessionsRoute = createRoute({
  tags: ["Session Management"],
  method: "delete",
  path: "/sessions",
  summary: "Revoke all sessions",
  description: "Revoke all sessions for the current user",
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "All sessions revoked successfully"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      schemas.ErrorResponseSchema,
      "No valid session found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const forgotPasswordRoute = createRoute({
  tags: ["Password Management"],
  method: "post",
  path: "/forgot-password",
  summary: "Request password reset",
  description: "Send password reset email to user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.PasswordResetRequestSchema,
        },
      },
      description: "Password reset request data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Password reset email sent"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data or password reset failed"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const resetPasswordRoute = createRoute({
  tags: ["Password Management"],
  method: "post",
  path: "/reset-password",
  summary: "Reset password with token",
  description: "Reset user password using verification token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.PasswordResetConfirmSchema,
        },
      },
      description: "Password reset confirmation data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Password reset successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data or password reset failed"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const verifyEmailRoute = createRoute({
  tags: ["Email Verification"],
  method: "post",
  path: "/verify-email",
  summary: "Verify email address",
  description: "Verify user email address with token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.EmailVerificationSchema,
        },
      },
      description: "Email verification data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Email verified successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data or email verification failed"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

export const resendVerificationRoute = createRoute({
  tags: ["Email Verification"],
  method: "post",
  path: "/resend-verification",
  summary: "Resend verification email",
  description: "Resend email verification to user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.PasswordResetRequestSchema,
        },
      },
      description: "Resend verification request data",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schemas.SuccessMessageSchema,
      "Verification email sent"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      schemas.ErrorResponseSchema,
      "Invalid input data or resend verification failed"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      schemas.ErrorResponseSchema,
      "Internal server error"
    ),
  },
});

// Export route types
export type LoginRoute = typeof loginRoute;
export type RegisterRoute = typeof registerRoute;
export type LogoutRoute = typeof logoutRoute;
export type GetProfileRoute = typeof getProfileRoute;
export type UpdateProfileRoute = typeof updateProfileRoute;
export type ChangePasswordRoute = typeof changePasswordRoute;
export type GetSessionsRoute = typeof getSessionsRoute;
export type RevokeSessionRoute = typeof revokeSessionRoute;
export type RevokeAllSessionsRoute = typeof revokeAllSessionsRoute;
export type ForgotPasswordRoute = typeof forgotPasswordRoute;
export type ResetPasswordRoute = typeof resetPasswordRoute;
export type VerifyEmailRoute = typeof verifyEmailRoute;
export type ResendVerificationRoute = typeof resendVerificationRoute;

