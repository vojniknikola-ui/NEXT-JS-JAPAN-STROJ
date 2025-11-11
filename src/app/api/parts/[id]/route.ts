import { db } from "@/db";
import { parts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { partUpdateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(parts).where(eq(parts.id, Number(id)));
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await req.json();
  const parsed = partUpdateSchema.safeParse(payload);
  if (!parsed.success) return Response.json(parsed.error.flatten(), { status: 400 });

  const updateData: any = { updatedAt: new Date() };
  if (parsed.data.price !== undefined) updateData.price = parsed.data.price.toString();
  if (parsed.data.priceWithoutVAT !== undefined) updateData.priceWithoutVAT = parsed.data.priceWithoutVAT.toString();
  if (parsed.data.priceWithVAT !== undefined) updateData.priceWithVAT = parsed.data.priceWithVAT.toString();
  if (parsed.data.discount !== undefined) updateData.discount = parsed.data.discount.toString();
  if (parsed.data.sku !== undefined) updateData.sku = parsed.data.sku;
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.brand !== undefined) updateData.brand = parsed.data.brand;
  if (parsed.data.model !== undefined) updateData.model = parsed.data.model;
  if (parsed.data.catalogNumber !== undefined) updateData.catalogNumber = parsed.data.catalogNumber;
  if (parsed.data.application !== undefined) updateData.application = parsed.data.application;
  if (parsed.data.delivery !== undefined) updateData.delivery = parsed.data.delivery;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.currency !== undefined) updateData.currency = parsed.data.currency;
  if (parsed.data.stock !== undefined) updateData.stock = parsed.data.stock;
  if (parsed.data.categoryId !== undefined) updateData.categoryId = parsed.data.categoryId;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.thumbUrl !== undefined) updateData.thumbUrl = parsed.data.thumbUrl;
  if (parsed.data.spec1 !== undefined) updateData.spec1 = parsed.data.spec1;
  if (parsed.data.spec2 !== undefined) updateData.spec2 = parsed.data.spec2;
  if (parsed.data.spec3 !== undefined) updateData.spec3 = parsed.data.spec3;
  if (parsed.data.spec4 !== undefined) updateData.spec4 = parsed.data.spec4;
  if (parsed.data.spec5 !== undefined) updateData.spec5 = parsed.data.spec5;
  if (parsed.data.spec6 !== undefined) updateData.spec6 = parsed.data.spec6;
  if (parsed.data.spec7 !== undefined) updateData.spec7 = parsed.data.spec7;
  if (parsed.data.specJson !== undefined) updateData.specJson = parsed.data.specJson;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  await db.update(parts).set(updateData).where(eq(parts.id, Number(id)));
  
  revalidatePath('/catalog');
  
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(parts).where(eq(parts.id, Number(id)));
  
  revalidatePath('/catalog');
  
  return Response.json({ ok: true });
}