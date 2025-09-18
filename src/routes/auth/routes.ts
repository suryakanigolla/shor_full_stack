import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { createRouter } from "@/lib/create-app";
import { z } from "zod";
import * as handlers from "./handlers";
import * as schemas from "./schemas";

const router = createRouter();

// POST /auth/login
router.openapi(
  createRoute({
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
  }),
  handlers.handleLogin
);

// POST /auth/register
router.openapi(
  createRoute({
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
  }),
  handlers.handleRegister
);

// POST /auth/logout
router.openapi(
  createRoute({
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
  }),
  handlers.handleLogout
);

// GET /auth/me
router.openapi(
  createRoute({
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
  }),
  handlers.handleGetProfile
);

// PUT /auth/me
router.openapi(
  createRoute({
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
  }),
  handlers.handleUpdateProfile
);

// POST /auth/change-password
router.openapi(
  createRoute({
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
  }),
  handlers.handleChangePassword
);

// GET /auth/sessions
router.openapi(
  createRoute({
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
  }),
  handlers.handleGetSessions
);

// DELETE /auth/sessions/:id
router.openapi(
  createRoute({
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
  }),
  handlers.handleRevokeSession
);

// DELETE /auth/sessions
router.openapi(
  createRoute({
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
  }),
  handlers.handleRevokeAllSessions
);

// POST /auth/forgot-password
router.openapi(
  createRoute({
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
  }),
  handlers.handlePasswordResetRequest
);

// POST /auth/reset-password
router.openapi(
  createRoute({
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
  }),
  handlers.handlePasswordResetConfirm
);

// POST /auth/verify-email
router.openapi(
  createRoute({
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
  }),
  handlers.handleEmailVerification
);

// POST /auth/resend-verification
router.openapi(
  createRoute({
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
  }),
  handlers.handleResendVerification
);

export default router;
