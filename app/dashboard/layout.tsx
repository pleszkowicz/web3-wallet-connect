'use client';
import { WalletDashboard } from '@/components/WalletDashboard';
import { PropsWithChildren } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <WalletDashboard>{children}</WalletDashboard>;
}
