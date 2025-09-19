import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { PinoLogger } from "hono-pino";
import type { auth } from "./auth";

// Better Auth type inference
type AuthUser = typeof auth.$Infer.Session.user;
type AuthSession = typeof auth.$Infer.Session.session;

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    user: AuthUser | null;
    session: AuthSession | null;
  };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

// Export auth types for convenience
export type { AuthUser, AuthSession };

// Utility types for auth context
export type AuthenticatedContext = AppBindings['Variables'] & {
  user: AuthUser;
  session: AuthSession;
};

export type UnauthenticatedContext = AppBindings['Variables'] & {
  user: null;
  session: null;
};

// Type guard helpers
export const isAuthenticated = (context: AppBindings['Variables']): context is AuthenticatedContext => {
  return context.user !== null && context.session !== null;
};

export const isUnauthenticated = (context: AppBindings['Variables']): context is UnauthenticatedContext => {
  return context.user === null && context.session === null;
};