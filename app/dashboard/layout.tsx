import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';
import { PropsWithChildren } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <PortfolioBalanceProvider>
      <WalletDashboard>{children}</WalletDashboard>
    </PortfolioBalanceProvider>
  );
}
