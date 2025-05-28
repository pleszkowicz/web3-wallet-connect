'use client';
import { TokenTransferForm } from '@/components/TokenTransferForm';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';

export default function TransactionPage() {
  return (
    <PortfolioBalanceProvider>
      <TokenTransferForm />
    </PortfolioBalanceProvider>
  );
}
