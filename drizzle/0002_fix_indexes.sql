DROP INDEX IF EXISTS "parts_brand_idx";
DROP INDEX IF EXISTS "parts_model_idx";
DROP INDEX IF EXISTS "parts_category_idx";
DROP INDEX IF EXISTS "parts_is_active_idx";
DROP INDEX IF EXISTS "parts_created_at_idx";
DROP INDEX IF EXISTS "parts_updated_at_idx";
DROP INDEX IF EXISTS "parts_brand_model_idx";
DROP INDEX IF EXISTS "parts_category_active_idx";

CREATE INDEX IF NOT EXISTS "parts_brand_idx" ON "parts" ("brand");
CREATE INDEX IF NOT EXISTS "parts_model_idx" ON "parts" ("model");
CREATE INDEX IF NOT EXISTS "parts_category_idx" ON "parts" ("category_id");
CREATE INDEX IF NOT EXISTS "parts_is_active_idx" ON "parts" ("is_active");
CREATE INDEX IF NOT EXISTS "parts_created_at_idx" ON "parts" ("created_at");
CREATE INDEX IF NOT EXISTS "parts_title_idx" ON "parts" ("title");
CREATE INDEX IF NOT EXISTS "parts_brand_model_idx" ON "parts" ("brand", "model");
CREATE INDEX IF NOT EXISTS "parts_category_active_idx" ON "parts" ("category_id", "is_active");
