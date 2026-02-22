import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { ensureInvoiceColumns } from "@/lib/invoices/ensureInvoiceColumns";
import { requireAdminRole } from "@/lib/auth/adminSession";

export const runtime = "nodejs";

type StatusPayload = {
  status?: "created" | "sent";
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  const auth = requireAdminRole(request, ["admin", "editor"]);
  if ("response" in auth) return auth.response;

  try {
    const invoiceColumns = await ensureInvoiceColumns();
    const body = (await request.json().catch(() => ({}))) as StatusPayload;
    if (body.status !== "created" && body.status !== "sent") {
      return NextResponse.json(
        { error: "Neispravan status. Dozvoljeno: created, sent." },
        { status: 400 }
      );
    }
    if (!invoiceColumns.hasStatus) {
      return NextResponse.json(
        {
          error:
            "Status predračuna trenutno nije dostupan. Potrebna je migracija baze (kolona invoices.status).",
        },
        { status: 409 }
      );
    }

    const { invoiceNumber: invoiceNumberParam } = await params;
    const invoiceNumber = decodeURIComponent(invoiceNumberParam);
    const now = new Date();

    let updated: Array<{ id: number; status: string; sentAt: Date | null }>;

    if (invoiceColumns.hasSentAt) {
      updated = await db
        .update(invoices)
        .set({
          status: body.status,
          sentAt: body.status === "sent" ? now : null,
          updatedAt: now,
        })
        .where(eq(invoices.invoiceNumber, invoiceNumber))
        .returning({ id: invoices.id, status: invoices.status, sentAt: invoices.sentAt });
    } else {
      const updatedWithoutSentAt = await db
        .update(invoices)
        .set({
          status: body.status,
          updatedAt: now,
        })
        .where(eq(invoices.invoiceNumber, invoiceNumber))
        .returning({ id: invoices.id, status: invoices.status });

      updated = updatedWithoutSentAt.map((row) => ({
        ...row,
        sentAt: null,
      }));
    }

    if (!updated[0]) {
      return NextResponse.json({ error: "Predračun nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, invoice: updated[0] });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json(
      { error: "Greška pri izmjeni statusa predračuna." },
      { status: 500 }
    );
  }
}
