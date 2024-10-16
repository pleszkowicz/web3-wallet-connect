'use client';
import { useAccount, useBalance, useChainId, useConnect, useContractRead, useDisconnect } from 'wagmi'
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
import { DisconnectAccount } from './disconnect-account';
import Link from 'next/link';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';

export function WalletBalance() {
  const { address, isConnected } = useAccount()
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address })
  const { connectors, connect } = useConnect()
  const [ready, setReady] = useState<{ [key: string]: boolean }>({})
  const chainId = useChainId()

  useEffect(() => {
    connectors.forEach(async(connector) => {
      const provider = await connector.getProvider()
      setReady(prev => ({ ...prev, [connector.id]: !!provider }))
    })
  }, [connectors])

  if (isConnected) {
    const formattedBalance = balance && `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    return (
      <Card className="min-w-[500px]">
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
          {chainId === sepolia.id && <SepoliaLinkBalance/>}

          <Separator />
          <TransactionHistory key={chainId}/>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Link href="/transfer">Send <ArrowTopRightIcon /></Link>
          </Button>
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

  // Use wagmi's useContractRead to read the token balance and details
  const { data: balance, isLoading } = useContractRead({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: symbol } = useContractRead({
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
