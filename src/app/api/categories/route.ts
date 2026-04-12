import { db } from "@/db";
import { categories } from "@/db/schema";
import { ensureCatalogSchema } from "@/lib/parts/ensureCatalogSchema";

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureCatalogSchema();
    const data = await db.select().from(categories).orderBy(categories.name);
    return Response.json(data, {
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
