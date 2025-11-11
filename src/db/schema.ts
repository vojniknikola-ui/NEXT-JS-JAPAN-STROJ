import { pgTable, serial, varchar, integer, text, boolean, timestamp, numeric, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  catalogNumber: varchar("catalog_number", { length: 100 }),
  application: text("application"),
  delivery: varchar("delivery", { length: 20 }).default("available"),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  priceWithoutVAT: numeric("price_without_vat", { precision: 10, scale: 2 }),
  priceWithVAT: numeric("price_with_vat", { precision: 10, scale: 2 }),
  discount: numeric("discount", { precision: 5, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("BAM"),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  imageUrl: text("image_url"),
  thumbUrl: text("thumb_url"),
  spec1: text("spec_1"),
  spec2: text("spec_2"),
  spec3: text("spec_3"),
  spec4: text("spec_4"),
  spec5: text("spec_5"),
  spec6: text("spec_6"),
  spec7: text("spec_7"),
  specJson: text("spec_json"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  skuIdx: uniqueIndex("parts_sku_idx").on(table.sku),
  brandIdx: index("parts_brand_idx").on(table.brand),
  modelIdx: index("parts_model_idx").on(table.model),
  categoryIdx: index("parts_category_idx").on(table.categoryId),
  isActiveIdx: index("parts_is_active_idx").on(table.isActive),
  createdAtIdx: index("parts_created_at_idx").on(table.createdAt),
  titleIdx: index("parts_title_idx").on(table.title),
  brandModelIdx: index("parts_brand_model_idx").on(table.brand, table.model),
  categoryActiveIdx: index("parts_category_active_idx").on(table.categoryId, table.isActive),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  parts: many(parts),
}));

export const partsRelations = relations(parts, ({ one }) => ({
  category: one(categories, {
    fields: [parts.categoryId],
    references: [categories.id],
  }),
}));

export const carts = pgTable('carts', {
  id: text('id').primaryKey(), // cart ID from Vercel Blob
  userId: text('user_id'), // optional for future user accounts
  data: text('data').notNull(), // JSON string of cart items
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 200 }).notNull(),
  customerId: varchar('customer_id', { length: 50 }),
  customerPdv: varchar('customer_pdv', { length: 50 }),
  customerContact: varchar('customer_contact', { length: 200 }),
  customerAddress: text('customer_address'),
  cartData: text('cart_data').notNull(), // JSON string of cart items
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  invoiceNumberIdx: uniqueIndex('invoices_invoice_number_idx').on(table.invoiceNumber),
  createdAtIdx: index('invoices_created_at_idx').on(table.createdAt),
}));