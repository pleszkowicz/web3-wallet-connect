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

  const formattedAddress = ensName || address?.slice(0, 6) + '...' + address?.slice(-4)

  return (
    <div className={`flex items-center space-x-4 ${isLoading ? 'animate-pulse' : ''}`}>
      <Avatar>
        <AvatarImage src={ensAvatar || undefined}/>
        <AvatarFallback>
          <Wallet2 className="h-6 w-6"/>
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-row flex-1 items-center justify-between">
        {isLoading ? (
          <p className="text-sm font-medium">Loading...</p>
        ) : (
          <>
            <p className="text-sm font-medium" title={address}>
              {currentChain?.blockExplorers?.default.url ? (
                <a
                  href={`${currentChain?.blockExplorers?.default.url}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {formattedAddress}
                </a>
              ) : (
                formattedAddress
              )}
            </p>
            <h4 className="text-lg text-bold text-right">
              {balance}
            </h4>
          </>
        )}
      </div>
    </div>
  )
}
