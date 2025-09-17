// Main database exports
export { db, connection, closeDatabase, testConnection } from "./config.js";
export type { Database, Connection } from "./config.js";

// Database utilities
export * from "./utils.js";

// Migration utilities
export * from "./migrate.js";

// Export all schemas and types for easy access
export * from "./schemas/index.js";
