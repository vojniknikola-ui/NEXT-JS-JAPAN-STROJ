import { db } from "../src/db";
import { categories, parts } from "../src/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  const [category] = await db
    .insert(categories)
    .values({
      name: "Hidraulika",
      slug: "hidraulika",
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Kategorija kreirana:", category);

  const [part] = await db
    .insert(parts)
    .values({
      sku: "HYD-001",
      title: "Hidraulična pumpa P350",
      description: "Visokokvalitetna hidraulična pumpa za građevinske strojeve",
      price: "450.00",
      currency: "EUR",
      stock: 15,
      categoryId: category.id,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Demo dio kreiran:", part);
  console.log("🎉 Seed uspješan!");
}

seed()
  .catch((err) => {
    console.error("❌ Seed greška:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
