'use client';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { PropsWithChildren } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <WalletDashboard>{children}</WalletDashboard>;
}
