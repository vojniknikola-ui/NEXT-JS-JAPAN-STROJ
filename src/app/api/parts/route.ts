import { db } from "@/db";
import { parts, categories } from "@/db/schema";
import { and, eq, ilike } from "drizzle-orm";
import { partCreateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const cat = searchParams.get("categoryId");
  const where = [];
  if (q) where.push(ilike(parts.title, `%${q}%`));
  if (cat) where.push(eq(parts.categoryId, Number(cat)));

  const data = await db.select({
    id: parts.id,
    sku: parts.sku,
    title: parts.title,
    brand: parts.brand,
    model: parts.model,
    catalogNumber: parts.catalogNumber,
    application: parts.application,
    delivery: parts.delivery,
    description: parts.description,
    price: parts.price,
    priceWithoutVAT: parts.priceWithoutVAT,
    priceWithVAT: parts.priceWithVAT,
    discount: parts.discount,
    currency: parts.currency,
    stock: parts.stock,
    categoryId: parts.categoryId,
    imageUrl: parts.imageUrl,
    thumbUrl: parts.thumbUrl,
    spec1: parts.spec1,
    spec2: parts.spec2,
    spec3: parts.spec3,
    spec4: parts.spec4,
    spec5: parts.spec5,
    spec6: parts.spec6,
    spec7: parts.spec7,
    specJson: parts.specJson,
    isActive: parts.isActive,
    category: categories.name,
  })
  .from(parts)
  .leftJoin(categories, eq(parts.categoryId, categories.id))
  .where(where.length ? and(...where) : undefined)
  .orderBy(parts.createdAt);

  return Response.json(data);
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = partCreateSchema.safeParse(json);
  if (!parsed.success) return Response.json(parsed.error.flatten(), { status: 400 });

  const [inserted] = await db.insert(parts).values({
    ...parsed.data,
    price: parsed.data.price.toString(),
    priceWithoutVAT: parsed.data.priceWithoutVAT ? parsed.data.priceWithoutVAT.toString() : undefined,
    priceWithVAT: parsed.data.priceWithVAT ? parsed.data.priceWithVAT.toString() : undefined,
    discount: parsed.data.discount ? parsed.data.discount.toString() : undefined,
    updatedAt: new Date(),
  }).returning({ id: parts.id });

  revalidatePath('/catalog');

  return Response.json({ id: inserted.id }, { status: 201 });
}