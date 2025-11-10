import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const spareParts = sqliteTable('spare_parts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  catalogNumber: text('catalog_number').notNull(),
  application: text('application').notNull(),
  delivery: text('delivery').notNull(), // 'available', '15_days', 'on_request'
  priceWithoutVAT: real('price_without_vat').notNull(),
  priceWithVAT: real('price_with_vat').notNull(),
  discount: real('discount').notNull().default(0),
  imageUrl: text('image_url').notNull(),
  spec1: text('spec1').notNull(),
  spec2: text('spec2').notNull(),
  spec3: text('spec3').notNull(),
  spec4: text('spec4').notNull(),
  spec5: text('spec5').notNull(),
  spec6: text('spec6').notNull(),
  spec7: text('spec7').notNull(),
});