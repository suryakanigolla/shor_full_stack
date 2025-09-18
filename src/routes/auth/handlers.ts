import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { users, userRoles, roles, sessions, artists, studios } from "@/db/schemas";
import { eq, and, desc } from "drizzle-orm";
import * as schemas from "./schemas";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import type { AppRouteHandler } from "@/lib/types";
import type {
  LoginRoute,
  RegisterRoute,
  LogoutRoute,
  GetProfileRoute,
  UpdateProfileRoute,
  ChangePasswordRoute,
  GetSessionsRoute,
  RevokeSessionRoute,
  RevokeAllSessionsRoute,
  ForgotPasswordRoute,
  ResetPasswordRoute,
  VerifyEmailRoute,
  ResendVerificationRoute,
} from "./routes";

// Login handler
export const handleLogin: AppRouteHandler<LoginRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = schemas.LoginRequestSchema.parse(body);

    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: new Headers(c.req.header()),
    });

    if (!result.token) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "Invalid credentials"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    return c.json(schemas.AuthResponseSchema.parse({
      user: result.user,
      session: {
        id: result.token,
        token: result.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    }), HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Registration handler
export const handleRegister: AppRouteHandler<RegisterRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const { role, ...userData } = schemas.RegisterRequestSchema.parse(body);

    console.log("Registration attempt for:", { email: userData.email, role });
    console.log("User data being sent to Better Auth:", userData);

    const result = await auth.api.signUpEmail({
      body: userData,
      headers: new Headers(c.req.header()),
    });

    console.log("Better Auth signUpEmail result:", result);

    // Check if registration was successful
    if (!result.user || !result.token) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "User creation failed",
        details: result
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Assign role to user
    console.log("Looking for role:", role);
    const roleRecord = await db.select().from(roles).where(eq(roles.name, role)).limit(1);
    console.log("Role record found:", roleRecord);

    if (roleRecord.length > 0 && roleRecord[0]) {
      console.log("Assigning role to user:", { userId: result.user.id, roleId: roleRecord[0].id });
      await db.insert(userRoles).values({
        userId: result.user.id, // No need to parse since it's now text
        roleId: roleRecord[0].id,
      });
      console.log("Role assigned successfully");
    } else {
      console.log("Role not found, skipping role assignment");
    }

    // Create user-type specific records based on role
    if (role === "artist") {
      console.log("Creating artist record for user:", result.user.id);
      await db.insert(artists).values({
        userId: result.user.id,
        bio: userData.bio || "Professional dancer",
        experience: 0, // Default to 0, can be updated later
        specialization: "Contemporary", // Default specialization
      });
      console.log("Artist record created successfully");
    } else if (role === "studio_owner") {
      console.log("Creating studio record for user:", result.user.id);
      await db.insert(studios).values({
        userId: result.user.id,
        name: userData.name,
        address: "To be updated", // Required field, user can update later
        city: "To be updated", // Required field, user can update later
        area: "To be updated", // Required field, user can update later
        capacity: 10, // Default capacity
        pricePerHour: 50000, // Default ₹500 per hour in paise
        contactPhone: userData.phone,
        contactEmail: userData.email,
      });
      console.log("Studio record created successfully");
    }

    console.log("Creating response with user:", result.user);
    const responseData = {
      user: result.user,
      session: {
        id: result.token,
        token: result.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    };
    console.log("Response data:", responseData);

    const validatedResponse = schemas.AuthResponseSchema.parse(responseData);
    console.log("Validated response:", validatedResponse);

    return c.json(validatedResponse, HttpStatusCodes.CREATED);
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Logout handler
export const handleLogout: AppRouteHandler<LogoutRoute> = async (c) => {
  try {
    await auth.api.signOut({
      headers: new Headers(c.req.header()),
    });

    return c.json({ message: "Logged out successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred"
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get current user profile
export const handleGetProfile: AppRouteHandler<GetProfileRoute> = async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });

    if (!session) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "No valid session found"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    if (user.length === 0) {
      return c.json({
        error: HttpStatusPhrases.NOT_FOUND,
        message: "User profile not found"
      }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(schemas.UserProfileSchema.parse(user[0]), HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred"
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Update profile
export const handleUpdateProfile: AppRouteHandler<UpdateProfileRoute> = async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });

    if (!session) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "No valid session found"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    const body = await c.req.json();
    const updateData = schemas.ProfileUpdateSchema.parse(body);

    const updatedUser = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning();

    if (updatedUser.length === 0) {
      return c.json({
        error: HttpStatusPhrases.NOT_FOUND,
        message: "User profile not found"
      }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(schemas.UserProfileSchema.parse(updatedUser[0]), HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Change password
export const handleChangePassword: AppRouteHandler<ChangePasswordRoute> = async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });

    if (!session) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "No valid session found"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    const body = await c.req.json();
    const { currentPassword, newPassword } = schemas.PasswordChangeSchema.parse(body);

    const result = await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: new Headers(c.req.header()),
    });

    if (!result.token) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid current password"
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json({ message: "Password changed successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get user sessions
export const handleGetSessions: AppRouteHandler<GetSessionsRoute> = async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });

    if (!session) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "No valid session found"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    const userSessions = await db.select().from(sessions)
      .where(eq(sessions.userId, session.user.id))
      .orderBy(desc(sessions.createdAt));

    return c.json(userSessions.map(s => schemas.SessionInfoSchema.parse(s)), HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred"
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Revoke session
export const handleRevokeSession: AppRouteHandler<RevokeSessionRoute> = async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });

    if (!session) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "No valid session found"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    const sessionId = c.req.param("id");
    if (!sessionId) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Session ID is required"
      }, HttpStatusCodes.BAD_REQUEST);
    }

    const deletedSessions = await db.delete(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, session.user.id)
      ))
      .returning();

    if (deletedSessions.length === 0) {
      return c.json({
        error: HttpStatusPhrases.NOT_FOUND,
        message: "Session not found or already revoked"
      }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: "Session revoked successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred"
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Revoke all sessions
export const handleRevokeAllSessions: AppRouteHandler<RevokeAllSessionsRoute> = async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });

    if (!session) {
      return c.json({
        error: HttpStatusPhrases.UNAUTHORIZED,
        message: "No valid session found"
      }, HttpStatusCodes.UNAUTHORIZED);
    }

    await db.delete(sessions)
      .where(eq(sessions.userId, session.user.id));

    return c.json({ message: "All sessions revoked successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred"
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Password reset request
export const handlePasswordResetRequest: AppRouteHandler<ForgotPasswordRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const { email } = schemas.PasswordResetRequestSchema.parse(body);

    const result = await auth.api.forgetPassword({
      body: { email },
      headers: new Headers(c.req.header()),
    });

    if (!result.status) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Failed to send password reset email"
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json({ message: "Password reset email sent" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Password reset confirmation
export const handlePasswordResetConfirm: AppRouteHandler<ResetPasswordRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const { token, password } = schemas.PasswordResetConfirmSchema.parse(body);

    const result = await auth.api.resetPassword({
      body: { newPassword: password, token },
      headers: new Headers(c.req.header()),
    });

    if (!result.status) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid or expired token"
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json({ message: "Password reset successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Email verification
export const handleEmailVerification: AppRouteHandler<VerifyEmailRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const { token } = schemas.EmailVerificationSchema.parse(body);

    const result = await auth.api.verifyEmail({
      query: { token },
      headers: new Headers(c.req.header()),
    });

    if (!result || !result.status) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid or expired token"
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json({ message: "Email verified successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Resend verification email
export const handleResendVerification: AppRouteHandler<ResendVerificationRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const { email } = schemas.PasswordResetRequestSchema.parse(body);

    const result = await auth.api.sendVerificationEmail({
      body: { email },
      headers: new Headers(c.req.header()),
    });

    if (!result.status) {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Failed to send verification email"
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json({ message: "Verification email sent" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({
        error: HttpStatusPhrases.BAD_REQUEST,
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({
      error: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
