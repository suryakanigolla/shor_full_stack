import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import env from "../env.js";
import * as schema from "./schemas/index.js";

// Database connection configuration
const connectionConfig = {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  transform: {
    undefined: null, // Transform undefined to null for PostgreSQL
  },
};

// Create the postgres connection
export const connection = postgres(env.DATABASE_URL, connectionConfig);

// Create the Drizzle database client with schema
export const db = drizzle(connection, { 
  schema,
  logger: env.NODE_ENV === "development", // Enable query logging in development
});

// Graceful shutdown function
export const closeDatabase = async () => {
  console.log("🔄 Closing database connection...");
  await connection.end();
  console.log("✅ Database connection closed");
};

// Test database connection
export const testConnection = async () => {
  try {
    await connection`SELECT 1 as test`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

// Export types
export type Database = typeof db;
export type Connection = typeof connection;
