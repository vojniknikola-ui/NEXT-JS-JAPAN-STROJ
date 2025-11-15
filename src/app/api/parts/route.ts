import { db } from "@/db";
import { parts, categories } from "@/db/schema";
import { and, eq, ilike, desc, gt } from "drizzle-orm";
import { partCreateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const cat = searchParams.get("categoryId");
  const status = searchParams.get("status");
  const brand = searchParams.get("brand");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const where = [];
  if (cursor) where.push(gt(parts.id, Number(cursor)));
  if (q) where.push(ilike(parts.title, `%${q}%`));
  if (cat) where.push(eq(parts.categoryId, Number(cat)));
  if (status) where.push(eq(parts.isActive, status === 'active'));
  if (brand) where.push(ilike(parts.brand, `%${brand}%`));

  let orderBy;
  switch (sort) {
    case 'id':
      orderBy = order === 'asc' ? parts.id : desc(parts.id);
      break;
    case 'sku':
      orderBy = order === 'asc' ? parts.sku : desc(parts.sku);
      break;
    case 'brand':
      orderBy = order === 'asc' ? parts.brand : desc(parts.brand);
      break;
    case 'model':
      orderBy = order === 'asc' ? parts.model : desc(parts.model);
      break;
    case 'title':
      orderBy = order === 'asc' ? parts.title : desc(parts.title);
      break;
    case 'stock':
      orderBy = order === 'asc' ? parts.stock : desc(parts.stock);
      break;
    case 'priceWithoutVAT':
      orderBy = order === 'asc' ? parts.priceWithoutVAT : desc(parts.priceWithoutVAT);
      break;
    case 'priceWithVAT':
      orderBy = order === 'asc' ? parts.priceWithVAT : desc(parts.priceWithVAT);
      break;
    case 'createdAt':
      orderBy = order === 'asc' ? parts.createdAt : desc(parts.createdAt);
      break;
    case 'updatedAt':
      orderBy = order === 'asc' ? parts.updatedAt : desc(parts.updatedAt);
      break;
    default:
      orderBy = desc(parts.createdAt);
  }

  const rows = await db.select({
    id: parts.id,
    sku: parts.sku,
    title: parts.title,
    brand: parts.brand,
    model: parts.model,
    catalogNumber: parts.catalogNumber,
    application: parts.application,
    delivery: parts.delivery,
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
    isActive: parts.isActive,
    category: categories.name,
  })
  .from(parts)
  .leftJoin(categories, eq(parts.categoryId, categories.id))
  .where(where.length ? and(...where) : undefined)
  .orderBy(orderBy)
  .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && items.length > 0 ? String(items[items.length - 1].id) : null;

  return Response.json({ items, nextCursor, hasMore }, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  });
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