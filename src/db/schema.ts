import { pgTable, serial, varchar, integer, text, boolean, timestamp, numeric, uniqueIndex } from "drizzle-orm/pg-core";
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
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  imageUrl: text("image_url"),
  thumbUrl: text("thumb_url"),
  specJson: text("spec_json"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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