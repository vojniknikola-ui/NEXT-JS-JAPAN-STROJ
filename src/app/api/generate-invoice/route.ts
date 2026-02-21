import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/types';
import jsPDF from 'jspdf';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

interface CompanyDetails {
  companyName: string;
  idNumber: string;
  pdvNumber: string;
  name: string;
  address: string;
}

export const runtime = 'nodejs';

const PDF_FONT_FAMILY = 'NotoSans';
let regularFontBase64: string | null = null;
let boldFontBase64: string | null = null;

async function getFontBase64(fileName: string) {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', fileName);
  const fontBuffer = await readFile(fontPath);
  return fontBuffer.toString('base64');
}

async function configurePdfFonts(doc: jsPDF) {
  if (!regularFontBase64) {
    regularFontBase64 = await getFontBase64('NotoSans-Regular.ttf');
  }
  if (!boldFontBase64) {
    boldFontBase64 = await getFontBase64('NotoSans-Bold.ttf');
  }

  doc.addFileToVFS('NotoSans-Regular.ttf', regularFontBase64);
  doc.addFont('NotoSans-Regular.ttf', PDF_FONT_FAMILY, 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', boldFontBase64);
  doc.addFont('NotoSans-Bold.ttf', PDF_FONT_FAMILY, 'bold');
  doc.setFont(PDF_FONT_FAMILY, 'normal');
  return true;
}

function truncateText(doc: jsPDF, value: string, maxWidth: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (doc.getTextWidth(normalized) <= maxWidth) return normalized;

  let output = normalized;
  while (output.length > 0 && doc.getTextWidth(`${output}...`) > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

export async function POST(request: NextRequest) {
  try {
    const { cartItems, cartTotal, companyDetails }: {
      cartItems: CartItem[],
      cartTotal: number,
      companyDetails: CompanyDetails
    } = await request.json();

    const { db, withRetry } = await import('@/db');
    const { invoices } = await import('@/db/schema');
    const { count } = await import('drizzle-orm');

    // Generate invoice number. If DB isn't ready, use a timestamp fallback
    // so PDF generation still works for the user.
    let invoiceNumber = `PR-${Date.now().toString().slice(-8)}`;
    let dbAvailable = false;

    try {
      const result = await withRetry(async () =>
        db.select({ count: count() }).from(invoices)
      );

      const rawCount = result[0]?.count;
      const countValue =
        typeof rawCount === 'bigint' ? Number(rawCount) : Number(rawCount ?? 0);
      const nextInvoiceNumber = Number.isFinite(countValue) ? countValue + 1 : NaN;

      if (Number.isFinite(nextInvoiceNumber)) {
        invoiceNumber = `PR-${String(nextInvoiceNumber).padStart(4, '0')}`;
      }

      dbAvailable = true;
    } catch (dbCountError) {
      const dbErrorMessage =
        dbCountError instanceof Error ? dbCountError.message : String(dbCountError);
      console.warn(`Invoice table is not available yet, using fallback invoice number: ${dbErrorMessage}`);
    }

    // Generate PDF
    const doc = new jsPDF();
    let activeFontFamily = 'helvetica';
    try {
      const fontsConfigured = await configurePdfFonts(doc);
      if (fontsConfigured) {
        activeFontFamily = PDF_FONT_FAMILY;
      }
    } catch (fontError) {
      console.warn('Failed to load custom PDF fonts, falling back to default font:', fontError);
    }
    const setPdfFont = (style: 'normal' | 'bold' = 'normal') => {
      doc.setFont(activeFontFamily, style);
    };
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header with company logo area (placeholder)
    doc.setFillColor(255, 107, 0); // Orange background
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Company name in header
    doc.setFontSize(18);
    setPdfFont('bold');
    doc.setTextColor(255, 255, 255);
    doc.text('JAPAN STROJ d.o.o.', margin, 17);

    // Company details
    doc.setFontSize(8);
    setPdfFont('normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Adresa: Sarajevo, Bosna i Hercegovina', margin, 22);
    doc.text('Telefon: +387 61 234 567 | Email: info@japanstroj.ba', margin, 27);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Invoice title with background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, 35, contentWidth, 15, 'F');

    doc.setFontSize(16);
    setPdfFont('bold');
    doc.setTextColor(255, 107, 0);
    doc.text('PREDRAČUN', pageWidth / 2, 47, { align: 'center' });

    // Invoice details box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, 60, contentWidth, 25);

    doc.setFontSize(10);
    setPdfFont('normal');
    doc.setTextColor(0, 0, 0);

    const currentDate = new Date().toLocaleDateString('bs-BA');

    doc.text(`Broj predračuna: ${invoiceNumber}`, margin + 5, 72);
    doc.text(`Datum izdavanja: ${currentDate}`, margin + 5, 80);
    doc.text(`Rok važenja: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('bs-BA')}`, pageWidth - margin - 80, 72);

    // Customer details section
    doc.setFontSize(12);
    setPdfFont('bold');
    doc.setTextColor(255, 107, 0);
    doc.text('PODACI O KUPCU', margin, 100);

    // Customer details box
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(1);
    doc.rect(margin, 105, contentWidth, 35);

    doc.setFontSize(10);
    setPdfFont('normal');
    doc.setTextColor(0, 0, 0);

    const leftColumnWidth = contentWidth / 2 - 12;
    const rightColumnWidth = contentWidth / 2 - 18;

    doc.text(truncateText(doc, `Naziv firme: ${companyDetails.companyName}`, leftColumnWidth), margin + 5, 115);
    doc.text(truncateText(doc, `ID broj: ${companyDetails.idNumber}`, leftColumnWidth), margin + 5, 123);
    doc.text(truncateText(doc, `PDV broj: ${companyDetails.pdvNumber}`, leftColumnWidth), margin + 5, 131);

    doc.text(truncateText(doc, `Kontakt osoba: ${companyDetails.name}`, rightColumnWidth), pageWidth / 2 + 10, 115);
    doc.text(truncateText(doc, `Adresa: ${companyDetails.address}`, rightColumnWidth), pageWidth / 2 + 10, 123);

    // Items table
    let yPosition = 155;

    const drawItemsHeader = () => {
      doc.setFillColor(255, 107, 0);
      doc.rect(margin, yPosition, contentWidth, 12, 'F');

      doc.setFontSize(10);
      setPdfFont('bold');
      doc.setTextColor(255, 255, 255);

      doc.text('R.br.', margin + 3, yPosition + 8);
      doc.text('Naziv artikla', margin + 18, yPosition + 8);
      doc.text('Brend/Model', margin + 80, yPosition + 8);
      doc.text('Kol.', margin + 125, yPosition + 8);
      doc.text('Cijena (BAM)', margin + 140, yPosition + 8);
      doc.text('Ukupno (BAM)', margin + 170, yPosition + 8);
    };

    drawItemsHeader();

    // Table rows
    yPosition += 12;
    setPdfFont('normal');
    doc.setTextColor(0, 0, 0);

    cartItems.forEach((item, index) => {
      const rowHeight = 10;
      const minFooterStart = pageHeight - 70;

      if (yPosition + rowHeight > minFooterStart) {
        doc.addPage();
        yPosition = 20;
        drawItemsHeader();
        yPosition += 12;
        setPdfFont('normal');
        doc.setTextColor(0, 0, 0);
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition, contentWidth, rowHeight, 'F');
      }

      doc.text((index + 1).toString(), margin + 3, yPosition + 7);
      doc.text(truncateText(doc, item.part.name, 58), margin + 18, yPosition + 7);

      const brandModel = [];
      if (item.part.brand) brandModel.push(item.part.brand);
      if (item.part.model) brandModel.push(item.part.model);
      doc.text(truncateText(doc, brandModel.join(' / '), 35), margin + 80, yPosition + 7);

      doc.text(item.quantity.toString(), margin + 130, yPosition + 7);
      doc.text(item.part.priceWithVAT.toFixed(2), margin + 145, yPosition + 7);
      doc.text((item.part.priceWithVAT * item.quantity).toFixed(2), margin + 170, yPosition + 7);

      yPosition += rowHeight;
    });

    // Total section
    yPosition += 5;
    if (yPosition + 40 > pageHeight - 25) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(1);
    doc.line(margin + 140, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;
    setPdfFont('bold');
    doc.setFontSize(12);
    doc.text('UKUPNO ZA PLATITI:', margin + 115, yPosition);
    doc.text(cartTotal.toFixed(2) + ' BAM', margin + 170, yPosition);

    // Footer section
    yPosition += 20;
    if (yPosition + 28 > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(9);
    setPdfFont('normal');
    doc.setTextColor(100, 100, 100);

    const footerText = [
      'Ovaj predračun važi 7 dana od datuma izdavanja.',
      'Plaćanje se vrši prema dogovoru ili putem bankovnog transfera na račun:',
      'JAPAN STROJ d.o.o. - UniCredit Bank BiH - 338-100-00000000-00',
      'Za dodatne informacije kontaktirajte nas na: +387 61 234 567'
    ];

    footerText.forEach((text, index) => {
      doc.text(text, margin, yPosition + (index * 5));
    });

    // Bottom border
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(2);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Japan Stroj d.o.o. - Vaš pouzdani partner za rezervne dijelove', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Convert PDF to buffer
    const pdfBuffer = doc.output('arraybuffer');

    let invoiceSaved = false;
    if (dbAvailable) {
      try {
        await withRetry(async () =>
          db.insert(invoices).values({
            invoiceNumber,
            customerName: companyDetails.companyName,
            customerId: companyDetails.idNumber,
            customerPdv: companyDetails.pdvNumber,
            customerContact: companyDetails.name,
            customerAddress: companyDetails.address,
            cartData: JSON.stringify(cartItems),
            totalAmount: cartTotal.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );
        invoiceSaved = true;
      } catch (saveError) {
        console.error('Error saving invoice:', saveError);
      }
    }

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="predracun-${invoiceNumber}.pdf"`,
        'X-Invoice-Number': invoiceNumber,
        'X-DB-Saved': invoiceSaved ? 'true' : 'false',
      },
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške prilikom generisanja predračuna' },
      { status: 500 }
    );
  }
}
