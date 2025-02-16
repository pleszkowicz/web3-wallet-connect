'use client'
import { useAccount } from "wagmi";
import { WalletBalance } from "@/components/wallet-balance";
import { useEffect, useState } from "react";
import { WalletConnect } from "./wallet-connect";

export default function ConnectWallet() {
  const { isConnected } = useAccount();
  const [mounted, isMounted] = useState(false);

  useEffect(() => {
    isMounted(true);
  }, []);

  if (!mounted) {return null;}

  return isConnected ? <WalletBalance /> : <WalletConnect />;
}
