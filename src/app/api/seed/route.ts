import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, parts } from '@/db/schema';

const seedCategories = [
  { name: "Default", slug: "default" },
];

const seedParts = [
  {
    sku: "CAT-320D-FLT",
    title: "Filter ulja",
    description: "Filter ulja za Caterpillar 320D",
    price: "45.5",
    currency: "EUR",
    stock: 10,
    categoryId: 1,
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
    categoryId: 1,
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
    categoryId: 1,
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
    await db.insert(categories).values(seedCategories);

    // Insert parts
    await db.insert(parts).values(seedParts);

    return NextResponse.json({ message: 'Data seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}