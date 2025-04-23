'use client';
import { Dashboard } from '@/components/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export default DashboardPage;
