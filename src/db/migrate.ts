import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connection } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import env from "../env.js";

/**
 * Database migration utilities
 */

// Create a migration client
const migrationClient = drizzle(connection);

// Run migrations
export const runMigrations = async () => {
  try {
    console.log("🔄 Running database migrations...");
    await migrate(migrationClient, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ Database migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Check if migrations are needed
export const checkMigrations = async () => {
  try {
    // This would check if there are pending migrations
    // Implementation depends on your migration strategy
    console.log("🔍 Checking for pending migrations...");
    return true;
  } catch (error) {
    console.error("❌ Failed to check migrations:", error);
    return false;
  }
};

// Drop all tables (for development only)
export const dropAllTables = async () => {
  if (env.NODE_ENV === "production") {
    throw new Error("Cannot drop tables in production environment");
  }

  try {
    console.log("⚠️  Dropping all tables...");
    await connection`DROP SCHEMA public CASCADE`;
    await connection`CREATE SCHEMA public`;
    console.log("✅ All tables dropped");
  } catch (error) {
    console.error("❌ Failed to drop tables:", error);
    throw error;
  }
};
