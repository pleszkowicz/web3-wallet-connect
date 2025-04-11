import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import WagmiProviderWrapper from '@/context/WagmiProviderWrapper';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

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
  title: 'NFT Hub',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} !opacity-100 transition-opacity duration-300 v0-c bg-slate-100`}
      >
        <WagmiProviderWrapper>
          <TooltipProvider>{children}</TooltipProvider>
        </WagmiProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
