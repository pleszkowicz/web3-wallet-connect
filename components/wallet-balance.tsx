'use client';
import { useAccount, useBalance, useConnect, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { SEPOLIA_LINK_CONTRACT_ADDRESS, SEPOLIA_LINK_TOKEN_ABI } from '@/const/sepolia';
import WalletBalanceItem from '@/components/wallet-balance-item';
import TransactionHistory from '@/components/transaction-history';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { NftCollection } from './nft-collection';
import invariant from 'tiny-invariant';
import CardLayout from './card-layout';
import { sepolia } from 'wagmi/chains';

export function WalletBalance() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });
  const { connectors, connect } = useConnect();
  const [ready, setReady] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    connectors.forEach(async (connector) => {
      const provider = await connector.getProvider();
      setReady((prev) => ({ ...prev, [connector.id]: !!provider }));
    });
  }, [connectors]);

  if (isConnected) {
    const formattedBalance = balance && `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`;

    return (
      <CardLayout title="Wallet Dashboard">
        <WalletBalanceItem
          address={address}
          balance={formattedBalance}
          isLoading={isBalanceLoading}
          symbol={balance?.symbol}
          name="Ethereum"
        />
        {chain?.id === sepolia.id && <SepoliaLinkBalance />}

        <Separator />

        <Tabs defaultValue="nfts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="nfts">
            <NftCollection />
            <Button asChild size="sm" variant="outline" className="w-full mt-5">
              <Link href="/nft/create">Create NFT</Link>
            </Button>
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionHistory key={chain?.id} />
            <Button asChild size="sm" variant="outline" className="w-full mt-5">
              <Link href="/transaction">Create transaction</Link>
            </Button>
          </TabsContent>
        </Tabs>
        <Separator />
      </CardLayout>
    );
  }

  return (
    <CardLayout title="Connect Wallet">
      <div className="grid gap-4">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={!ready[connector.id]}
            variant="outline"
          >
            {connector.name}
          </Button>
        ))}
      </div>
    </CardLayout>
  );
}

export default function SepoliaLinkBalance() {
  const { address, isConnected } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: symbol } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'symbol',
  });

  const { data: name } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'name',
  });

  // Convert balance from token decimals
  const formattedBalance = balance ? formatEther(balance as bigint) : 'N/A';
  const formattedSymbol = String(symbol);

  return (
    <div>
      {isConnected ? (
        <WalletBalanceItem address={address} balance={`${formattedBalance} ${formattedSymbol}`} isLoading={isLoading} name={name} />
      ) : (
        <p>Please connect your wallet to Sepolia</p>
      )}
    </div>
  );
}
