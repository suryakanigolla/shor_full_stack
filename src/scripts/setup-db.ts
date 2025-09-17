#!/usr/bin/env tsx

/**
 * Database Setup Script for Development
 * 
 * This script:
 * 1. Checks if running in development mode
 * 2. Drops all tables if in development
 * 3. Generates migrations from schema
 * 4. Applies migrations to create tables
 * 
 * Usage: npm run db:setup
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { join } from "path";
import env from "../env.js";
import { 
  dropAllTables, 
  runMigrations
} from "../db/migrate.js";
import { 
  testConnection,
  closeDatabase 
} from "../db/config.js";

const MIGRATIONS_DIR = "./src/db/migrations";

async function main() {
  console.log("🚀 Starting database setup...");
  
  // Check if we're in development mode
  if (env.NODE_ENV !== "development") {
    console.error("❌ This script can only be run in development mode");
    console.error(`Current NODE_ENV: ${env.NODE_ENV}`);
    process.exit(1);
  }

  try {
    // Step 1: Test database connection
    console.log("\n📡 Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Cannot connect to database. Please check your DATABASE_URL");
      process.exit(1);
    }

    // Step 2: Drop all tables in development
    console.log("\n🗑️  Dropping all existing tables...");
    await dropAllTables();

    // Step 3: Clean up existing migrations
    console.log("\n🧹 Cleaning up existing migrations...");
    if (existsSync(MIGRATIONS_DIR)) {
      rmSync(MIGRATIONS_DIR, { recursive: true, force: true });
      console.log("✅ Existing migrations cleaned up");
    }

    // Step 4: Generate migrations from schema
    console.log("\n📝 Generating migrations from schema...");
    try {
      execSync("npx drizzle-kit generate", { 
        stdio: "inherit",
        cwd: process.cwd()
      });
      console.log("✅ Migrations generated successfully");
    } catch (error) {
      console.error("❌ Failed to generate migrations:", error);
      throw error;
    }

    // Step 5: Apply migrations
    console.log("\n🔄 Applying migrations...");
    await runMigrations();

    // Step 6: Verify setup
    console.log("\n✅ Verifying database setup...");
    const isHealthy = await testConnection();
    if (isHealthy) {
      console.log("🎉 Database setup completed successfully!");
      console.log("\n📊 Database is ready for development");
    } else {
      console.error("❌ Database setup verification failed");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabase();
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⚠️  Process interrupted. Closing database connection...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⚠️  Process terminated. Closing database connection...");
  await closeDatabase();
  process.exit(0);
});

// Run the script
main().catch(async (error) => {
  console.error("💥 Unhandled error:", error);
  await closeDatabase();
  process.exit(1);
});
