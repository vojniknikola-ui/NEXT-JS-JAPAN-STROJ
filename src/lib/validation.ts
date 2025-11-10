import { z } from "zod";

export const partCreateSchema = z.object({
  sku: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  currency: z.string().length(3).default("EUR"),
  stock: z.coerce.number().int().nonnegative().default(0),
  categoryId: z.coerce.number().int(),
  imageUrl: z.string().url().optional(),
  thumbUrl: z.string().url().optional(),
  specJson: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const partUpdateSchema = partCreateSchema.partial();