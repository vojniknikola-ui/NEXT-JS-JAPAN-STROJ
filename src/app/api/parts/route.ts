import { db } from "@/db";
import { parts, categories } from "@/db/schema";
import { and, asc, desc, eq, gt, ilike, lt, or, sql } from "drizzle-orm";
import { partCreateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/auth/adminSession";

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

type CursorPayload = {
  id: number;
  sortValue?: string | number;
};

function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(rawCursor: string | null): CursorPayload | null {
  if (!rawCursor) return null;

  const numericCursor = Number(rawCursor);
  if (Number.isFinite(numericCursor)) {
    return { id: numericCursor };
  }

  try {
    const decoded = JSON.parse(Buffer.from(rawCursor, "base64url").toString("utf8")) as {
      id?: unknown;
      sortValue?: unknown;
    };

    if (typeof decoded.id !== "number" || !Number.isFinite(decoded.id)) {
      return null;
    }

    if (typeof decoded.sortValue === "string" || typeof decoded.sortValue === "number") {
      return { id: decoded.id, sortValue: decoded.sortValue };
    }

    return { id: decoded.id };
  } catch {
    return null;
  }
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
  const normalizedOrder = order === "asc" ? "asc" : "desc";
  const isAscending = normalizedOrder === "asc";
  const normalizedSort = sort === "relevance" && !q ? "id" : sort;

  const where = [];
  const effectivePrice = sql`COALESCE(${parts.priceWithVAT}, ${parts.price})`;
  const effectivePriceWithoutVat = sql`COALESCE(${parts.priceWithoutVAT}, ${parts.price})`;
  const queryPrefix = q ? `${q}%` : "";
  const queryContains = q ? `%${q}%` : "";
  const relevanceExpression = q
    ? sql<number>`
      (
        CASE
          WHEN LOWER(COALESCE(${parts.sku}, '')) = LOWER(${q}) THEN 120
          WHEN LOWER(COALESCE(${parts.catalogNumber}, '')) = LOWER(${q}) THEN 110
          WHEN LOWER(COALESCE(${parts.title}, '')) = LOWER(${q}) THEN 100
          WHEN COALESCE(${parts.title}, '') ILIKE ${queryPrefix} THEN 85
          WHEN COALESCE(${parts.brand}, '') ILIKE ${queryPrefix} THEN 75
          WHEN COALESCE(${parts.model}, '') ILIKE ${queryPrefix} THEN 65
          WHEN COALESCE(${parts.title}, '') ILIKE ${queryContains} THEN 55
          WHEN COALESCE(${parts.brand}, '') ILIKE ${queryContains} THEN 45
          WHEN COALESCE(${parts.model}, '') ILIKE ${queryContains} THEN 35
          WHEN COALESCE(${parts.catalogNumber}, '') ILIKE ${queryContains} THEN 25
          WHEN COALESCE(${parts.sku}, '') ILIKE ${queryContains} THEN 15
          ELSE 0
        END
      )
    `
    : sql<number>`0`;

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

  if (Number.isFinite(minPriceValue)) {
    where.push(sql`${effectivePrice} >= ${String(minPriceValue)}`);
  }
  if (Number.isFinite(maxPriceValue)) {
    where.push(sql`${effectivePrice} <= ${String(maxPriceValue)}`);
  }

  let primaryOrderBy = isAscending ? asc(parts.id) : desc(parts.id);
  let secondaryOrderBy = isAscending ? asc(parts.id) : desc(parts.id);
  let cursorSortExpression = sql`${parts.id}`;
  let cursorSortKind: "id" | "price" | "relevance" = "id";

  switch (normalizedSort) {
    case "relevance":
      primaryOrderBy = isAscending ? asc(relevanceExpression) : desc(relevanceExpression);
      secondaryOrderBy = isAscending ? asc(parts.id) : desc(parts.id);
      cursorSortExpression = relevanceExpression;
      cursorSortKind = "relevance";
      break;
    case 'id':
      primaryOrderBy = isAscending ? asc(parts.id) : desc(parts.id);
      break;
    case 'sku':
      primaryOrderBy = isAscending ? asc(parts.sku) : desc(parts.sku);
      break;
    case 'brand':
      primaryOrderBy = isAscending ? asc(parts.brand) : desc(parts.brand);
      break;
    case 'model':
      primaryOrderBy = isAscending ? asc(parts.model) : desc(parts.model);
      break;
    case 'title':
      primaryOrderBy = isAscending ? asc(parts.title) : desc(parts.title);
      break;
    case 'stock':
      primaryOrderBy = isAscending ? asc(parts.stock) : desc(parts.stock);
      break;
    case 'priceWithoutVAT':
      primaryOrderBy = isAscending ? asc(effectivePriceWithoutVat) : desc(effectivePriceWithoutVat);
      secondaryOrderBy = isAscending ? asc(parts.id) : desc(parts.id);
      cursorSortExpression = effectivePriceWithoutVat;
      cursorSortKind = "price";
      break;
    case 'priceWithVAT':
      primaryOrderBy = isAscending ? asc(effectivePrice) : desc(effectivePrice);
      secondaryOrderBy = isAscending ? asc(parts.id) : desc(parts.id);
      cursorSortExpression = effectivePrice;
      cursorSortKind = "price";
      break;
    case 'createdAt':
      primaryOrderBy = isAscending ? asc(parts.createdAt) : desc(parts.createdAt);
      break;
    case 'updatedAt':
      primaryOrderBy = isAscending ? asc(parts.updatedAt) : desc(parts.updatedAt);
      break;
    default:
      primaryOrderBy = desc(parts.createdAt);
      secondaryOrderBy = desc(parts.id);
  }

  const parsedCursor = decodeCursor(cursor);
  if (parsedCursor && Number.isFinite(parsedCursor.id)) {
    if (cursorSortKind === "id" || parsedCursor.sortValue === undefined) {
      where.push(isAscending ? gt(parts.id, parsedCursor.id) : lt(parts.id, parsedCursor.id));
    } else {
      const operator = isAscending ? sql.raw(">") : sql.raw("<");
      where.push(
        sql`(${cursorSortExpression} ${operator} ${parsedCursor.sortValue}) OR (${cursorSortExpression} = ${parsedCursor.sortValue} AND ${parts.id} ${operator} ${parsedCursor.id})`
      );
    }
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
    _effectivePrice: effectivePrice,
    _relevanceScore: relevanceExpression,
  })
  .from(parts)
  .leftJoin(categories, eq(parts.categoryId, categories.id))
  .where(where.length ? and(...where) : undefined)
  .orderBy(primaryOrderBy, secondaryOrderBy)
  .limit(limit + 1);

  const hasMore = rows.length > limit;
  const rawItems = hasMore ? rows.slice(0, limit) : rows;
  const items = rawItems.map((row) => {
    const item = { ...row };
    delete (item as { _effectivePrice?: unknown })._effectivePrice;
    delete (item as { _relevanceScore?: unknown })._relevanceScore;
    return item;
  });

  let nextCursor: string | null = null;
  if (hasMore && rawItems.length > 0) {
    const lastItem = rawItems[rawItems.length - 1];
    let sortValue: string | number | undefined;
    if (cursorSortKind === "price") {
      sortValue = String(lastItem._effectivePrice ?? lastItem.priceWithVAT ?? lastItem.price ?? "0");
    } else if (cursorSortKind === "relevance") {
      sortValue = Number(lastItem._relevanceScore ?? 0);
    }

    const cursorPayload: CursorPayload =
      sortValue === undefined
        ? { id: lastItem.id }
        : { id: lastItem.id, sortValue };

    nextCursor = encodeCursor(cursorPayload);
  }

  return Response.json({ items, nextCursor, hasMore }, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  });
}

export async function POST(req: Request) {
  const auth = requireAdminRole(req, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

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
