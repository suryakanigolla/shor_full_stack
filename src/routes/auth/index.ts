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

const router = createRouter();

// Register auth routes
router.openapi(loginRoute, handlers.handleLogin);
router.openapi(registerRoute, handlers.handleRegister);
router.openapi(logoutRoute, handlers.handleLogout);
router.openapi(getProfileRoute, handlers.handleGetProfile);
router.openapi(updateProfileRoute, handlers.handleUpdateProfile);
router.openapi(changePasswordRoute, handlers.handleChangePassword);
router.openapi(getSessionsRoute, handlers.handleGetSessions);
router.openapi(revokeSessionRoute, handlers.handleRevokeSession);
router.openapi(revokeAllSessionsRoute, handlers.handleRevokeAllSessions);
router.openapi(forgotPasswordRoute, handlers.handlePasswordResetRequest);
router.openapi(resetPasswordRoute, handlers.handlePasswordResetConfirm);
router.openapi(verifyEmailRoute, handlers.handleEmailVerification);
router.openapi(resendVerificationRoute, handlers.handleResendVerification);

export type AuthRouter = typeof router;

export default router;
