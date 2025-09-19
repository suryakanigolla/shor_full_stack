import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, createAuthMiddleware } from "better-auth/plugins";
import { db } from "@/db/config";
import * as schema from "@/db/schemas";
import { eq } from "drizzle-orm";
import env from "@/env";

// Custom session plugin to enrich user data with relations
const customSessionPlugin = customSession(async ({ user, session }) => {
  try {
    // Fetch additional user data with relations
    const richUser = await db.query.users.findFirst({
      where: eq(schema.users.id, user.id),
      with: {
        // Include user roles and permissions
        userRoles: {
          with: {
            role: {
              with: {
                rolePermissions: {
                  with: {
                    action: true
                  }
                }
              }
            }
          }
        },
        // Include user type specific data
        artist: true,
        studio: true,
        student: true,
        // Include recent activity
        classBookings: {
          limit: 5,
          orderBy: (classBookings, { desc }) => [desc(classBookings.createdAt)]
        },
        studioBookings: {
          limit: 5,
          orderBy: (studioBookings, { desc }) => [desc(studioBookings.createdAt)]
        },
        gigApplications: {
          limit: 5,
          orderBy: (gigApplications, { desc }) => [desc(gigApplications.appliedAt)]
        }
      }
    });

    if (!richUser) {
      return { session, user };
    }

    // Format user data with permissions
    const formattedUser = {
      ...richUser,
      // Flatten permissions for easy access
      permissions: richUser.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.action.name)
      ),
      // Add user type information
      userType: richUser.artist ? 'artist' :
        richUser.studio ? 'studio' :
          richUser.student ? 'student' : 'basic',
      // Add recent activity summary
      recentActivity: {
        classBookings: richUser.classBookings.length,
        studioBookings: richUser.studioBookings.length,
        gigApplications: richUser.gigApplications.length
      }
    };

    return {
      session,
      user: formattedUser,
    };
  } catch (error) {
    console.error("Error enriching user session:", error);
    // Return basic user data if enrichment fails
    return { session, user };
  }
});

// Post-authentication middleware for logging and updates
const postAuthMiddleware = createAuthMiddleware(async (ctx) => {
  try {
    // Type assertion for the returned context
    const returned = ctx.context.returned as any;

    // Update last login time for successful sign-ins
    if (ctx.path?.includes("/sign-in") && returned?.user?.id) {
      await db.update(schema.users)
        .set({
          updatedAt: new Date(),
          // You could add a lastLoginAt field to track this
        })
        .where(eq(schema.users.id, returned.user.id));
    }

    // Log anonymous sign-ins for analytics
    if (ctx.path?.includes("/sign-in/anonymous")) {
      console.log("Anonymous user signed in:", {
        userId: returned?.user?.id,
        timestamp: new Date().toISOString()
      });
    }

    // Log OAuth sign-ins
    if (ctx.path?.includes("/callback/")) {
      const provider = ctx.path.split("/callback/")[1];
      console.log(`OAuth sign-in via ${provider}:`, {
        userId: returned?.user?.id,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in post-auth middleware:", error);
    // Don't throw - we don't want to break authentication
  }
});

export const auth = betterAuth({
  appName: "Shor Dance Studio",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled for testing
  },
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
        mapProfileToUser: async (profile) => {
          return {
            email: profile.email,
            name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
            profilePic: profile.picture,
          };
        },
      },
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      profilePic: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      instagram: {
        type: "string",
        required: false,
      },
      height: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") || [],
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
  // Add hooks for enhanced functionality
  hooks: {
    after: postAuthMiddleware,
  },
  // Add plugins for custom session handling
  plugins: [
    customSessionPlugin,
  ],
});

export type Auth = typeof auth;