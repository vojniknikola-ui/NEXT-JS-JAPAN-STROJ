import { sql } from "drizzle-orm";
import { db, withRetry } from "@/db";

let schemaReadyPromise: Promise<InvoiceColumnsState> | null = null;

type InvoiceColumnsState = {
  hasTable: boolean;
  hasStatus: boolean;
  hasSentAt: boolean;
};

async function createInvoicesTableIfMissing() {
  await withRetry(async () => {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id serial PRIMARY KEY,
        invoice_number varchar(50) NOT NULL,
        customer_name varchar(200) NOT NULL,
        customer_id varchar(50),
        customer_pdv varchar(50),
        customer_contact varchar(200),
        customer_address text,
        cart_data text NOT NULL,
        total_amount numeric(10, 2) NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'created',
        sent_at timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    await db.execute(
      sql`CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices (invoice_number)`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices (created_at)`
    );
  });
}

async function getInvoiceColumnsState(): Promise<InvoiceColumnsState> {
  try {
    const tableResult = await db.execute(
      sql`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = current_schema()
            AND table_name = 'invoices'
        ) AS exists
      `
    );

    const tableRow = (
      tableResult as { rows?: Array<{ exists?: unknown }> }
    ).rows?.[0];
    const tableExistsRaw = tableRow?.exists;
    const hasTable =
      tableExistsRaw === true ||
      tableExistsRaw === "t" ||
      tableExistsRaw === "true" ||
      tableExistsRaw === 1 ||
      tableExistsRaw === "1";

    if (!hasTable) {
      return {
        hasTable: false,
        hasStatus: false,
        hasSentAt: false,
      };
    }

    const result = await db.execute(
      sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'invoices'
          AND column_name IN ('status', 'sent_at')
      `
    );

    const rows =
      (result as { rows?: Array<{ column_name?: unknown }> }).rows ?? [];
    const names = new Set(
      rows
        .map((row) =>
          typeof row.column_name === "string" ? row.column_name : null
        )
        .filter((name): name is string => Boolean(name))
    );

    return {
      hasTable: true,
      hasStatus: names.has("status"),
      hasSentAt: names.has("sent_at"),
    };
  } catch (error) {
    console.warn("Invoice schema inspection failed:", error);
    return {
      hasTable: false,
      hasStatus: false,
      hasSentAt: false,
    };
  }
}

async function ensureSchemaInternal() {
  const existing = await getInvoiceColumnsState();

  if (!existing.hasTable) {
    try {
      await createInvoicesTableIfMissing();
      return await getInvoiceColumnsState();
    } catch (error) {
      console.warn("Invoice table auto-create skipped:", error);
      return existing;
    }
  }

  if (existing.hasStatus && existing.hasSentAt) {
    return existing;
  }

  try {
    await withRetry(async () => {
      if (!existing.hasStatus) {
        await db.execute(
          sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'created'`
        );
      }
      if (!existing.hasSentAt) {
        await db.execute(
          sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at timestamp`
        );
      }
    });
  } catch (error) {
    // Some production DB users do not have ALTER permission.
    // We keep API routes functional with fallback behavior when columns are absent.
    console.warn("Invoice schema auto-migration skipped:", error);
    return existing;
  }

  const after = await getInvoiceColumnsState();
  return after;
}

export async function ensureInvoiceColumns() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = ensureSchemaInternal().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return await schemaReadyPromise;
}
