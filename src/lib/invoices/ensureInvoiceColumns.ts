import { sql } from "drizzle-orm";
import { db, withRetry } from "@/db";

let schemaReadyPromise: Promise<void> | null = null;

async function ensureSchemaInternal() {
  await withRetry(async () => {
    await db.execute(
      sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'created'`
    );
    await db.execute(
      sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at timestamp`
    );
  });
}

export async function ensureInvoiceColumns() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = ensureSchemaInternal().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  await schemaReadyPromise;
}
