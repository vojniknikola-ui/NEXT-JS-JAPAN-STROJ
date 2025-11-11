'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CartItem } from '@/types';
import jsPDF from 'jspdf';

interface CompanyDetails {
  companyName: string;
  idNumber: string;
  pdvNumber: string;
  name: string;
  address: string;
}

interface ProformaInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
}

export default function ProformaInvoiceModal({
  isOpen,
  onClose,
  cartItems,
  cartTotal,
}: ProformaInvoiceModalProps) {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    companyName: '',
    idNumber: '',
    pdvNumber: '',
    name: '',
    address: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof CompanyDetails, value: string) => {
    setCompanyDetails(prev => ({ ...prev, [field]: value }));
  };

  const generatePDF = async () => {
    if (!companyDetails.companyName || !companyDetails.idNumber || !companyDetails.pdvNumber || !companyDetails.name || !companyDetails.address) {
      alert('Molimo popunite sva polja');
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();

      // Set page margins and dimensions
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

      const invoiceNumber = `PR-${Date.now()}`;
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

      // Save the PDF
      doc.save(`predracun-${invoiceNumber}.pdf`);

      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Došlo je do greške prilikom generisanja PDF-a');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generiši predračun">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Naziv firme *
          </label>
          <Input
            type="text"
            value={companyDetails.companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('companyName', e.target.value)}
            placeholder="Unesite naziv firme"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            ID broj *
          </label>
          <Input
            type="text"
            value={companyDetails.idNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('idNumber', e.target.value)}
            placeholder="Unesite ID broj"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            PDV broj *
          </label>
          <Input
            type="text"
            value={companyDetails.pdvNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pdvNumber', e.target.value)}
            placeholder="Unesite PDV broj"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Ime i prezime *
          </label>
          <Input
            type="text"
            value={companyDetails.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
            placeholder="Unesite ime i prezime"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Adresa firme *
          </label>
          <Input
            type="text"
            value={companyDetails.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
            placeholder="Unesite adresu firme"
            className="w-full"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Odustani
          </Button>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? 'Generisanje...' : 'Generiši PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}