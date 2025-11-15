CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"customer_name" varchar(200) NOT NULL,
	"customer_id" varchar(50),
	"customer_pdv" varchar(50),
	"customer_contact" varchar(200),
	"customer_address" text,
	"cart_data" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoice_number_idx" ON "invoices" ("invoice_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" ("created_at");