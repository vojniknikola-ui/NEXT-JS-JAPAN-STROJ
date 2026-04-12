import { asc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import {
  CATALOG_CATEGORIES,
  resolveCanonicalCatalogCategory,
} from "@/lib/parts/catalogCategories";
import { ensureCatalogSchema } from "@/lib/parts/ensureCatalogSchema";

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureCatalogSchema();
    const data = await db
      .select()
      .from(categories)
      .where(isNull(categories.deletedAt))
      .orderBy(asc(categories.name));

    const canonicalRows = new Map<string, (typeof data)[number]>();
    const extraRows: (typeof data)[number][] = [];

    for (const row of data) {
      const canonicalCategory = resolveCanonicalCatalogCategory(row.slug, row.name);
      if (canonicalCategory) {
        if (!canonicalRows.has(canonicalCategory.slug)) {
          canonicalRows.set(canonicalCategory.slug, {
            ...row,
            name: canonicalCategory.name,
            slug: canonicalCategory.slug,
          });
        }
        continue;
      }

      extraRows.push(row);
    }

    const ordered = [
      ...CATALOG_CATEGORIES.map((category) => canonicalRows.get(category.slug)).filter(
        (row): row is (typeof data)[number] => Boolean(row)
      ),
      ...extraRows,
    ];

    return Response.json(ordered, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    return Response.json([], {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}

export async function POST(req: Request) {
  await ensureCatalogSchema();
  const { name, slug } = await req.json();
  const [inserted] = await db.insert(categories).values({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-')
  }).returning({ id: categories.id });

  return Response.json({ id: inserted.id }, { status: 201 });
}
