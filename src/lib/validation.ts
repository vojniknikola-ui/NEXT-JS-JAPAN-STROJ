import { z } from "zod";

export const partCreateSchema = z.object({
  sku: z.string()
    .trim()
    .min(1, "SKU je obavezan")
    .max(64, "SKU ne može biti duži od 64 karaktera"),
  title: z.string()
    .min(1, "Naziv je obavezan")
    .max(200, "Naziv ne može biti duži od 200 karaktera")
    .trim(),
  brand: z.string()
    .max(100, "Marka ne može biti duža od 100 karaktera")
    .optional(),
  model: z.string()
    .max(100, "Model ne može biti duži od 100 karaktera")
    .optional(),
  catalogNumber: z.string()
    .max(100, "Kataloški broj ne može biti duži od 100 karaktera")
    .optional(),
  application: z.string()
    .max(500, "Primjena ne može biti duža od 500 karaktera")
    .optional(),
  delivery: z.enum(['available', '15_days', 'on_request']).default('available'),
  description: z.string()
    .max(2000, "Opis ne može biti duži od 2000 karaktera")
    .optional(),
  price: z.coerce.number().nonnegative("Cijena ne može biti negativna"),
  priceWithoutVAT: z.coerce.number()
    .nonnegative("Cijena bez PDV-a ne može biti negativna")
    .optional(),
  priceWithVAT: z.coerce.number()
    .nonnegative("Cijena sa PDV-om ne može biti negativna")
    .optional(),
  discount: z.coerce.number().min(0, "Popust ne može biti manji od 0%")
    .max(100, "Popust ne može biti veći od 100%")
    .default(0),
  currency: z.string()
    .trim()
    .length(3, "Valuta mora imati tačno 3 karaktera")
    .regex(/^[A-Za-z]{3}$/, "Valuta mora biti u formatu XXX (npr. BAM, EUR)")
    .transform((value) => value.toUpperCase())
    .default("BAM"),
  stock: z.coerce.number().int("Zaliha mora biti cijeli broj")
    .nonnegative("Zaliha ne može biti negativna")
    .default(0),
  categoryId: z.coerce.number().int("ID kategorije mora biti cijeli broj")
    .positive("ID kategorije mora biti pozitivan broj"),
  categorySlug: z.string()
    .trim()
    .max(140, "Slug kategorije ne može biti duži od 140 karaktera")
    .optional(),
  categoryName: z.string()
    .trim()
    .max(120, "Naziv kategorije ne može biti duži od 120 karaktera")
    .optional(),
  imageUrl: z
    .union([
      z.string().url("URL slike mora biti validan"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  thumbUrl: z
    .union([
      z.string().url("URL thumbnail-a mora biti validan"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  blurData: z.string().optional(),
  additionalImages: z.array(z.object({
    url: z.string().url(),
    thumbUrl: z.string().url().optional(),
    blurData: z.string().optional(),
  })).max(4, "Možete dodati najviše 4 dodatne slike (ukupno 5)").optional(),
  spec1: z.string().max(255, "Specifikacija 1 ne može biti duža od 255 karaktera").optional(),
  spec2: z.string().max(255, "Specifikacija 2 ne može biti duža od 255 karaktera").optional(),
  spec3: z.string().max(255, "Specifikacija 3 ne može biti duža od 255 karaktera").optional(),
  spec4: z.string().max(255, "Specifikacija 4 ne može biti duža od 255 karaktera").optional(),
  spec5: z.string().max(255, "Specifikacija 5 ne može biti duža od 255 karaktera").optional(),
  spec6: z.string().max(255, "Specifikacija 6 ne može biti duža od 255 karaktera").optional(),
  spec7: z.string().max(255, "Specifikacija 7 ne može biti duža od 255 karaktera").optional(),
  specJson: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const partUpdateSchema = partCreateSchema.partial();
