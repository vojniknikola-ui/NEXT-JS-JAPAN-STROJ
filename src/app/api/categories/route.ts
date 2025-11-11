import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  const data = await db.select().from(categories).orderBy(categories.name);
  return Response.json(data);
}

export async function POST(req: Request) {
  const { name, slug } = await req.json();
  const [inserted] = await db.insert(categories).values({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-')
  }).returning({ id: categories.id });

  return Response.json({ id: inserted.id }, { status: 201 });
}