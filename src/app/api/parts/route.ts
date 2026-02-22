import { db } from "@/db";
import { parts, categories } from "@/db/schema";
import { and, asc, desc, eq, gt, ilike, lt, or, sql } from "drizzle-orm";
import { partCreateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export const runtime = 'nodejs';

function createDbErrorResponse(error: unknown): Response {
  const errorWithCause = error as Error & { cause?: unknown };
  const rootCause =
    typeof errorWithCause?.cause === "object" && errorWithCause.cause !== null
      ? (errorWithCause.cause as {
          code?: unknown;
          message?: unknown;
          detail?: unknown;
          constraint?: unknown;
        })
      : null;

  const messageParts: string[] = [];
  messageParts.push(error instanceof Error ? error.message : String(error));
  if (typeof rootCause?.message === "string") messageParts.push(rootCause.message);
  if (typeof rootCause?.detail === "string") messageParts.push(rootCause.detail);
  if (typeof rootCause?.constraint === "string") messageParts.push(rootCause.constraint);
  const message = messageParts.join(" ");

  const code =
    typeof rootCause?.code === "string"
      ? rootCause.code
      : typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
      : "";

  if (code === "23505" || /parts_sku_idx|duplicate key|already exists|unique/i.test(message)) {
    return Response.json(
      {
        error: "SKU već postoji. Unesite jedinstven SKU.",
        fieldErrors: { sku: ["SKU već postoji."] },
        formErrors: [],
      },
      { status: 409 }
    );
  }

  if (
    code === "23503" ||
    /foreign key|category_id_fkey|is not present in table "categories"|violates foreign key constraint/i.test(message)
  ) {
    return Response.json(
      {
        error: "Odabrana kategorija ne postoji.",
        fieldErrors: { categoryId: ["Odabrana kategorija ne postoji."] },
        formErrors: [],
      },
      { status: 400 }
    );
  }

  console.error("Error creating part:", error);
  return Response.json(
    { error: "Greška pri spremanju dijela. Pokušajte ponovo." },
    { status: 500 }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const cat = searchParams.get("categoryId");
  const status = searchParams.get("status");
  const brand = searchParams.get("brand");
  const delivery = searchParams.get("delivery");
  const withDiscount = searchParams.get("withDiscount");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const cursor = searchParams.get("cursor");
  const parsedLimit = Number(searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 50;

  const where = [];
  const cursorId = cursor ? Number(cursor) : NaN;
  if (Number.isFinite(cursorId)) {
    where.push(sort === "id" && order === "desc" ? lt(parts.id, cursorId) : gt(parts.id, cursorId));
  }

  if (q) {
    where.push(
      or(
        ilike(parts.title, `%${q}%`),
        ilike(parts.brand, `%${q}%`),
        ilike(parts.model, `%${q}%`),
        ilike(parts.catalogNumber, `%${q}%`),
        ilike(parts.sku, `%${q}%`)
      )
    );
  }

  const categoryId = cat ? Number(cat) : NaN;
  if (Number.isFinite(categoryId)) where.push(eq(parts.categoryId, categoryId));
  if (status) where.push(eq(parts.isActive, status === 'active'));

  if (brand) {
    const brands = brand
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (brands.length === 1) {
      where.push(ilike(parts.brand, `%${brands[0]}%`));
    } else if (brands.length > 1) {
      where.push(or(...brands.map((entry) => ilike(parts.brand, `%${entry}%`))));
    }
  }

  if (delivery) {
    const deliveryValues = delivery
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (deliveryValues.length === 1) {
      where.push(eq(parts.delivery, deliveryValues[0]));
    } else if (deliveryValues.length > 1) {
      where.push(or(...deliveryValues.map((entry) => eq(parts.delivery, entry))));
    }
  }

  if (withDiscount === "true") {
    where.push(sql`COALESCE(${parts.discount}, 0) > 0`);
  }

  const minPriceValue = minPrice ? Number(minPrice) : NaN;
  const maxPriceValue = maxPrice ? Number(maxPrice) : NaN;
  const effectivePrice = sql`COALESCE(${parts.priceWithVAT}, ${parts.price})`;

  if (Number.isFinite(minPriceValue)) {
    where.push(sql`${effectivePrice} >= ${String(minPriceValue)}`);
  }
  if (Number.isFinite(maxPriceValue)) {
    where.push(sql`${effectivePrice} <= ${String(maxPriceValue)}`);
  }

  let orderBy;
  switch (sort) {
    case 'id':
      orderBy = order === 'asc' ? asc(parts.id) : desc(parts.id);
      break;
    case 'sku':
      orderBy = order === 'asc' ? asc(parts.sku) : desc(parts.sku);
      break;
    case 'brand':
      orderBy = order === 'asc' ? asc(parts.brand) : desc(parts.brand);
      break;
    case 'model':
      orderBy = order === 'asc' ? asc(parts.model) : desc(parts.model);
      break;
    case 'title':
      orderBy = order === 'asc' ? asc(parts.title) : desc(parts.title);
      break;
    case 'stock':
      orderBy = order === 'asc' ? asc(parts.stock) : desc(parts.stock);
      break;
    case 'priceWithoutVAT':
      orderBy = order === 'asc' ? asc(parts.priceWithoutVAT) : desc(parts.priceWithoutVAT);
      break;
    case 'priceWithVAT':
      orderBy = order === 'asc' ? asc(parts.priceWithVAT) : desc(parts.priceWithVAT);
      break;
    case 'createdAt':
      orderBy = order === 'asc' ? asc(parts.createdAt) : desc(parts.createdAt);
      break;
    case 'updatedAt':
      orderBy = order === 'asc' ? asc(parts.updatedAt) : desc(parts.updatedAt);
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
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const firstFieldError = Object.values(flattened.fieldErrors).flat().find(Boolean);
    const firstFormError = flattened.formErrors[0];
    const errorMessage = firstFieldError || firstFormError || "Neispravni podaci za unos dijela";
    return Response.json(
      {
        error: errorMessage,
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
      { status: 400 }
    );
  }

  let inserted: { id: number } | undefined;
  try {
    [inserted] = await db.insert(parts).values({
      ...parsed.data,
      price: parsed.data.price.toString(),
      priceWithoutVAT: parsed.data.priceWithoutVAT ? parsed.data.priceWithoutVAT.toString() : undefined,
      priceWithVAT: parsed.data.priceWithVAT ? parsed.data.priceWithVAT.toString() : undefined,
      discount: parsed.data.discount ? parsed.data.discount.toString() : undefined,
      updatedAt: new Date(),
    }).returning({ id: parts.id });
  } catch (error) {
    return createDbErrorResponse(error);
  }

  revalidatePath('/catalog');

  return Response.json({ id: inserted?.id }, { status: 201 });
}
