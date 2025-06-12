'use client';
import { Loader } from '@/components/ui/loader';
import { WalletConnect } from '@/components/wallet/ConnectWallet';
import { withMounted } from '@/lib/hoc/withMounted';
import { Suspense } from 'react';

function HomePage() {
  return (
    <Suspense fallback={<Loader size="lg" />}>
      <WalletConnect />
    </Suspense>
  );
}

const HomePageWithMounted = withMounted(HomePage);

export default HomePageWithMounted;
