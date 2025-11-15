CREATE TABLE "carts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"data" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spare_parts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "spare_parts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"catalog_number" text NOT NULL,
	"application" text NOT NULL,
	"delivery" text NOT NULL,
	"price_without_vat" real NOT NULL,
	"price_with_vat" real NOT NULL,
	"discount" real DEFAULT 0 NOT NULL,
	"image_url" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"spec1" text NOT NULL,
	"spec2" text NOT NULL,
	"spec3" text NOT NULL,
	"spec4" text NOT NULL,
	"spec5" text NOT NULL,
	"spec6" text NOT NULL,
	"spec7" text NOT NULL
);
