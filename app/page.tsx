'use client';
import { WalletBalance } from '@/components/wallet-balance';
import { WalletConnect } from '@/components/wallet-connect';
import { useMounted } from '@/hooks/useMounted';
import { useAccount } from 'wagmi';

function HomePage() {
  const { isConnected } = useAccount();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return isConnected ? <WalletBalance /> : <WalletConnect />;
}

export default HomePage;
