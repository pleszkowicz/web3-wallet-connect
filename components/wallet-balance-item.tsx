'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet2 } from "lucide-react";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";

export interface WalletBalanceItemProps {
  address?: `0x${string}`
  balance?: string
  isLoading?: boolean
}

export default function WalletBalanceItem({
  address,
  balance,
  isLoading = false
}: WalletBalanceItemProps) {
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })
  const { chain: currentChain } = useAccount()

  return (
    <div className={`flex items-center space-x-4 ${isLoading ? 'animate-pulse' : ''}`}>
      <Avatar>
        <AvatarImage src={ensAvatar || undefined}/>
        <AvatarFallback>
          <Wallet2 className="h-6 w-6"/>
        </AvatarFallback>
      </Avatar>
      <div>
        {isLoading ? (
          <p className="text-sm font-medium">Loading...</p>
        ) : (
          <>
            <p className="text-sm font-medium">
              <a
                href={`${currentChain?.blockExplorers?.default.url}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {ensName || address?.slice(0, 6) + '...' + address?.slice(-4)}
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              {balance}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
