import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { CartItem } from "@/types";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { ensureInvoiceColumns } from "@/lib/invoices/ensureInvoiceColumns";
import {
  generateProformaPdf,
  type InvoiceCompanyDetails,
} from "@/lib/invoices/generateProformaPdf";
import { fetchInvoicePdfFromBlob } from "@/lib/invoices/blobStorage";
import { parseCustomerContactSummary } from "@/lib/invoices/contactDetails";
import { requireAdminRole } from "@/lib/auth/adminSession";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  const auth = requireAdminRole(request, ["admin", "editor", "read_only"]);
  if ("response" in auth) return auth.response;

  try {
    await ensureInvoiceColumns();
    const { invoiceNumber: invoiceNumberParam } = await params;
    const invoiceNumber = decodeURIComponent(invoiceNumberParam);

    const blobPdf = await fetchInvoicePdfFromBlob(invoiceNumber);
    if (blobPdf) {
      return new NextResponse(Buffer.from(blobPdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="predracun-${invoiceNumber}.pdf"`,
        },
      });
    }

    const [row] = await db
      .select({
        invoiceNumber: invoices.invoiceNumber,
        customerName: invoices.customerName,
        customerId: invoices.customerId,
        customerPdv: invoices.customerPdv,
        customerContact: invoices.customerContact,
        customerAddress: invoices.customerAddress,
        cartData: invoices.cartData,
        totalAmount: invoices.totalAmount,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Predračun nije pronađen." }, { status: 404 });
    }

    const parsedCart = JSON.parse(row.cartData) as CartItem[];
    const cartItems = Array.isArray(parsedCart) ? parsedCart : [];
    const parsedContact = parseCustomerContactSummary(row.customerContact);

    const companyDetails: InvoiceCompanyDetails = {
      companyName: row.customerName,
      idNumber: row.customerId || "",
      pdvNumber: row.customerPdv || "",
      name: parsedContact.name,
      phone: parsedContact.phone,
      email: parsedContact.email,
      address: row.customerAddress || "",
    };

    const pdfBuffer = await generateProformaPdf({
      invoiceNumber: row.invoiceNumber,
      cartItems,
      cartTotal: Number(row.totalAmount ?? 0),
      companyDetails,
      issuedAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="predracun-${row.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error downloading invoice PDF:", error);
    return NextResponse.json(
      { error: "Greška pri preuzimanju PDF predračuna." },
      { status: 500 }
    );
  }
}
