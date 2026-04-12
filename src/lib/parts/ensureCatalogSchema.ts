import { sql } from "drizzle-orm";
import { db, withRetry } from "@/db";

type CatalogSchemaState = {
  hasCategoriesTable: boolean;
  hasPartsTable: boolean;
  hasPartImagesTable: boolean;
  hasLegacySparePartsTable: boolean;
  categoryColumns: Set<string>;
  partsColumns: Set<string>;
  partImagesColumns: Set<string>;
};

let schemaReadyPromise: Promise<CatalogSchemaState> | null = null;

function isDbTruthy(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

async function inspectCatalogSchema(): Promise<CatalogSchemaState> {
  try {
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name IN ('categories', 'parts', 'part_images', 'spare_parts')
    `);

    const columnsResult = await db.execute(sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name IN ('categories', 'parts', 'part_images')
    `);

    const tableRows =
      (tablesResult as { rows?: Array<{ table_name?: unknown }> }).rows ?? [];
    const tables = new Set(
      tableRows
        .map((row) => (typeof row.table_name === "string" ? row.table_name : null))
        .filter((name): name is string => Boolean(name))
    );

    const columnRows =
      (columnsResult as {
        rows?: Array<{ table_name?: unknown; column_name?: unknown }>;
      }).rows ?? [];

    const categoryColumns = new Set<string>();
    const partsColumns = new Set<string>();
    const partImagesColumns = new Set<string>();

    for (const row of columnRows) {
      if (typeof row.table_name !== "string" || typeof row.column_name !== "string") {
        continue;
      }

      if (row.table_name === "categories") categoryColumns.add(row.column_name);
      if (row.table_name === "parts") partsColumns.add(row.column_name);
      if (row.table_name === "part_images") partImagesColumns.add(row.column_name);
    }

    return {
      hasCategoriesTable: tables.has("categories"),
      hasPartsTable: tables.has("parts"),
      hasPartImagesTable: tables.has("part_images"),
      hasLegacySparePartsTable: tables.has("spare_parts"),
      categoryColumns,
      partsColumns,
      partImagesColumns,
    };
  } catch (error) {
    console.warn("Catalog schema inspection failed:", error);
    return {
      hasCategoriesTable: false,
      hasPartsTable: false,
      hasPartImagesTable: false,
      hasLegacySparePartsTable: false,
      categoryColumns: new Set<string>(),
      partsColumns: new Set<string>(),
      partImagesColumns: new Set<string>(),
    };
  }
}

async function ensureDefaultCategoryId(): Promise<number> {
  const existingResult = await db.execute(sql`
    SELECT id
    FROM categories
    WHERE slug = 'ostalo'
    LIMIT 1
  `);

  const existingRow = (
    existingResult as { rows?: Array<{ id?: unknown }> }
  ).rows?.[0];
  if (existingRow?.id !== undefined && existingRow.id !== null) {
    return Number(existingRow.id);
  }

  const insertedResult = await db.execute(sql`
    INSERT INTO categories (name, slug)
    VALUES ('Ostalo', 'ostalo')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `);

  const insertedRow = (
    insertedResult as { rows?: Array<{ id?: unknown }> }
  ).rows?.[0];

  return Number(insertedRow?.id ?? 1);
}

async function createTablesIfMissing(state: CatalogSchemaState) {
  if (!state.hasCategoriesTable) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id serial PRIMARY KEY,
        name varchar(120) NOT NULL,
        slug varchar(140) NOT NULL UNIQUE,
        created_at timestamp DEFAULT now(),
        deleted_at timestamp
      )
    `);
  }

  if (!state.hasPartsTable) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS parts (
        id serial PRIMARY KEY,
        sku varchar(64) NOT NULL UNIQUE,
        title varchar(200) NOT NULL,
        brand varchar(100),
        model varchar(100),
        catalog_number varchar(100),
        application text,
        delivery varchar(20) DEFAULT 'available',
        description text,
        price numeric(10, 2) NOT NULL,
        price_without_vat numeric(10, 2),
        price_with_vat numeric(10, 2),
        discount numeric(5, 2) DEFAULT '0',
        currency varchar(3) NOT NULL DEFAULT 'BAM',
        stock integer NOT NULL DEFAULT 0,
        category_id integer REFERENCES categories(id),
        image_url text,
        thumb_url text,
        blur_data text,
        spec_1 text,
        spec_2 text,
        spec_3 text,
        spec_4 text,
        spec_5 text,
        spec_6 text,
        spec_7 text,
        spec_json text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        deleted_at timestamp
      )
    `);
  }

  if (!state.hasPartImagesTable) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS part_images (
        id serial PRIMARY KEY,
        part_id integer NOT NULL REFERENCES parts(id),
        url text NOT NULL,
        thumb_url text,
        blur_data text,
        "order" integer DEFAULT 0,
        created_at timestamp DEFAULT now()
      )
    `);
  }
}

async function ensureCatalogColumns(state: CatalogSchemaState) {
  if (!state.categoryColumns.has("deleted_at")) {
    await db.execute(sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at timestamp`);
  }

  const partColumnStatements = [
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS brand varchar(100)`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS model varchar(100)`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS catalog_number varchar(100)`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS application text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS delivery varchar(20) DEFAULT 'available'`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS description text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS price_without_vat numeric(10, 2)`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS price_with_vat numeric(10, 2)`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS discount numeric(5, 2) DEFAULT '0'`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'BAM'`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS category_id integer REFERENCES categories(id)`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS image_url text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS thumb_url text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS blur_data text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_1 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_2 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_3 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_4 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_5 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_6 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_7 text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS spec_json text`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now()`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`,
    sql`ALTER TABLE parts ADD COLUMN IF NOT EXISTS deleted_at timestamp`,
  ];

  for (const statement of partColumnStatements) {
    await db.execute(statement);
  }

  const partImagesColumnStatements = [
    sql`ALTER TABLE part_images ADD COLUMN IF NOT EXISTS thumb_url text`,
    sql`ALTER TABLE part_images ADD COLUMN IF NOT EXISTS blur_data text`,
    sql`ALTER TABLE part_images ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0`,
    sql`ALTER TABLE part_images ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now()`,
  ];

  for (const statement of partImagesColumnStatements) {
    await db.execute(statement);
  }
}

async function migrateLegacySpareParts(state: CatalogSchemaState) {
  if (!state.hasLegacySparePartsTable) return;

  const legacyCountResult = await db.execute(sql`
    SELECT COUNT(*) AS count
    FROM spare_parts
  `);
  const legacyCountRow = (
    legacyCountResult as { rows?: Array<{ count?: unknown }> }
  ).rows?.[0];
  const legacyCount = Number(legacyCountRow?.count ?? 0);

  if (!Number.isFinite(legacyCount) || legacyCount <= 0) return;

  const defaultCategoryId = await ensureDefaultCategoryId();

  await db.execute(sql`
    INSERT INTO parts (
      sku,
      title,
      brand,
      model,
      catalog_number,
      application,
      delivery,
      price,
      price_without_vat,
      price_with_vat,
      discount,
      currency,
      stock,
      category_id,
      image_url,
      spec_1,
      spec_2,
      spec_3,
      spec_4,
      spec_5,
      spec_6,
      spec_7,
      is_active,
      created_at,
      updated_at
    )
    SELECT
      COALESCE(NULLIF(sp.catalog_number, ''), 'LEGACY-' || sp.id::text) AS sku,
      sp.name AS title,
      sp.brand,
      sp.model,
      sp.catalog_number,
      sp.application,
      COALESCE(NULLIF(sp.delivery, ''), 'available') AS delivery,
      COALESCE(sp.price_with_vat::numeric, sp.price_without_vat::numeric, 0::numeric) AS price,
      sp.price_without_vat::numeric,
      sp.price_with_vat::numeric,
      COALESCE(sp.discount::numeric, 0::numeric) AS discount,
      'EUR' AS currency,
      COALESCE(sp.stock, 0) AS stock,
      ${defaultCategoryId} AS category_id,
      sp.image_url,
      sp.spec1,
      sp.spec2,
      sp.spec3,
      sp.spec4,
      sp.spec5,
      sp.spec6,
      sp.spec7,
      true AS is_active,
      now() AS created_at,
      now() AS updated_at
    FROM spare_parts sp
    WHERE NOT EXISTS (
      SELECT 1
      FROM parts p
      WHERE p.sku = COALESCE(NULLIF(sp.catalog_number, ''), 'LEGACY-' || sp.id::text)
    )
  `);
}

async function normalizeCatalogData() {
  const defaultCategoryId = await ensureDefaultCategoryId();

  await db.execute(sql`
    UPDATE parts
    SET
      category_id = COALESCE(category_id, ${defaultCategoryId}),
      currency = COALESCE(NULLIF(currency, ''), 'BAM'),
      delivery = COALESCE(NULLIF(delivery, ''), 'available'),
      stock = COALESCE(stock, 0),
      discount = COALESCE(discount, 0),
      is_active = COALESCE(is_active, true),
      created_at = COALESCE(created_at, now()),
      updated_at = COALESCE(updated_at, created_at, now())
    WHERE
      category_id IS NULL OR
      currency IS NULL OR currency = '' OR
      delivery IS NULL OR delivery = '' OR
      stock IS NULL OR
      discount IS NULL OR
      is_active IS NULL OR
      created_at IS NULL OR
      updated_at IS NULL
  `);
}

async function ensureIndexes() {
  const indexStatements = [
    sql`CREATE UNIQUE INDEX IF NOT EXISTS parts_sku_idx ON parts (sku)`,
    sql`CREATE INDEX IF NOT EXISTS parts_brand_idx ON parts (brand)`,
    sql`CREATE INDEX IF NOT EXISTS parts_model_idx ON parts (model)`,
    sql`CREATE INDEX IF NOT EXISTS parts_category_idx ON parts (category_id)`,
    sql`CREATE INDEX IF NOT EXISTS parts_is_active_idx ON parts (is_active)`,
    sql`CREATE INDEX IF NOT EXISTS parts_created_at_idx ON parts (created_at)`,
    sql`CREATE INDEX IF NOT EXISTS parts_title_idx ON parts (title)`,
    sql`CREATE INDEX IF NOT EXISTS parts_brand_model_idx ON parts (brand, model)`,
    sql`CREATE INDEX IF NOT EXISTS parts_category_active_idx ON parts (category_id, is_active)`,
  ];

  for (const statement of indexStatements) {
    try {
      await db.execute(statement);
    } catch (error) {
      console.warn("Catalog index ensure skipped:", error);
    }
  }
}

async function ensureSchemaInternal(): Promise<CatalogSchemaState> {
  const existing = await inspectCatalogSchema();

  try {
    await withRetry(async () => {
      await createTablesIfMissing(existing);
      await ensureCatalogColumns(existing);
      await migrateLegacySpareParts(existing);
      await normalizeCatalogData();
      await ensureIndexes();
    });
  } catch (error) {
    // Some production DB users may have read-only credentials. The API will
    // still try to operate against whatever schema is already available.
    console.warn("Catalog schema auto-migration skipped:", error);
    return existing;
  }

  return await inspectCatalogSchema();
}

export async function ensureCatalogSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = ensureSchemaInternal().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  return await schemaReadyPromise;
}

export async function catalogSchemaHasCoreTables() {
  const state = await ensureCatalogSchema();
  return (
    state.hasCategoriesTable ||
    state.hasPartsTable ||
    state.hasLegacySparePartsTable ||
    isDbTruthy(state.hasPartImagesTable)
  );
}
