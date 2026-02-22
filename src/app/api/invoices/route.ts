import { NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { ensureInvoiceColumns } from "@/lib/invoices/ensureInvoiceColumns";
import { requireAdminRole } from "@/lib/auth/adminSession";

export const runtime = "nodejs";

const ALLOWED_STATUSES = new Set(["created", "sent"]);

export async function GET(request: Request) {
  const auth = requireAdminRole(request, ["admin", "editor", "read_only"]);
  if ("response" in auth) return auth.response;

  try {
    await ensureInvoiceColumns();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status")?.trim();
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 20), 1), 100);
    const offset = (page - 1) * pageSize;

    const where = [];
    if (q) {
      where.push(
        or(
          ilike(invoices.invoiceNumber, `%${q}%`),
          ilike(invoices.customerName, `%${q}%`),
          ilike(invoices.customerContact, `%${q}%`)
        )
      );
    }

    if (status && ALLOWED_STATUSES.has(status)) {
      where.push(eq(invoices.status, status));
    }

    const whereClause = where.length ? and(...where) : undefined;

    const [totalRow] = await db
      .select({ total: count() })
      .from(invoices)
      .where(whereClause);

    const rows = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerName: invoices.customerName,
        customerContact: invoices.customerContact,
        customerAddress: invoices.customerAddress,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        sentAt: invoices.sentAt,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(whereClause)
      .orderBy(desc(invoices.createdAt), desc(invoices.id))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      items: rows,
      page,
      pageSize,
      total: Number(totalRow?.total ?? 0),
      hasMore: offset + rows.length < Number(totalRow?.total ?? 0),
    });
  } catch (error) {
    console.error("Error loading invoice history:", error);
    return NextResponse.json(
      { error: "Greška pri učitavanju istorije predračuna." },
      { status: 500 }
    );
  }
}
