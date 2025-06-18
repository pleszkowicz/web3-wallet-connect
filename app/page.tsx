'use client';
import { withMounted } from '@/lib/hoc/withMounted';
import dynamic from 'next/dynamic';

const LazyWalletConnect = dynamic(
  () => import('@/components/wallet/ConnectWallet').then((module) => module.ConnectWallet),
  {
    ssr: false,
  }
);

function HomePage() {
  return <LazyWalletConnect />;
}

const HomePageWithMounted = withMounted(HomePage);

export default HomePageWithMounted;
