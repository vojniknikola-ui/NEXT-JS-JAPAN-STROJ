import jsPDF from "jspdf";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CartItem } from "@/types";

export interface InvoiceCompanyDetails {
  companyName: string;
  idNumber: string;
  pdvNumber: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
}

interface ProformaPdfInput {
  invoiceNumber: string;
  cartItems: CartItem[];
  cartTotal: number;
  companyDetails: InvoiceCompanyDetails;
  issuedAt?: Date;
}

const PDF_FONT_FAMILY = "NotoSans";
let regularFontBase64: string | null = null;
let boldFontBase64: string | null = null;

async function getFontBase64(fileName: string) {
  const fontPath = path.join(process.cwd(), "public", "fonts", fileName);
  const fontBuffer = await readFile(fontPath);
  return fontBuffer.toString("base64");
}

async function configurePdfFonts(doc: jsPDF) {
  if (!regularFontBase64) {
    regularFontBase64 = await getFontBase64("NotoSans-Regular.ttf");
  }
  if (!boldFontBase64) {
    boldFontBase64 = await getFontBase64("NotoSans-Bold.ttf");
  }

  doc.addFileToVFS("NotoSans-Regular.ttf", regularFontBase64);
  doc.addFont("NotoSans-Regular.ttf", PDF_FONT_FAMILY, "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", boldFontBase64);
  doc.addFont("NotoSans-Bold.ttf", PDF_FONT_FAMILY, "bold");
  doc.setFont(PDF_FONT_FAMILY, "normal");
  return true;
}

function truncateText(doc: jsPDF, value: string, maxWidth: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (doc.getTextWidth(normalized) <= maxWidth) return normalized;

  let output = normalized;
  while (output.length > 0 && doc.getTextWidth(`${output}...`) > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

export async function generateProformaPdf({
  invoiceNumber,
  cartItems,
  cartTotal,
  companyDetails,
  issuedAt = new Date(),
}: ProformaPdfInput) {
  const doc = new jsPDF();
  let activeFontFamily = "helvetica";

  try {
    const fontsConfigured = await configurePdfFonts(doc);
    if (fontsConfigured) {
      activeFontFamily = PDF_FONT_FAMILY;
    }
  } catch (fontError) {
    console.warn("Failed to load custom PDF fonts, falling back to default font:", fontError);
  }

  const setPdfFont = (style: "normal" | "bold" = "normal") => {
    doc.setFont(activeFontFamily, style);
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(255, 107, 0);
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setFontSize(18);
  setPdfFont("bold");
  doc.setTextColor(255, 255, 255);
  doc.text("JAPAN STROJ d.o.o.", margin, 17);

  doc.setFontSize(8);
  setPdfFont("normal");
  doc.text("Adresa: Sarajevo, Bosna i Hercegovina", margin, 22);
  doc.text("Telefon: +387 61 234 567 | Email: info@japanstroj.ba", margin, 27);

  doc.setTextColor(0, 0, 0);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, 35, contentWidth, 15, "F");
  doc.setFontSize(16);
  setPdfFont("bold");
  doc.setTextColor(255, 107, 0);
  doc.text("PREDRAČUN", pageWidth / 2, 47, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(margin, 60, contentWidth, 25);
  doc.setFontSize(10);
  setPdfFont("normal");
  doc.setTextColor(0, 0, 0);

  doc.text(`Broj predračuna: ${invoiceNumber}`, margin + 5, 72);
  doc.text(`Datum izdavanja: ${issuedAt.toLocaleDateString("bs-BA")}`, margin + 5, 80);
  doc.text(
    `Rok važenja: ${new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("bs-BA")}`,
    pageWidth - margin - 80,
    72
  );

  doc.setFontSize(12);
  setPdfFont("bold");
  doc.setTextColor(255, 107, 0);
  doc.text("PODACI O KUPCU", margin, 100);

  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(1);
  doc.rect(margin, 105, contentWidth, 43);
  doc.setFontSize(10);
  setPdfFont("normal");
  doc.setTextColor(0, 0, 0);

  const leftColumnWidth = contentWidth / 2 - 12;
  const rightColumnWidth = contentWidth / 2 - 18;

  doc.text(truncateText(doc, `Naziv firme: ${companyDetails.companyName}`, leftColumnWidth), margin + 5, 115);
  doc.text(truncateText(doc, `ID broj: ${companyDetails.idNumber}`, leftColumnWidth), margin + 5, 123);
  doc.text(truncateText(doc, `PDV broj: ${companyDetails.pdvNumber}`, leftColumnWidth), margin + 5, 131);
  doc.text(truncateText(doc, `Kontakt osoba: ${companyDetails.name}`, rightColumnWidth), pageWidth / 2 + 10, 115);
  doc.text(truncateText(doc, `Adresa: ${companyDetails.address}`, rightColumnWidth), pageWidth / 2 + 10, 123);
  doc.text(
    truncateText(doc, `Telefon: ${companyDetails.phone?.trim() || "-"}`, rightColumnWidth),
    pageWidth / 2 + 10,
    131
  );
  doc.text(
    truncateText(doc, `Email: ${companyDetails.email?.trim() || "-"}`, rightColumnWidth),
    pageWidth / 2 + 10,
    139
  );

  let yPosition = 155;

  const drawItemsHeader = () => {
    doc.setFillColor(255, 107, 0);
    doc.rect(margin, yPosition, contentWidth, 12, "F");
    doc.setFontSize(10);
    setPdfFont("bold");
    doc.setTextColor(255, 255, 255);

    doc.text("R.br.", margin + 3, yPosition + 8);
    doc.text("Naziv artikla", margin + 18, yPosition + 8);
    doc.text("Brend/Model", margin + 80, yPosition + 8);
    doc.text("Kol.", margin + 125, yPosition + 8);
    doc.text("Cijena (BAM)", margin + 140, yPosition + 8);
    doc.text("Ukupno (BAM)", margin + 170, yPosition + 8);
  };

  drawItemsHeader();

  yPosition += 12;
  setPdfFont("normal");
  doc.setTextColor(0, 0, 0);

  cartItems.forEach((item, index) => {
    const rowHeight = 10;
    const minFooterStart = pageHeight - 70;

    if (yPosition + rowHeight > minFooterStart) {
      doc.addPage();
      yPosition = 20;
      drawItemsHeader();
      yPosition += 12;
      setPdfFont("normal");
      doc.setTextColor(0, 0, 0);
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, yPosition, contentWidth, rowHeight, "F");
    }

    doc.text(String(index + 1), margin + 3, yPosition + 7);
    doc.text(truncateText(doc, item.part.name, 58), margin + 18, yPosition + 7);

    const brandModel = [];
    if (item.part.brand) brandModel.push(item.part.brand);
    if (item.part.model) brandModel.push(item.part.model);
    doc.text(truncateText(doc, brandModel.join(" / "), 35), margin + 80, yPosition + 7);

    doc.text(String(item.quantity), margin + 130, yPosition + 7);
    doc.text(item.part.priceWithVAT.toFixed(2), margin + 145, yPosition + 7);
    doc.text((item.part.priceWithVAT * item.quantity).toFixed(2), margin + 170, yPosition + 7);

    yPosition += rowHeight;
  });

  yPosition += 5;
  if (yPosition + 40 > pageHeight - 25) {
    doc.addPage();
    yPosition = 20;
  }
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(1);
  doc.line(margin + 140, yPosition, pageWidth - margin, yPosition);

  yPosition += 8;
  setPdfFont("bold");
  doc.setFontSize(12);
  doc.text("UKUPNO ZA PLATITI:", margin + 115, yPosition);
  doc.text(`${cartTotal.toFixed(2)} BAM`, margin + 170, yPosition);

  yPosition += 20;
  if (yPosition + 28 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }
  doc.setFontSize(9);
  setPdfFont("normal");
  doc.setTextColor(100, 100, 100);

  const footerText = [
    "Ovaj predračun važi 7 dana od datuma izdavanja.",
    "Plaćanje se vrši prema dogovoru ili putem bankovnog transfera na račun:",
    "JAPAN STROJ d.o.o. - UniCredit Bank BiH - 338-100-00000000-00",
    "Za dodatne informacije kontaktirajte nas na: +387 61 234 567",
  ];

  footerText.forEach((text, index) => {
    doc.text(text, margin, yPosition + index * 5);
  });

  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(2);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Japan Stroj d.o.o. - Vaš pouzdani partner za rezervne dijelove",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  return doc.output("arraybuffer");
}
