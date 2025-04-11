'use client';
import { config } from '@/config/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

export default function WagmiProviderWrapper({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
