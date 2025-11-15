-- Kreiraj categories tabelu ako ne postoji
CREATE TABLE IF NOT EXISTS "categories" (
  "id" serial PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "slug" varchar(140) NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now()
);

-- Kreiraj parts tabelu ako ne postoji
CREATE TABLE IF NOT EXISTS "parts" (
  "id" serial PRIMARY KEY,
  "sku" varchar(64) NOT NULL UNIQUE,
  "title" varchar(200) NOT NULL,
  "description" text,
  "price" numeric(10, 2) NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'EUR',
  "stock" integer NOT NULL DEFAULT 0,
  "category_id" integer NOT NULL REFERENCES "categories"("id"),
  "image_url" text,
  "thumb_url" text,
  "spec_json" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Dodaj unique constraint na sku ako tabela već postoji ali nema constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'parts_sku_unique'
  ) THEN
    ALTER TABLE "parts" ADD CONSTRAINT "parts_sku_unique" UNIQUE ("sku");
  END IF;
END $$;

-- Dodaj unique constraint na slug ako tabela već postoji ali nema constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_unique'
  ) THEN
    ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE ("slug");
  END IF;
END $$;
