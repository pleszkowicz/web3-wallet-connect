'use client';
import { WalletBalance } from '@/components/wallet-balance';
import { useMounted } from '@/hooks/useMounted';
import { useAccount } from 'wagmi';
import { WalletConnect } from './wallet-connect';

export default function ConnectWallet() {
  const { isConnected } = useAccount();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return isConnected ? <WalletBalance /> : <WalletConnect />;
}
