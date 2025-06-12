'use client';
import { Loader } from '@/components/ui/loader';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import { PropsWithChildren, Suspense } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <PortfolioBalanceProvider>
      <Suspense fallback={<Loader size="lg" />}>
        <WalletDashboard>{children}</WalletDashboard>
      </Suspense>
    </PortfolioBalanceProvider>
  );
}
