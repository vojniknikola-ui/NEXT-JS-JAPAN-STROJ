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
      // Call the API to generate invoice and send email
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

      if (response.ok) {
        const result = await response.json();
        alert(`Predračun ${result.invoiceNumber} je generisan i poslan na email!`);
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Došlo je do greške prilikom generisanja predračuna');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Došlo je do greške prilikom generisanja predračuna');
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