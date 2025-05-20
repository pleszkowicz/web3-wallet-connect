'use client';
import { Token } from '@/const/tokens';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ReactNode } from 'react';
import { formatUnits } from 'viem';

export interface WalletBalanceItemProps {
  balance?: bigint;
  isLoading?: boolean;
  token: Token;
  description?: ReactNode;
}

export const TokenBalance = ({ balance, description, isLoading = false, token }: WalletBalanceItemProps) => {
  const formattedBalance = balance ? formatUnits(balance as bigint, token.decimals) : '0';

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-row flex-1 items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Image src={token.logo} width={20} height={20} alt={token.label} />
          <span className="text-gray-700">{token.label}</span>
          {description}
        </div>

        <h4 className="text-right text-gray-600">
          <span>
            {isLoading ? <Loader2 className="animate-spin w-4 h-4 text-gray-400 inline-block" /> : formattedBalance}
          </span>{' '}
          <span className="text-xs">{token.symbol.toUpperCase()}</span>
        </h4>
      </div>
    </div>
  );
};
