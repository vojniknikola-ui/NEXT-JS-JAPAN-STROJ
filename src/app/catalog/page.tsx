import { db } from "@/db";
import { parts, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

async function fetchParts() {
  try {
    const data = await db.select({
      id: parts.id,
      sku: parts.sku,
      title: parts.title,
      price: parts.price,
      currency: parts.currency,
      stock: parts.stock,
      imageUrl: parts.imageUrl,
      isActive: parts.isActive,
      category: categories.name,
    })
    .from(parts)
    .leftJoin(categories, eq(parts.categoryId, categories.id))
    .where(eq(parts.isActive, true))
    .orderBy(parts.createdAt);
    
    return data;
  } catch (error) {
    console.error('Error fetching parts:', error);
    return [];
  }
}

export const revalidate = 60;

export default async function CatalogPage() {
  const partsData = await fetchParts();
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Katalog dijelova</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {partsData.map((p)=>(
          <article key={p.id} className="border rounded-2xl p-4 hover:shadow-sm transition">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
              {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
            </div>
            <div className="text-sm text-gray-500">{p.sku}</div>
            <h2 className="font-medium">{p.title}</h2>
            <div className="mt-1">{p.price} {p.currency}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
