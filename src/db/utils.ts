import { db } from "./config.js";
import { sql } from "drizzle-orm";

/**
 * Database utility functions for common operations
 */

// Health check function
export const healthCheck = async () => {
  try {
    const result = await db.execute(sql`SELECT 1 as health_check`);
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      result: result[0],
    };
  } catch (error) {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get database version
export const getDatabaseVersion = async () => {
  try {
    const result = await db.execute(sql`SELECT version()`);
    return result[0]?.version || "Unknown";
  } catch (error) {
    console.error("Failed to get database version:", error);
    return "Unknown";
  }
};

// Get table count for a specific table
export const getTableCount = async (tableName: string) => {
  try {
    const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${tableName}`));
    const countValue = result[0]?.count;
    return parseInt(String(countValue) || "0");
  } catch (error) {
    console.error(`Failed to get count for table ${tableName}:`, error);
    return 0;
  }
};

// Transaction wrapper for better error handling
export const withTransaction = async <T>(
  callback: (tx: any) => Promise<T>
): Promise<T> => {
  return await db.transaction(callback);
};

// Pagination helper
export const paginate = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Common query builders
export const queryHelpers = {
  // Find by ID
  findById: (table: any, id: number) =>
    db.select().from(table).where(sql`${table.id} = ${id}`).limit(1),

  // Find by field
  findByField: (table: any, field: any, value: any) =>
    db.select().from(table).where(sql`${field} = ${value}`),

  // Find active records (if table has isActive field)
  findActive: (table: any) => {
    if ('isActive' in table) {
      return db.select().from(table).where(sql`${table.isActive} = true`);
    }
    return db.select().from(table);
  },

  // Soft delete (if table has isActive field)
  softDelete: (table: any, id: number) => {
    if ('isActive' in table) {
      return db.update(table).set({ isActive: false }).where(sql`${table.id} = ${id}`);
    }
    throw new Error('Table does not support soft delete');
  },
};
