import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, parts } from '@/db/schema';
import { CATALOG_CATEGORIES } from '@/lib/parts/catalogCategories';

const seedCategories = [...CATALOG_CATEGORIES];

const seedParts = [
  {
    sku: "CAT-320D-FLT",
    title: "Filter ulja",
    description: "Filter ulja za Caterpillar 320D",
    price: "45.5",
    currency: "EUR",
    stock: 10,
    categorySlug: "filteri",
    imageUrl: "https://picsum.photos/seed/filter1/400/300",
    specJson: JSON.stringify({
      brand: "Caterpillar",
      model: "320D",
      application: "Motor",
      spec5: "Kapacitet: 10L",
      spec6: "Visina: 150mm",
    }),
    isActive: true,
  },
  {
    sku: "KMT-PC200-GEAR",
    title: "Zupčanik pogona",
    description: "Zupčanik pogona za Komatsu PC200",
    price: "1250",
    currency: "EUR",
    stock: 5,
    categorySlug: "ostalo",
    imageUrl: "https://picsum.photos/seed/gear1/400/300",
    specJson: JSON.stringify({
      brand: "Komatsu",
      model: "PC200",
      application: "Transmisija",
      spec5: "Materijal: Kaljeni čelik",
      spec6: "Broj zuba: 28",
    }),
    isActive: true,
  },
  {
    sku: "VLV-EC210-INJ",
    title: "Injektor goriva",
    description: "Injektor goriva za Volvo EC210",
    price: "850.75",
    currency: "EUR",
    stock: 8,
    categorySlug: "dijelovi-motora",
    imageUrl: "https://picsum.photos/seed/injector1/400/300",
    specJson: JSON.stringify({
      brand: "Volvo",
      model: "EC210",
      application: "Motor",
      spec5: "Tlak: 2000 bar",
      spec6: "Tip: Common rail",
    }),
    isActive: true,
  },
];

export async function POST() {
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) {
      return NextResponse.json({ message: 'Data already seeded' });
    }

    // Insert categories
    const insertedCategories = await db
      .insert(categories)
      .values(seedCategories)
      .returning({ id: categories.id, slug: categories.slug });

    const categoryIdBySlug = Object.fromEntries(
      insertedCategories.map((category) => [category.slug, category.id])
    ) as Record<string, number>;

    // Insert parts
    await db.insert(parts).values(
      seedParts.map(({ categorySlug, ...part }) => ({
        ...part,
        categoryId: categoryIdBySlug[categorySlug],
      }))
    );

    return NextResponse.json({ message: 'Data seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
