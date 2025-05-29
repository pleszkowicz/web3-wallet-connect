import { AuthManager } from '@/components/AuthManager';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import WagmiProviderWrapper from '@/context/WagmiProviderWrapper';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { StrictMode } from 'react';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Web3 Dashboard - Piotr Leszkowicz',
  description: 'Pure ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} v0-c bg-slate-950 opacity-100! transition-opacity duration-300`}
      >
        <StrictMode>
          <WagmiProviderWrapper>
            <TooltipProvider>
              <AuthManager>{children}</AuthManager>
            </TooltipProvider>
          </WagmiProviderWrapper>
          <Toaster />
        </StrictMode>
      </body>
    </html>
  );
}
