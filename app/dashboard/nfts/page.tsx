'use client';
import { NftList } from '@/components/nft/NftList';
import { Loader } from '@/components/ui/loader';
import { Suspense } from 'react';

export default function NftsPage() {
  return (
    <Suspense fallback={<Loader size="lg" />}>
      <NftList />
    </Suspense>
  );
}
