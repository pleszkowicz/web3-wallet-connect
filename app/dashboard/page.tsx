'use client';
import { Dashboard } from '@/components/dashboard';
import { useMounted } from '@/hooks/useMounted';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

function DashboardPage() {
  const { isConnected } = useAccount();
  const mounted = useMounted();
  const { push } = useRouter();

  useEffect(() => {
    if (mounted && !isConnected) {
      push('/');
    }
  });

  return <Dashboard />;
}

export default DashboardPage;
