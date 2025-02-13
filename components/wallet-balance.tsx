'use client';
import { useAccount, useBalance, useConnect, useReadContract } from 'wagmi'
import { formatEther } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'
import { SEPOLIA_LINK_CONTRACT_ADDRESS, SEPOLIA_LINK_TOKEN_ABI } from "@/const/sepolia";
import NetworkSwitch from "@/components/network-switch";
import { sepolia } from "wagmi/chains";
import WalletBalanceItem from "@/components/wallet-balance-item";
import TransactionHistory from "@/components/transaction-history";
import { Separator } from "@/components/ui/separator";
import { DisconnectAccount } from '@/components/disconnect-account';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { NftCollection } from './nft-collection';
import invariant from 'tiny-invariant';

export function WalletBalance() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address })
  const { connectors, connect } = useConnect()
  const [ready, setReady] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    connectors.forEach(async(connector) => {
      const provider = await connector.getProvider()
      setReady(prev => ({ ...prev, [connector.id]: !!provider }))
    })
  }, [connectors])

  if (isConnected) {
    const formattedBalance = balance && `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    return (
      <Card className="min-w-[540px]">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle>Wallet Balance</CardTitle>
          <NetworkSwitch/>
        </CardHeader>
        <CardContent className="space-y-4">
          <WalletBalanceItem
            address={address}
            balance={formattedBalance}
            isLoading={isBalanceLoading}
          />
          {chain?.id === sepolia.id && <SepoliaLinkBalance/>}

          <Separator />

          <Tabs defaultValue="nfts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="nfts">
              <NftCollection />
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full mt-5"
              >
                <Link href="/nft/create">Create NFT</Link>
              </Button>
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionHistory key={chain?.id} />
            </TabsContent>
          </Tabs>
          <Separator />
        </CardContent>
        <CardFooter>
          <DisconnectAccount />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

export default function SepoliaLinkBalance() {
  const { address, isConnected } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  })

  const { data: symbol } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'symbol',
  });

  // Convert balance from token decimals
  const formattedBalance = balance
    ? formatEther(balance as bigint)
    : 'N/A';
  const formattedSymbol = String(symbol);

  return (
    <div>
      {isConnected ? (
        <WalletBalanceItem
          address={address}
          balance={`${formattedBalance} ${formattedSymbol}`}
          isLoading={isLoading}
        />
      ) : (
        <p>Please connect your wallet to Sepolia</p>
      )}
    </div>
  );
}
