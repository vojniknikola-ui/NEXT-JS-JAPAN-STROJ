import React from 'react';
import { XIcon } from '@/lib/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-white/15 rounded-2xl p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
