import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔄 Primjenjujem migracije...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY,
        "name" varchar(120) NOT NULL,
        "slug" varchar(140) NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now()
      )
    `;
    console.log("✅ Categories tabela kreirana ili već postoji");

    await sql`
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
      )
    `;
    console.log("✅ Parts tabela kreirana ili već postoji");

    console.log("🎉 Sve migracije primjenjene!");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Nepoznata greška";
    console.error("❌ Greška pri migraciji:", message);
    process.exit(1);
  }
}

migrate().finally(() => process.exit(0));
