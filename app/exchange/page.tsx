'use client';
import { TokenExchange } from '@/components/swap/TokenExchange';
import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import { Suspense } from 'react';

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <Suspense fallback={<Loader size="lg" />}>
        <TokenExchange />
      </Suspense>
    </PortfolioBalanceProvider>
  );
}
