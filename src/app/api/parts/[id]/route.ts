import { db } from "@/db";
import { parts, partImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { partUpdateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/auth/adminSession";
import {
  ensureCatalogSchema,
  ensureCategoryRecord,
} from "@/lib/parts/ensureCatalogSchema";
import {
  buildAdditionalImageRows,
  buildPartMutationValues,
  canPersistAdditionalImages,
  canWriteParts,
} from "@/lib/parts/buildPartMutationValues";

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
    {
      error: "Greška pri spremanju izmjena. Pokušajte ponovo.",
      detail: message || undefined,
    },
    { status: 500 }
  );
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureCatalogSchema();
  const row = await db.query.parts.findFirst({
    where: eq(parts.id, Number(id)),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
      },
    },
  });
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
  const schemaState = await ensureCatalogSchema();
  if (!canWriteParts(schemaState)) {
    return Response.json(
      {
        error: "Tabela dijelova nije spremna za spremanje.",
        detail: "Produkcijska baza nema potpunu parts šemu. Pokrenite migracije za bazu.",
      },
      { status: 500 }
    );
  }
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

  const shouldResolveCategory =
    parsed.data.categoryId !== undefined ||
    parsed.data.categorySlug !== undefined ||
    parsed.data.categoryName !== undefined;

  const category = shouldResolveCategory
    ? await ensureCategoryRecord({
        fallbackId: parsed.data.categoryId,
        slug: parsed.data.categorySlug,
        name: parsed.data.categoryName,
      })
    : null;

  if (shouldResolveCategory && !category) {
    return Response.json(
      {
        error: "Odabrana kategorija ne postoji.",
        fieldErrors: { categoryId: ["Odabrana kategorija ne postoji."] },
        formErrors: [],
      },
      { status: 400 }
    );
  }

  const updateData = buildPartMutationValues(schemaState, {
    ...parsed.data,
    categoryId: category?.id ?? parsed.data.categoryId,
    imageUrl:
      parsed.data.imageUrl !== undefined
        ? parsed.data.imageUrl
          ? parsed.data.imageUrl
          : null
        : undefined,
    thumbUrl:
      parsed.data.thumbUrl !== undefined
        ? parsed.data.thumbUrl
          ? parsed.data.thumbUrl
          : null
        : undefined,
    blurData:
      parsed.data.blurData !== undefined
        ? parsed.data.blurData
          ? parsed.data.blurData
          : null
        : undefined,
    updatedAt: new Date(),
  });

  let updateSuccess = false;
  try {
    const [updatedPart] = await db
      .update(parts)
      .set(updateData)
      .where(eq(parts.id, Number(id)))
      .returning({ id: parts.id });

    if (updatedPart) {
      updateSuccess = true;
      if (parsed.data.additionalImages !== undefined && canPersistAdditionalImages(schemaState)) {
        // neon-http does not support interactive transactions; sync gallery sequentially.
        await db.delete(partImages).where(eq(partImages.partId, Number(id)));
        if (parsed.data.additionalImages.length > 0) {
          const galleryRows = buildAdditionalImageRows(
            schemaState,
            Number(id),
            parsed.data.additionalImages
          );
          if (galleryRows.length > 0) {
            await db.insert(partImages).values(galleryRows);
          }
        }
      }
    }
  } catch (error) {
    return createDbErrorResponse(error);
  }

  if (!updateSuccess) {
    return Response.json({ error: "Dio nije pronađen." }, { status: 404 });
  }
  
  revalidatePath('/catalog');
  
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminRole(_, ["admin"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  await ensureCatalogSchema();
  try {
    await db.update(parts).set({ deletedAt: new Date(), isActive: false }).where(eq(parts.id, Number(id)));
  } catch (error) {
    return createDbErrorResponse(error);
  }
  
  revalidatePath('/catalog');
  
  return Response.json({ ok: true });
}
