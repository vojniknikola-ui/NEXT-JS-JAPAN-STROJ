'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CartItem } from '@/types';

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
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          cartTotal,
          companyDetails,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as { error?: string }));
        throw new Error(error.error || 'Došlo je do greške prilikom generisanja predračuna');
      }

      const invoiceNumber = response.headers.get('x-invoice-number') || 'predracun';
      const emailSent = response.headers.get('x-email-sent') === 'true';
      const pdfBlob = await response.blob();

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `predracun-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      alert(
        emailSent
          ? `Predračun ${invoiceNumber} je generisan, preuzet i poslan na email.`
          : `Predračun ${invoiceNumber} je generisan i preuzet. Email nije poslan (SMTP nije konfigurisan).`
      );

      setCompanyDetails({
        companyName: '',
        idNumber: '',
        pdvNumber: '',
        name: '',
        address: '',
      });
      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      const message =
        error instanceof Error ? error.message : 'Došlo je do greške prilikom generisanja predračuna';
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generiši predračun">
      <div className="space-y-4">
        <p className="text-sm text-neutral-300">
          Nakon potvrde, PDF predračun će biti automatski preuzet.
        </p>
        <div>
          <label className="block text-sm font-semibold text-neutral-100 mb-1">
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
          <label className="block text-sm font-semibold text-neutral-100 mb-1">
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
          <label className="block text-sm font-semibold text-neutral-100 mb-1">
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
          <label className="block text-sm font-semibold text-neutral-100 mb-1">
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
          <label className="block text-sm font-semibold text-neutral-100 mb-1">
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
