'use client';
import { TokenExchange } from '@/components/swap/TokenExchange';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <TokenExchange />
    </PortfolioBalanceProvider>
  );
}
