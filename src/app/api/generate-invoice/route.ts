import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/types';
import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';

interface CompanyDetails {
  companyName: string;
  idNumber: string;
  pdvNumber: string;
  name: string;
  address: string;
}

export async function POST(request: NextRequest) {
  try {
    const { cartItems, cartTotal, companyDetails }: {
      cartItems: CartItem[],
      cartTotal: number,
      companyDetails: CompanyDetails
    } = await request.json();

    // Generate sequential invoice number
    const { db, withRetry } = await import('@/db');
    const { invoices } = await import('@/db/schema');
    const { count } = await import('drizzle-orm');

    const result = await withRetry(async () =>
      db.select({ count: count() }).from(invoices)
    );

    const nextInvoiceNumber = (result[0]?.count || 0) + 1;
    const invoiceNumber = `PR-${String(nextInvoiceNumber).padStart(4, '0')}`;

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header with company logo area (placeholder)
    doc.setFillColor(255, 107, 0); // Orange background
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Company name in header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('JAPAN STROJ d.o.o.', margin, 17);

    // Company details
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Adresa: Sarajevo, Bosna i Hercegovina', margin, 22);
    doc.text('Telefon: +387 61 234 567 | Email: info@japanstroj.ba', margin, 27);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Invoice title with background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, 35, contentWidth, 15, 'F');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 107, 0);
    doc.text('PREDRAČUN', pageWidth / 2, 47, { align: 'center' });

    // Invoice details box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, 60, contentWidth, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const currentDate = new Date().toLocaleDateString('bs-BA');

    doc.text(`Broj predračuna: ${invoiceNumber}`, margin + 5, 72);
    doc.text(`Datum izdavanja: ${currentDate}`, margin + 5, 80);
    doc.text(`Rok važenja: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('bs-BA')}`, pageWidth - margin - 80, 72);

    // Customer details section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 107, 0);
    doc.text('PODACI O KUPCU', margin, 100);

    // Customer details box
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(1);
    doc.rect(margin, 105, contentWidth, 35);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(`Naziv firme: ${companyDetails.companyName}`, margin + 5, 115);
    doc.text(`ID broj: ${companyDetails.idNumber}`, margin + 5, 123);
    doc.text(`PDV broj: ${companyDetails.pdvNumber}`, margin + 5, 131);

    doc.text(`Kontakt osoba: ${companyDetails.name}`, pageWidth / 2 + 10, 115);
    doc.text(`Adresa: ${companyDetails.address}`, pageWidth / 2 + 10, 123);

    // Items table
    let yPosition = 155;

    // Table header with background
    doc.setFillColor(255, 107, 0);
    doc.rect(margin, yPosition, contentWidth, 12, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    doc.text('R.br.', margin + 3, yPosition + 8);
    doc.text('Naziv artikla', margin + 18, yPosition + 8);
    doc.text('Brend/Model', margin + 80, yPosition + 8);
    doc.text('Kol.', margin + 125, yPosition + 8);
    doc.text('Cijena (BAM)', margin + 140, yPosition + 8);
    doc.text('Ukupno (BAM)', margin + 170, yPosition + 8);

    // Table rows
    yPosition += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    cartItems.forEach((item, index) => {
      const rowHeight = 10;

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition, contentWidth, rowHeight, 'F');
      }

      doc.text((index + 1).toString(), margin + 3, yPosition + 7);
      doc.text(item.part.name.substring(0, 22), margin + 18, yPosition + 7);

      const brandModel = [];
      if (item.part.brand) brandModel.push(item.part.brand);
      if (item.part.model) brandModel.push(item.part.model);
      doc.text(brandModel.join(' / ').substring(0, 15), margin + 80, yPosition + 7);

      doc.text(item.quantity.toString(), margin + 130, yPosition + 7);
      doc.text(item.part.priceWithVAT.toFixed(2), margin + 145, yPosition + 7);
      doc.text((item.part.priceWithVAT * item.quantity).toFixed(2), margin + 170, yPosition + 7);

      yPosition += rowHeight;
    });

    // Total section
    yPosition += 5;
    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(1);
    doc.line(margin + 140, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('UKUPNO ZA PLATITI:', margin + 115, yPosition);
    doc.text(cartTotal.toFixed(2) + ' BAM', margin + 170, yPosition);

    // Footer section
    yPosition += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
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

    // Save invoice to database
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

    // Send email with PDF attachment
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'nikolaandric@gmail.com',
      subject: `Predračun ${invoiceNumber} - ${companyDetails.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b00;">Japan Stroj d.o.o.</h2>
          <p>Poštovani,</p>
          <p>U prilogu vam šaljemo predračun broj <strong>${invoiceNumber}</strong> za narudžbu rezervnih dijelova.</p>

          <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">Podaci o kupcu:</h3>
            <p><strong>Naziv firme:</strong> ${companyDetails.companyName}</p>
            <p><strong>ID broj:</strong> ${companyDetails.idNumber}</p>
            <p><strong>PDV broj:</strong> ${companyDetails.pdvNumber}</p>
            <p><strong>Kontakt osoba:</strong> ${companyDetails.name}</p>
            <p><strong>Adresa:</strong> ${companyDetails.address}</p>
          </div>

          <p><strong>Ukupan iznos:</strong> ${cartTotal.toFixed(2)} BAM</p>
          <p><strong>Rok važenja:</strong> 7 dana od datuma izdavanja</p>

          <p>Za sva pitanja stojimo vam na raspolaganju.</p>
          <p>Srdačan pozdrav,<br>Japan Stroj d.o.o.</p>
        </div>
      `,
      attachments: [
        {
          filename: `predracun-${invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue with response even if email fails
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      message: 'Predračun je generisan i poslan na email'
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške prilikom generisanja predračuna' },
      { status: 500 }
    );
  }
}