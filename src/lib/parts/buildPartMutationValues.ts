import { partImages, parts } from "@/db/schema";
import type { ensureCatalogSchema } from "@/lib/parts/ensureCatalogSchema";

type CatalogSchemaState = Awaited<ReturnType<typeof ensureCatalogSchema>>;

type PartMutationInput = {
  sku?: string;
  title?: string;
  brand?: string;
  model?: string;
  catalogNumber?: string;
  application?: string;
  delivery?: string;
  description?: string;
  price?: number;
  priceWithoutVAT?: number;
  priceWithVAT?: number;
  discount?: number;
  currency?: string;
  stock?: number;
  categoryId?: number;
  imageUrl?: string | null;
  thumbUrl?: string | null;
  blurData?: string | null;
  spec1?: string;
  spec2?: string;
  spec3?: string;
  spec4?: string;
  spec5?: string;
  spec6?: string;
  spec7?: string;
  specJson?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type PartImageInput = {
  url: string;
  thumbUrl?: string;
  blurData?: string;
};

export function canWriteParts(schemaState: CatalogSchemaState) {
  return (
    schemaState.hasPartsTable &&
    schemaState.partsColumns.has("sku") &&
    schemaState.partsColumns.has("title") &&
    schemaState.partsColumns.has("price") &&
    schemaState.partsColumns.has("category_id")
  );
}

export function canPersistAdditionalImages(schemaState: CatalogSchemaState) {
  return (
    schemaState.hasPartImagesTable &&
    schemaState.partImagesColumns.has("part_id") &&
    schemaState.partImagesColumns.has("url")
  );
}

export function buildPartMutationValues(
  schemaState: CatalogSchemaState,
  data: PartMutationInput
): Partial<typeof parts.$inferInsert> {
  const values: Partial<typeof parts.$inferInsert> = {};

  if (schemaState.partsColumns.has("sku") && data.sku !== undefined) values.sku = data.sku;
  if (schemaState.partsColumns.has("title") && data.title !== undefined) values.title = data.title;
  if (schemaState.partsColumns.has("brand") && data.brand !== undefined) values.brand = data.brand;
  if (schemaState.partsColumns.has("model") && data.model !== undefined) values.model = data.model;
  if (schemaState.partsColumns.has("catalog_number") && data.catalogNumber !== undefined) {
    values.catalogNumber = data.catalogNumber;
  }
  if (schemaState.partsColumns.has("application") && data.application !== undefined) {
    values.application = data.application;
  }
  if (schemaState.partsColumns.has("delivery") && data.delivery !== undefined) {
    values.delivery = data.delivery;
  }
  if (schemaState.partsColumns.has("description") && data.description !== undefined) {
    values.description = data.description;
  }
  if (schemaState.partsColumns.has("price") && data.price !== undefined) {
    values.price = data.price.toString();
  }
  if (schemaState.partsColumns.has("price_without_vat") && data.priceWithoutVAT !== undefined) {
    values.priceWithoutVAT = data.priceWithoutVAT.toString();
  }
  if (schemaState.partsColumns.has("price_with_vat") && data.priceWithVAT !== undefined) {
    values.priceWithVAT = data.priceWithVAT.toString();
  }
  if (schemaState.partsColumns.has("discount") && data.discount !== undefined) {
    values.discount = data.discount.toString();
  }
  if (schemaState.partsColumns.has("currency") && data.currency !== undefined) {
    values.currency = data.currency;
  }
  if (schemaState.partsColumns.has("stock") && data.stock !== undefined) values.stock = data.stock;
  if (schemaState.partsColumns.has("category_id") && data.categoryId !== undefined) {
    values.categoryId = data.categoryId;
  }
  if (schemaState.partsColumns.has("image_url") && data.imageUrl !== undefined) {
    values.imageUrl = data.imageUrl;
  }
  if (schemaState.partsColumns.has("thumb_url") && data.thumbUrl !== undefined) {
    values.thumbUrl = data.thumbUrl;
  }
  if (schemaState.partsColumns.has("blur_data") && data.blurData !== undefined) {
    values.blurData = data.blurData;
  }
  if (schemaState.partsColumns.has("spec_1") && data.spec1 !== undefined) values.spec1 = data.spec1;
  if (schemaState.partsColumns.has("spec_2") && data.spec2 !== undefined) values.spec2 = data.spec2;
  if (schemaState.partsColumns.has("spec_3") && data.spec3 !== undefined) values.spec3 = data.spec3;
  if (schemaState.partsColumns.has("spec_4") && data.spec4 !== undefined) values.spec4 = data.spec4;
  if (schemaState.partsColumns.has("spec_5") && data.spec5 !== undefined) values.spec5 = data.spec5;
  if (schemaState.partsColumns.has("spec_6") && data.spec6 !== undefined) values.spec6 = data.spec6;
  if (schemaState.partsColumns.has("spec_7") && data.spec7 !== undefined) values.spec7 = data.spec7;
  if (schemaState.partsColumns.has("spec_json") && data.specJson !== undefined) values.specJson = data.specJson;
  if (schemaState.partsColumns.has("is_active") && data.isActive !== undefined) {
    values.isActive = data.isActive;
  }
  if (schemaState.partsColumns.has("created_at") && data.createdAt !== undefined) {
    values.createdAt = data.createdAt;
  }
  if (schemaState.partsColumns.has("updated_at") && data.updatedAt !== undefined) {
    values.updatedAt = data.updatedAt;
  }

  return values;
}

export function buildAdditionalImageRows(
  schemaState: CatalogSchemaState,
  partId: number,
  images: PartImageInput[]
): Array<typeof partImages.$inferInsert> {
  if (!canPersistAdditionalImages(schemaState)) {
    return [];
  }

  return images.map((image, index) => {
    const row: typeof partImages.$inferInsert = {
      partId,
      url: image.url,
    };

    if (schemaState.partImagesColumns.has("thumb_url") && image.thumbUrl !== undefined) {
      row.thumbUrl = image.thumbUrl;
    }
    if (schemaState.partImagesColumns.has("blur_data") && image.blurData !== undefined) {
      row.blurData = image.blurData;
    }
    if (schemaState.partImagesColumns.has("order")) {
      row.order = index + 1;
    }

    return row;
  });
}
