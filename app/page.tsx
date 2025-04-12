'use client';
import { WalletConnect } from '@/components/wallet-connect';
import { withMounted } from '@/lib/hoc/withMounted';

function HomePage() {
  return <WalletConnect />;
}

const HomePageWithMounted = withMounted(HomePage);

export default HomePageWithMounted;
