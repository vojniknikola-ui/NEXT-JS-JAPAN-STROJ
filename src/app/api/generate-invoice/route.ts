import { NextRequest, NextResponse } from "next/server";
import type { CartItem } from "@/types";
import { ensureInvoiceColumns } from "@/lib/invoices/ensureInvoiceColumns";
import {
  generateProformaPdf,
  type InvoiceCompanyDetails,
} from "@/lib/invoices/generateProformaPdf";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { cartItems, cartTotal, companyDetails }: {
      cartItems: CartItem[];
      cartTotal: number;
      companyDetails: InvoiceCompanyDetails;
    } = await request.json();

    const { db, withRetry } = await import("@/db");
    const { invoices } = await import("@/db/schema");
    const { count } = await import("drizzle-orm");

    let invoiceNumber = `PR-${Date.now().toString().slice(-8)}`;
    let dbAvailable = false;
    let invoiceColumns = { hasStatus: true, hasSentAt: true };

    try {
      invoiceColumns = await ensureInvoiceColumns();
      const result = await withRetry(async () =>
        db.select({ count: count() }).from(invoices)
      );

      const rawCount = result[0]?.count;
      const countValue =
        typeof rawCount === "bigint" ? Number(rawCount) : Number(rawCount ?? 0);
      const nextInvoiceNumber = Number.isFinite(countValue) ? countValue + 1 : NaN;

      if (Number.isFinite(nextInvoiceNumber)) {
        invoiceNumber = `PR-${String(nextInvoiceNumber).padStart(4, "0")}`;
      }
      dbAvailable = true;
    } catch (dbCountError) {
      const dbErrorMessage =
        dbCountError instanceof Error ? dbCountError.message : String(dbCountError);
      console.warn(
        `Invoice table is not available yet, using fallback invoice number: ${dbErrorMessage}`
      );
    }

    const issuedAt = new Date();
    const pdfBuffer = await generateProformaPdf({
      invoiceNumber,
      cartItems,
      cartTotal,
      companyDetails,
      issuedAt,
    });

    let invoiceSaved = false;
    if (dbAvailable) {
      try {
        const values: typeof invoices.$inferInsert = {
          invoiceNumber,
          customerName: companyDetails.companyName,
          customerId: companyDetails.idNumber,
          customerPdv: companyDetails.pdvNumber,
          customerContact: companyDetails.name,
          customerAddress: companyDetails.address,
          cartData: JSON.stringify(cartItems),
          totalAmount: cartTotal.toString(),
          createdAt: issuedAt,
          updatedAt: issuedAt,
        };

        if (invoiceColumns.hasStatus) {
          values.status = "created";
        }
        if (invoiceColumns.hasSentAt) {
          values.sentAt = null;
        }

        await withRetry(async () =>
          db.insert(invoices).values(values)
        );
        invoiceSaved = true;
      } catch (saveError) {
        console.error("Error saving invoice:", saveError);
      }
    }

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="predracun-${invoiceNumber}.pdf"`,
        "X-Invoice-Number": invoiceNumber,
        "X-DB-Saved": invoiceSaved ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Došlo je do greške prilikom generisanja predračuna" },
      { status: 500 }
    );
  }
}
