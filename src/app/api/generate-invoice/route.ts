import { NextRequest, NextResponse } from "next/server";
import type { CartItem } from "@/types";
import { ensureInvoiceColumns } from "@/lib/invoices/ensureInvoiceColumns";
import {
  generateProformaPdf,
  type InvoiceCompanyDetails,
} from "@/lib/invoices/generateProformaPdf";
import {
  formatCustomerContactSummary,
  isValidEmail,
} from "@/lib/invoices/contactDetails";
import { saveInvoicePdfToBlob } from "@/lib/invoices/blobStorage";

export const runtime = "nodejs";

type GenerateInvoicePayload = {
  cartItems?: unknown;
  cartTotal?: unknown;
  companyDetails?: Partial<InvoiceCompanyDetails> | null;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function hasValidPhone(value: string) {
  const digits = value.replace(/\D+/g, "");
  return digits.length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => ({}))) as GenerateInvoicePayload;

    const cartItems = Array.isArray(payload.cartItems)
      ? (payload.cartItems as CartItem[])
      : [];
    const cartTotal =
      typeof payload.cartTotal === "number"
        ? payload.cartTotal
        : Number(payload.cartTotal ?? 0);

    const normalizedCompanyDetails: InvoiceCompanyDetails = {
      companyName: normalizeText(payload.companyDetails?.companyName),
      idNumber: normalizeText(payload.companyDetails?.idNumber),
      pdvNumber: normalizeText(payload.companyDetails?.pdvNumber),
      name: normalizeText(payload.companyDetails?.name),
      phone: normalizeText(payload.companyDetails?.phone),
      email: normalizeText(payload.companyDetails?.email),
      address: normalizeText(payload.companyDetails?.address),
    };

    if (!cartItems.length) {
      return NextResponse.json(
        { error: "Košarica je prazna. Dodajte artikle prije generisanja predračuna." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(cartTotal) || cartTotal <= 0) {
      return NextResponse.json(
        { error: "Ukupan iznos predračuna nije ispravan." },
        { status: 400 }
      );
    }
    if (!normalizedCompanyDetails.companyName) {
      return NextResponse.json(
        { error: "Naziv firme je obavezan." },
        { status: 400 }
      );
    }
    if (!normalizedCompanyDetails.idNumber) {
      return NextResponse.json(
        { error: "ID broj je obavezan." },
        { status: 400 }
      );
    }
    if (!normalizedCompanyDetails.pdvNumber) {
      return NextResponse.json(
        { error: "PDV broj je obavezan." },
        { status: 400 }
      );
    }
    if (!normalizedCompanyDetails.name) {
      return NextResponse.json(
        { error: "Ime i prezime kontakt osobe su obavezni." },
        { status: 400 }
      );
    }
    if (!normalizedCompanyDetails.address) {
      return NextResponse.json(
        { error: "Adresa firme je obavezna." },
        { status: 400 }
      );
    }

    const hasPhone = Boolean(normalizedCompanyDetails.phone);
    const hasEmail = Boolean(normalizedCompanyDetails.email);
    if (!hasPhone && !hasEmail) {
      return NextResponse.json(
        { error: "Unesite barem broj telefona ili email." },
        { status: 400 }
      );
    }
    if (hasPhone && !hasValidPhone(normalizedCompanyDetails.phone || "")) {
      return NextResponse.json(
        { error: "Broj telefona nije ispravan." },
        { status: 400 }
      );
    }
    if (hasEmail && !isValidEmail(normalizedCompanyDetails.email || "")) {
      return NextResponse.json(
        { error: "Email nije ispravan." },
        { status: 400 }
      );
    }

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
      companyDetails: normalizedCompanyDetails,
      issuedAt,
    });

    let pdfSavedToBlob = false;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await saveInvoicePdfToBlob(invoiceNumber, pdfBuffer);
        pdfSavedToBlob = true;
      } catch (blobError) {
        console.warn("Failed to save invoice PDF to Blob storage:", blobError);
      }
    }

    let invoiceSaved = false;
    if (dbAvailable) {
      try {
        const values: typeof invoices.$inferInsert = {
          invoiceNumber,
          customerName: normalizedCompanyDetails.companyName,
          customerId: normalizedCompanyDetails.idNumber,
          customerPdv: normalizedCompanyDetails.pdvNumber,
          customerContact: formatCustomerContactSummary({
            name: normalizedCompanyDetails.name,
            phone: normalizedCompanyDetails.phone,
            email: normalizedCompanyDetails.email,
          }),
          customerAddress: normalizedCompanyDetails.address,
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
        "X-PDF-Blob-Saved": pdfSavedToBlob ? "true" : "false",
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
