import { db } from "@/db";
import { parts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { partUpdateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/auth/adminSession";

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

  console.error("Part DB error:", error);
  return Response.json(
    { error: "Greška pri spremanju izmjena. Pokušajte ponovo." },
    { status: 500 }
  );
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(parts).where(eq(parts.id, Number(id)));
  if (!row) return new Response("Not found", { status: 404 });

  return Response.json(row, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminRole(req, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const payload = await req.json();
  const parsed = partUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const firstFieldError = Object.values(flattened.fieldErrors).flat().find(Boolean);
    const firstFormError = flattened.formErrors[0];
    const errorMessage = firstFieldError || firstFormError || "Neispravni podaci za izmjenu dijela";
    return Response.json(
      {
        error: errorMessage,
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
      { status: 400 }
    );
  }

  const updateData: Partial<typeof parts.$inferInsert> & { updatedAt: Date } = { updatedAt: new Date() };
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

  let updated: { id: number } | undefined;
  try {
    [updated] = await db
      .update(parts)
      .set(updateData)
      .where(eq(parts.id, Number(id)))
      .returning({ id: parts.id });
  } catch (error) {
    return createDbErrorResponse(error);
  }

  if (!updated) {
    return Response.json({ error: "Dio nije pronađen." }, { status: 404 });
  }
  
  revalidatePath('/catalog');
  
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminRole(_, ["admin"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  try {
    await db.delete(parts).where(eq(parts.id, Number(id)));
  } catch (error) {
    return createDbErrorResponse(error);
  }
  
  revalidatePath('/catalog');
  
  return Response.json({ ok: true });
}
