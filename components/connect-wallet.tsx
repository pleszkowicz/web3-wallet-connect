'use client'
import { useAccount } from "wagmi";
import { WalletBalance } from "@/components/wallet-balance";
import { WalletSelect } from "@/components/wallet-select";
import { useEffect, useState } from "react";

export default function ConnectWallet() {
  const { isConnected } = useAccount();
  const [mounted, isMounted] = useState(false);

  useEffect(() => {
    isMounted(true);
  }, []);

  if (!mounted) {return null;}

  return isConnected ? <WalletBalance /> : <WalletSelect />;
}
