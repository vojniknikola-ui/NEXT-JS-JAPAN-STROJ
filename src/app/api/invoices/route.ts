import { NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { ensureInvoiceColumns } from "@/lib/invoices/ensureInvoiceColumns";
import { requireAdminRole } from "@/lib/auth/adminSession";

export const runtime = "nodejs";

const ALLOWED_STATUSES = new Set(["created", "sent"]);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? "");
}

function getPostgresCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const typedError = error as { code?: unknown; cause?: unknown };
  if (typeof typedError.code === "string") return typedError.code;

  const cause = typedError.cause;
  if (cause && typeof cause === "object") {
    const typedCause = cause as { code?: unknown };
    if (typeof typedCause.code === "string") return typedCause.code;
  }
  return undefined;
}

function isInvoicesReadUnavailable(error: unknown): boolean {
  const pgCode = getPostgresCode(error);
  if (pgCode === "42P01" || pgCode === "42501") return true;

  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes('relation "invoices" does not exist') ||
    msg.includes("permission denied for relation invoices")
  );
}

export async function GET(request: Request) {
  const auth = requireAdminRole(request, ["admin", "editor", "read_only"]);
  if ("response" in auth) return auth.response;

  try {
    const invoiceColumns = await ensureInvoiceColumns();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status")?.trim().toLowerCase();
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 20), 1), 100);
    const offset = (page - 1) * pageSize;

    if (!invoiceColumns.hasTable) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        total: 0,
        hasMore: false,
      });
    }

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

    if (status === "sent" && !invoiceColumns.hasStatus) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        total: 0,
        hasMore: false,
      });
    }

    if (status && ALLOWED_STATUSES.has(status) && invoiceColumns.hasStatus) {
      where.push(eq(invoices.status, status));
    }

    const whereClause = where.length ? and(...where) : undefined;

    const [totalRow] = await db
      .select({ total: count() })
      .from(invoices)
      .where(whereClause);

    let rows: Array<{
      id: number;
      invoiceNumber: string;
      customerName: string;
      customerContact: string | null;
      customerAddress: string | null;
      totalAmount: string;
      status: string;
      sentAt: string | Date | null;
      createdAt: string | Date | null;
    }>;

    if (invoiceColumns.hasStatus && invoiceColumns.hasSentAt) {
      rows = await db
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
    } else if (invoiceColumns.hasStatus) {
      const baseRows = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          customerName: invoices.customerName,
          customerContact: invoices.customerContact,
          customerAddress: invoices.customerAddress,
          totalAmount: invoices.totalAmount,
          status: invoices.status,
          createdAt: invoices.createdAt,
        })
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt), desc(invoices.id))
        .limit(pageSize)
        .offset(offset);

      rows = baseRows.map((row) => ({
        ...row,
        sentAt: null,
      }));
    } else if (invoiceColumns.hasSentAt) {
      const baseRows = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          customerName: invoices.customerName,
          customerContact: invoices.customerContact,
          customerAddress: invoices.customerAddress,
          totalAmount: invoices.totalAmount,
          sentAt: invoices.sentAt,
          createdAt: invoices.createdAt,
        })
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt), desc(invoices.id))
        .limit(pageSize)
        .offset(offset);

      rows = baseRows.map((row) => ({
        ...row,
        status: "created",
      }));
    } else {
      const baseRows = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          customerName: invoices.customerName,
          customerContact: invoices.customerContact,
          customerAddress: invoices.customerAddress,
          totalAmount: invoices.totalAmount,
          createdAt: invoices.createdAt,
        })
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt), desc(invoices.id))
        .limit(pageSize)
        .offset(offset);

      rows = baseRows.map((row) => ({
        ...row,
        status: "created",
        sentAt: null,
      }));
    }

    return NextResponse.json({
      items: rows,
      page,
      pageSize,
      total: Number(totalRow?.total ?? 0),
      hasMore: offset + rows.length < Number(totalRow?.total ?? 0),
    });
  } catch (error) {
    if (isInvoicesReadUnavailable(error)) {
      console.warn("Invoice history fallback: invoices table is unavailable.", error);
      const { searchParams } = new URL(request.url);
      const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
      const pageSize = Math.min(
        Math.max(Number(searchParams.get("pageSize") ?? 20), 1),
        100
      );
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        total: 0,
        hasMore: false,
      });
    }

    console.error("Error loading invoice history:", error);
    const detail =
      error instanceof Error && error.message
        ? error.message
        : "Neočekivana greška na serveru.";
    return NextResponse.json(
      { error: "Greška pri učitavanju istorije predračuna.", detail },
      { status: 500 }
    );
  }
}
