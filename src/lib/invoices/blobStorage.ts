import { head, put } from "@vercel/blob";

function sanitizeInvoiceNumber(invoiceNumber: string) {
  return invoiceNumber.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

export function getInvoicePdfBlobPath(invoiceNumber: string) {
  return `invoices/${sanitizeInvoiceNumber(invoiceNumber)}.pdf`;
}

export async function saveInvoicePdfToBlob(
  invoiceNumber: string,
  pdfBuffer: ArrayBuffer
) {
  const pathname = getInvoicePdfBlobPath(invoiceNumber);
  return await put(pathname, Buffer.from(pdfBuffer), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/pdf",
  });
}

export async function fetchInvoicePdfFromBlob(
  invoiceNumber: string
): Promise<ArrayBuffer | null> {
  try {
    const metadata = await head(getInvoicePdfBlobPath(invoiceNumber));
    const response = await fetch(metadata.url, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}
