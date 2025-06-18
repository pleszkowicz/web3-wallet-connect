'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NftPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/tokens');
  }, [router]);

  return null;
}
