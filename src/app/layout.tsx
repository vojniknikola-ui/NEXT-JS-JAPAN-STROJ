import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastProvider';
import SalesBotWidget from '@/components/SalesBotWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JapanStroj - Rezervni dijelovi za građevinske strojeve',
  description: 'Vaš pouzdan partner za dijelove građevinskih strojeva',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <ErrorBoundary>
            {children}
            <SalesBotWidget />
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
