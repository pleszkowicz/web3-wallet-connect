'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface WalletBalanceItemProps {
  address?: `0x${string}`;
  balance?: string;
  isLoading?: boolean;
  name?: string;
  symbol?: string;
}

export default function WalletBalanceItem({ balance, isLoading = false, name }: WalletBalanceItemProps) {
  return (
    <div className={`flex items-center space-x-4 ${isLoading ? 'animate-pulse' : ''}`}>
      <div className="flex flex-row flex-1 items-center justify-between">
        <div className="flex flex-row items-center">
        <Avatar>
          <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="ml-4">{name}</span>
        </div>
        {isLoading ? (
          <p className="text-sm font-medium">Loading balance...</p>
        ) : (
          <>
            <h4 className="text-lg text-bold text-right">{balance}</h4>
          </>
        )}
      </div>
    </div>
  );
}
