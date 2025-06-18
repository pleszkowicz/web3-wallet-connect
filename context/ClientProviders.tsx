'use client';
import { AuthManager } from '@/components/AuthManager';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import WagmiProviderWrapper from '@/context/WagmiProviderWrapper';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderWrapper>
      <TooltipProvider>
        <AuthManager>
          {children}
          <Toaster />
        </AuthManager>
      </TooltipProvider>
    </WagmiProviderWrapper>
  );
}
