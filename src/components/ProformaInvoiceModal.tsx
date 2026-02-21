'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CartItem } from '@/types';
import { useToast } from '@/components/ui/ToastProvider';

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
  const toast = useToast();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    companyName: '',
    idNumber: '',
    pdvNumber: '',
    name: '',
    address: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CompanyDetails, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CompanyDetails, value: string) => {
    setSubmitError(null);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setCompanyDetails(prev => ({ ...prev, [field]: value }));
  };

  const generatePDF = async () => {
    const nextFieldErrors: Partial<Record<keyof CompanyDetails, string>> = {};
    if (!companyDetails.companyName.trim()) nextFieldErrors.companyName = 'Naziv firme je obavezan.';
    if (!companyDetails.idNumber.trim()) nextFieldErrors.idNumber = 'ID broj je obavezan.';
    if (!companyDetails.pdvNumber.trim()) nextFieldErrors.pdvNumber = 'PDV broj je obavezan.';
    if (!companyDetails.name.trim()) nextFieldErrors.name = 'Ime i prezime su obavezni.';
    if (!companyDetails.address.trim()) nextFieldErrors.address = 'Adresa je obavezna.';

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmitError('Popunite sva obavezna polja prije generisanja predračuna.');
      toast.warning('Nedostaju podaci', 'Popunite sva obavezna polja.');
      return;
    }

    setIsGenerating(true);
    setSubmitError(null);
    setFieldErrors({});

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
      const pdfBlob = await response.blob();

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `predracun-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success('Predračun je spreman', `Predračun ${invoiceNumber} je preuzet na računar.`);

      setCompanyDetails({
        companyName: '',
        idNumber: '',
        pdvNumber: '',
        name: '',
        address: '',
      });
      setSubmitError(null);
      setFieldErrors({});
      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      const message =
        error instanceof Error ? error.message : 'Došlo je do greške prilikom generisanja predračuna';
      setSubmitError(message);
      toast.error('Generisanje nije uspjelo', message);
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
        {submitError && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/35 px-3 py-2 text-sm text-red-200">
            {submitError}
          </div>
        )}
        <div>
          <label htmlFor="invoice-company-name" className="block text-sm font-semibold text-neutral-100 mb-1">
            Naziv firme *
          </label>
          <Input
            id="invoice-company-name"
            type="text"
            value={companyDetails.companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('companyName', e.target.value)}
            placeholder="Unesite naziv firme"
            className="w-full"
            error={fieldErrors.companyName}
          />
        </div>

        <div>
          <label htmlFor="invoice-id-number" className="block text-sm font-semibold text-neutral-100 mb-1">
            ID broj *
          </label>
          <Input
            id="invoice-id-number"
            type="text"
            value={companyDetails.idNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('idNumber', e.target.value)}
            placeholder="Unesite ID broj"
            className="w-full"
            error={fieldErrors.idNumber}
          />
        </div>

        <div>
          <label htmlFor="invoice-pdv-number" className="block text-sm font-semibold text-neutral-100 mb-1">
            PDV broj *
          </label>
          <Input
            id="invoice-pdv-number"
            type="text"
            value={companyDetails.pdvNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pdvNumber', e.target.value)}
            placeholder="Unesite PDV broj"
            className="w-full"
            error={fieldErrors.pdvNumber}
          />
        </div>

        <div>
          <label htmlFor="invoice-contact-name" className="block text-sm font-semibold text-neutral-100 mb-1">
            Ime i prezime *
          </label>
          <Input
            id="invoice-contact-name"
            type="text"
            value={companyDetails.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
            placeholder="Unesite ime i prezime"
            className="w-full"
            error={fieldErrors.name}
          />
        </div>

        <div>
          <label htmlFor="invoice-company-address" className="block text-sm font-semibold text-neutral-100 mb-1">
            Adresa firme *
          </label>
          <Input
            id="invoice-company-address"
            type="text"
            value={companyDetails.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
            placeholder="Unesite adresu firme"
            className="w-full"
            error={fieldErrors.address}
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
            data-testid="generate-proforma-button"
          >
            {isGenerating ? 'Generisanje...' : 'Generiši PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
