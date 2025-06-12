'use client';
import { CreateNFT } from '@/components/nft/CreateNft';
import { Loader } from '@/components/ui/loader';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import { Suspense } from 'react';

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <Suspense fallback={<Loader size="lg" />}>
        <CreateNFT />
      </Suspense>
    </PortfolioBalanceProvider>
  );
}
