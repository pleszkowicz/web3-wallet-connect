'use client'
import { useAccount } from "wagmi";
import { WalletBalance } from "@/components/wallet-balance";
import { useEffect, useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";

function HomePage() {
    const { isConnected } = useAccount();
    const [mounted, isMounted] = useState(false);
  
    useEffect(() => {
      isMounted(true);
    }, []);
  
    if (!mounted) {return null;}
  
    return isConnected ? <WalletBalance /> : <WalletConnect />;
}

export default HomePage;
