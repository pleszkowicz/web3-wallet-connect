// app/ClientRoot.tsx
'use client';
import { AuthManager } from '@/components/AuthManager';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import WagmiProviderWrapper from '@/context/WagmiProviderWrapper';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WagmiProviderWrapper>
        <TooltipProvider>
          <AuthManager>
            {children}
            <Toaster />
          </AuthManager>
        </TooltipProvider>
      </WagmiProviderWrapper>
      <GoogleAnalytics gaId="G-9EM4NEZD7G" />
    </>
  );
}
