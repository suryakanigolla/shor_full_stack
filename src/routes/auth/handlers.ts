import { Context } from "hono";
import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { users, userRoles, roles, sessions } from "@/db/schemas";
import { eq, and, desc } from "drizzle-orm";
import * as schemas from "./schemas";
import * as HttpStatusCodes from "stoker/http-status-codes";

// Login handler
export const handleLogin = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { email, password } = schemas.LoginRequestSchema.parse(body);
    
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: new Headers(c.req.header()),
    });
    
    if (!result.token) {
      return c.json({ 
        error: "Authentication failed", 
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
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Registration handler
export const handleRegister = async (c: Context) => {
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
        error: "Registration failed", 
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
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Logout handler
export const handleLogout = async (c: Context) => {
  try {
    await auth.api.signOut({
      headers: new Headers(c.req.header()),
    });
    
    return c.json({ message: "Logged out successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred" 
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get current user profile
export const handleGetProfile = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });
    
    if (!session) {
      return c.json({ 
        error: "Unauthorized", 
        message: "No valid session found" 
      }, HttpStatusCodes.UNAUTHORIZED);
    }
    
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    if (user.length === 0) {
      return c.json({ 
        error: "User not found", 
        message: "User profile not found" 
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.json(schemas.UserProfileSchema.parse(user[0]), HttpStatusCodes.OK);
  } catch (error) {
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred" 
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Update profile
export const handleUpdateProfile = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });
    
    if (!session) {
      return c.json({ 
        error: "Unauthorized", 
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
        error: "User not found", 
        message: "User profile not found" 
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.json(schemas.UserProfileSchema.parse(updatedUser[0]), HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ 
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Change password
export const handleChangePassword = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });
    
    if (!session) {
      return c.json({ 
        error: "Unauthorized", 
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
        error: "Password change failed", 
        message: "Invalid current password" 
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    return c.json({ message: "Password changed successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ 
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get user sessions
export const handleGetSessions = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });
    
    if (!session) {
      return c.json({ 
        error: "Unauthorized", 
        message: "No valid session found" 
      }, HttpStatusCodes.UNAUTHORIZED);
    }
    
    const userSessions = await db.select().from(sessions)
      .where(eq(sessions.userId, session.user.id))
      .orderBy(desc(sessions.createdAt));
    
    return c.json(userSessions.map(s => schemas.SessionInfoSchema.parse(s)), HttpStatusCodes.OK);
  } catch (error) {
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred" 
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Revoke session
export const handleRevokeSession = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });
    
    if (!session) {
      return c.json({ 
        error: "Unauthorized", 
        message: "No valid session found" 
      }, HttpStatusCodes.UNAUTHORIZED);
    }
    
    const sessionId = c.req.param("id");
    if (!sessionId) {
      return c.json({ 
        error: "Bad request", 
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
        error: "Not found", 
        message: "Session not found or already revoked" 
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.json({ message: "Session revoked successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred" 
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Revoke all sessions
export const handleRevokeAllSessions = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.header()),
    });
    
    if (!session) {
      return c.json({ 
        error: "Unauthorized", 
        message: "No valid session found" 
      }, HttpStatusCodes.UNAUTHORIZED);
    }
    
    await db.delete(sessions)
      .where(eq(sessions.userId, session.user.id));
    
    return c.json({ message: "All sessions revoked successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred" 
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Password reset request
export const handlePasswordResetRequest = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { email } = schemas.PasswordResetRequestSchema.parse(body);
    
    const result = await auth.api.forgetPassword({
      body: { email },
      headers: new Headers(c.req.header()),
    });
    
    if (!result.status) {
      return c.json({ 
        error: "Password reset failed", 
        message: "Failed to send password reset email" 
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    return c.json({ message: "Password reset email sent" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ 
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Password reset confirmation
export const handlePasswordResetConfirm = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { token, password } = schemas.PasswordResetConfirmSchema.parse(body);
    
    const result = await auth.api.resetPassword({
      body: { newPassword: password, token },
      headers: new Headers(c.req.header()),
    });
    
    if (!result.status) {
      return c.json({ 
        error: "Password reset failed", 
        message: "Invalid or expired token" 
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    return c.json({ message: "Password reset successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ 
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Email verification
export const handleEmailVerification = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { token } = schemas.EmailVerificationSchema.parse(body);
    
    const result = await auth.api.verifyEmail({
      query: { token },
      headers: new Headers(c.req.header()),
    });
    
    if (!result || !result.status) {
      return c.json({ 
        error: "Email verification failed", 
        message: "Invalid or expired token" 
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    return c.json({ message: "Email verified successfully" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ 
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Resend verification email
export const handleResendVerification = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { email } = schemas.PasswordResetRequestSchema.parse(body);
    
    const result = await auth.api.sendVerificationEmail({
      body: { email },
      headers: new Headers(c.req.header()),
    });
    
    if (!result.status) {
      return c.json({ 
        error: "Resend verification failed", 
        message: "Failed to send verification email" 
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    return c.json({ message: "Verification email sent" }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ 
        error: "Validation failed", 
        message: "Invalid input data",
        details: { validationError: error.message }
      }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred",
      details: { error: error instanceof Error ? error.message : "Unknown error" }
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
