import { z } from "zod";

export const partCreateSchema = z.object({
  sku: z.string()
    .min(1, "SKU je obavezan")
    .max(64, "SKU ne može biti duži od 64 karaktera")
    .regex(/^[A-Z0-9-_]+$/, "SKU može sadržavati samo velika slova, brojeve, crtice i donje crte"),
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
    .length(3, "Valuta mora imati tačno 3 karaktera")
    .regex(/^[A-Z]{3}$/, "Valuta mora biti u formatu XXX (npr. BAM, EUR)")
    .default("BAM"),
  stock: z.coerce.number().int("Zaliha mora biti cijeli broj")
    .nonnegative("Zaliha ne može biti negativna")
    .default(0),
  categoryId: z.coerce.number().int("ID kategorije mora biti cijeli broj")
    .positive("ID kategorije mora biti pozitivan broj"),
  imageUrl: z.string()
    .url("URL slike mora biti validan")
    .optional()
    .or(z.literal("")),
  thumbUrl: z.string()
    .url("URL thumbnail-a mora biti validan")
    .optional()
    .or(z.literal("")),
  spec1: z.string().max(255, "Specifikacija 1 ne može biti duža od 255 karaktera").optional(),
  spec2: z.string().max(255, "Specifikacija 2 ne može biti duža od 255 karaktera").optional(),
  spec3: z.string().max(255, "Specifikacija 3 ne može biti duža od 255 karaktera").optional(),
  spec4: z.string().max(255, "Specifikacija 4 ne može biti duža od 255 karaktera").optional(),
  spec5: z.string().max(255, "Specifikacija 5 ne može biti duža od 255 karaktera").optional(),
  spec6: z.string().max(255, "Specifikacija 6 ne može biti duža od 255 karaktera").optional(),
  spec7: z.string().max(255, "Specifikacija 7 ne može biti duža od 255 karaktera").optional(),
  specJson: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
}).refine((data) => {
  // Custom validation: if priceWithoutVAT and priceWithVAT are both provided, ensure VAT calculation makes sense
  if (data.priceWithoutVAT && data.priceWithVAT) {
    const calculatedVAT = data.priceWithoutVAT * 1.17;
    const tolerance = 0.01; // Allow for small rounding differences
    if (Math.abs(calculatedVAT - data.priceWithVAT) > tolerance) {
      return false;
    }
  }
  return true;
}, {
  message: "Cijena sa PDV-om mora biti cijena bez PDV-a pomnožena sa 1.17 (17% PDV)",
  path: ["priceWithVAT"]
});

export const partUpdateSchema = partCreateSchema.partial();