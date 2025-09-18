#!/usr/bin/env tsx

/**
 * Migration Script
 * 
 * This script handles database migrations:
 * - Generate migrations from schema changes
 * - Apply migrations to database
 * - Check migration status
 * 
 * Usage: 
 *   npm run db:migrate:generate  - Generate migrations
 *   npm run db:migrate:apply     - Apply migrations
 *   npm run db:migrate:status    - Check migration status
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { dropAllTables, runMigrations } from "../db/migrate.js";
import { testConnection, closeDatabase } from "../db/config.js";

const MIGRATIONS_DIR = "./src/db/migrations";

async function generateMigrations() {
  console.log("📝 Generating migrations from schema...");

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
}

async function applyMigrations() {
  console.log("🔄 Applying migrations...");

  try {
    await runMigrations();
    console.log("✅ Migrations applied successfully");
  } catch (error) {
    console.error("❌ Failed to apply migrations:", error);
    throw error;
  }
}

async function checkMigrationStatus() {
  console.log("📊 Checking migration status...");

  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Cannot connect to database");
      return false;
    }

    const hasMigrations = existsSync(MIGRATIONS_DIR);
    console.log(`Migrations directory exists: ${hasMigrations ? "✅" : "❌"}`);

    if (hasMigrations) {
      console.log("📁 Migration files found");
    } else {
      console.log("⚠️  No migration files found. Run 'npm run db:migrate:generate' first");
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to check migration status:", error);
    return false;
  }
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "generate":
        await generateMigrations();
        break;

      case "apply":
        await dropAllTables();
        await applyMigrations();
        break;

      case "status":
        await checkMigrationStatus();
        break;

      default:
        console.log("Usage:");
        console.log("  npm run db:migrate:generate  - Generate migrations from schema");
        console.log("  npm run db:migrate:apply     - Drop all tables and Apply migrations to database");
        console.log("  npm run db:migrate:status    - Check migration status");
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration script failed:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⚠️  Process interrupted. Closing database connection...");
  await closeDatabase();
  process.exit(0);
});

// Run the script
main().catch(async (error) => {
  console.error("💥 Unhandled error:", error);
  await closeDatabase();
  process.exit(1);
});
