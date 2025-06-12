'use client';
import { TokenTransferForm } from '@/components/TokenTransferForm';
import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import { Suspense } from 'react';

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <Suspense fallback={<Loader />}>
        <TokenTransferForm />
      </Suspense>
    </PortfolioBalanceProvider>
  );
}
