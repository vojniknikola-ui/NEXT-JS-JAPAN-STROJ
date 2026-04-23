import { asc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdminRole } from "@/lib/auth/adminSession";
import {
  CATALOG_CATEGORIES,
  resolveCanonicalCatalogCategory,
} from "@/lib/parts/catalogCategories";
import {
  ensureCatalogSchema,
  ensureCategoryRecord,
} from "@/lib/parts/ensureCatalogSchema";

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
  const auth = requireAdminRole(req, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

  await ensureCatalogSchema();
  const payload = (await req.json().catch(() => ({}))) as {
    name?: string;
    slug?: string;
  };

  const name = payload.name?.trim();
  const slug = payload.slug?.trim();

  if (!name && !slug) {
    return Response.json(
      { error: "Naziv kategorije je obavezan." },
      { status: 400 }
    );
  }

  const category = await ensureCategoryRecord({ name, slug });

  if (!category) {
    return Response.json(
      { error: "Kategorija nije mogla biti sačuvana." },
      { status: 500 }
    );
  }

  return Response.json(category, { status: 201 });
}
