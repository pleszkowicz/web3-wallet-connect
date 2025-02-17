import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import WagmiProviderWrapper from '@/context/WagmiProviderWrapper';
import { Toaster } from '@/components/ui/toaster';

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
  title: 'Wallet balance',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} !opacity-100 transition-opacity duration-300 v0-c`}>
        <WagmiProviderWrapper>{children}</WagmiProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
