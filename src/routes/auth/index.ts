import { createRouter } from "@/lib/create-app";
import * as handlers from "./handlers";
import {
  loginRoute,
  registerRoute,
  logoutRoute,
  getProfileRoute,
  updateProfileRoute,
  changePasswordRoute,
  getSessionsRoute,
  revokeSessionRoute,
  revokeAllSessionsRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  verifyEmailRoute,
  resendVerificationRoute,
} from "./routes";

const router = createRouter()
  .openapi(loginRoute, handlers.handleLogin)
  .openapi(registerRoute, handlers.handleRegister)
  .openapi(logoutRoute, handlers.handleLogout)
  .openapi(getProfileRoute, handlers.handleGetProfile)
  .openapi(updateProfileRoute, handlers.handleUpdateProfile)
  .openapi(changePasswordRoute, handlers.handleChangePassword)
  .openapi(getSessionsRoute, handlers.handleGetSessions)
  .openapi(revokeSessionRoute, handlers.handleRevokeSession)
  .openapi(revokeAllSessionsRoute, handlers.handleRevokeAllSessions)
  .openapi(forgotPasswordRoute, handlers.handlePasswordResetRequest)
  .openapi(resetPasswordRoute, handlers.handlePasswordResetConfirm)
  .openapi(verifyEmailRoute, handlers.handleEmailVerification)
  .openapi(resendVerificationRoute, handlers.handleResendVerification);


export type AuthRouter = typeof router;

export default router;
