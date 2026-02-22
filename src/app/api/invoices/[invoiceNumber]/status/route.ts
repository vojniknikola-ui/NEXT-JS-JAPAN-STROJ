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
    await ensureInvoiceColumns();
    const body = (await request.json().catch(() => ({}))) as StatusPayload;
    if (body.status !== "created" && body.status !== "sent") {
      return NextResponse.json(
        { error: "Neispravan status. Dozvoljeno: created, sent." },
        { status: 400 }
      );
    }

    const { invoiceNumber: invoiceNumberParam } = await params;
    const invoiceNumber = decodeURIComponent(invoiceNumberParam);
    const now = new Date();

    const updated = await db
      .update(invoices)
      .set({
        status: body.status,
        sentAt: body.status === "sent" ? now : null,
        updatedAt: now,
      })
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .returning({ id: invoices.id, status: invoices.status, sentAt: invoices.sentAt });

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
