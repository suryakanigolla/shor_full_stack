import { createRouter } from "@/lib/create-app";
import authRoutes from "./routes";

const router = createRouter();

// Mount auth routes
router.route("/auth", authRoutes);

export default router;
