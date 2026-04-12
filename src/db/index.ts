import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.NODE_ENV !== "production") {
  console.warn("⚠️ DATABASE_URL environment variable is not set. Using fallback for local build.");
}

const finalDatabaseUrl = databaseUrl || "postgresql://postgres:postgres@localhost:5432/postgres";
neonConfig.poolQueryViaFetch = true;

const sql = neon(finalDatabaseUrl);

export const db = drizzle(sql, { schema });

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
    }
  }
  
  throw lastError || new Error("Unknown error occurred");
}
