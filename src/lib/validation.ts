import { z } from "zod";

export const partCreateSchema = z.object({
  sku: z.string().min(1),
  title: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  catalogNumber: z.string().optional(),
  application: z.string().optional(),
  delivery: z.enum(['available', '15_days', 'on_request']).default('available'),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  priceWithoutVAT: z.coerce.number().nonnegative().optional(),
  priceWithVAT: z.coerce.number().nonnegative().optional(),
  discount: z.coerce.number().min(0).max(100).default(0),
  currency: z.string().length(3).default("EUR"),
  stock: z.coerce.number().int().nonnegative().default(0),
  categoryId: z.coerce.number().int(),
  imageUrl: z.string().optional(),
  thumbUrl: z.string().optional(),
  spec1: z.string().optional(),
  spec2: z.string().optional(),
  spec3: z.string().optional(),
  spec4: z.string().optional(),
  spec5: z.string().optional(),
  spec6: z.string().optional(),
  spec7: z.string().optional(),
  specJson: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const partUpdateSchema = partCreateSchema.partial();