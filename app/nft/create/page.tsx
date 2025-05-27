'use client';
import { CreateNFT } from '@/components/nft/CreateNft';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <CreateNFT />
    </PortfolioBalanceProvider>
  );
}
