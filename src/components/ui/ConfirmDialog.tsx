'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Potvrdi',
  cancelLabel = 'Odustani',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const confirmClass =
    variant === 'danger'
      ? 'w-full border border-red-500/50 bg-red-600 text-white hover:bg-red-700'
      : 'w-full';

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-5">
        <p className="text-sm text-neutral-300">{description}</p>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="secondary" className="w-full" disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} className={confirmClass} disabled={isLoading}>
            {isLoading ? 'Obrada...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

