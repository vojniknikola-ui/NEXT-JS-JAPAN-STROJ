'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-emerald-500/45 bg-emerald-950/85 text-emerald-100',
  error: 'border-red-500/45 bg-red-950/85 text-red-100',
  info: 'border-sky-500/45 bg-sky-950/85 text-sky-100',
  warning: 'border-amber-500/45 bg-amber-950/85 text-amber-100',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = 'info', durationMs = 3800 }: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 10000);
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (title, description) => showToast({ title, description, variant: 'success' }),
      error: (title, description) => showToast({ title, description, variant: 'error' }),
      info: (title, description) => showToast({ title, description, variant: 'info' }),
      warning: (title, description) => showToast({ title, description, variant: 'warning' }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[120] flex w-full max-w-sm flex-col gap-2 sm:right-4 sm:top-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-testid="app-toast"
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md ${variantClasses[toast.variant]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-1 text-xs opacity-90">{toast.description}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-md px-1 text-base leading-none opacity-80 transition hover:opacity-100"
                aria-label="Zatvori obavještenje"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
