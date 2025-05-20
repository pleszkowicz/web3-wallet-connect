'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/tokens');
  }, [router]);

  return null;
}

export default DashboardPage;
