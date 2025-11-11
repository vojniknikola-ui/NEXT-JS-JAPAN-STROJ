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

      // Company header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Japan Stroj d.o.o.', 20, 30);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Adresa: Sarajevo, Bosna i Hercegovina', 20, 40);
      doc.text('Telefon: +387 61 234 567', 20, 50);
      doc.text('Email: info@japanstroj.ba', 20, 60);

      // Invoice title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PREDRAČUN', 105, 80, { align: 'center' });

      // Invoice number and date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const invoiceNumber = `PR-${Date.now()}`;
      const currentDate = new Date().toLocaleDateString('bs-BA');
      doc.text(`Broj predračuna: ${invoiceNumber}`, 20, 95);
      doc.text(`Datum: ${currentDate}`, 20, 105);

      // Company details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Podaci o kupcu:', 20, 120);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Naziv firme: ${companyDetails.companyName}`, 20, 135);
      doc.text(`ID broj: ${companyDetails.idNumber}`, 20, 145);
      doc.text(`PDV broj: ${companyDetails.pdvNumber}`, 20, 155);
      doc.text(`Ime i prezime: ${companyDetails.name}`, 20, 165);
      doc.text(`Adresa: ${companyDetails.address}`, 20, 175);

      // Table header
      let yPosition = 195;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('R.br.', 20, yPosition);
      doc.text('Naziv artikla', 35, yPosition);
      doc.text('Količina', 120, yPosition);
      doc.text('Cijena (BAM)', 150, yPosition);
      doc.text('Ukupno (BAM)', 180, yPosition);

      // Table rows
      doc.setFont('helvetica', 'normal');
      yPosition += 10;

      cartItems.forEach((item, index) => {
        doc.text((index + 1).toString(), 20, yPosition);
        doc.text(item.part.name.substring(0, 30), 35, yPosition);
        doc.text(item.quantity.toString(), 125, yPosition);
        doc.text(item.part.priceWithVAT.toFixed(2), 155, yPosition);
        doc.text((item.part.priceWithVAT * item.quantity).toFixed(2), 185, yPosition);
        yPosition += 10;

        // Add brand and model if available
        if (item.part.brand || item.part.model) {
          doc.setFontSize(8);
          const details = [];
          if (item.part.brand) details.push(`Brend: ${item.part.brand}`);
          if (item.part.model) details.push(`Model: ${item.part.model}`);
          doc.text(details.join(', '), 35, yPosition);
          yPosition += 8;
          doc.setFontSize(10);
        }
      });

      // Total
      yPosition += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('UKUPNO:', 150, yPosition);
      doc.text(cartTotal.toFixed(2) + ' BAM', 180, yPosition);

      // Footer
      yPosition += 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Ovaj predračun važi 7 dana od datuma izdavanja.', 20, yPosition);
      yPosition += 10;
      doc.text('Plaćanje se vrši prema dogovoru ili putem bankovnog transfera.', 20, yPosition);

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