'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Token } from '@/const/tokens';
import { usePortfolio } from '@/context/PortfolioBalanceProvider';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface WalletBalanceItemProps {
  token: Token;
}

export const TokenBalance = ({ token }: WalletBalanceItemProps) => {
  const { balances, error, isLoading } = usePortfolio();
  const tokenBalance = balances.get(token.symbol);

  return (
    <Card className="border-gray-800 bg-gray-900 hover:border-gray-700 transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 items-center justify-between">
          <div className="flex flex-grow items-center gap-4">
            <Image src={token.logo} width={40} height={40} alt={token.label} />
            {!error ? (
              <div>
                <h3 className="text-lg font-semibold text-white">{token.symbol.toUpperCase()}</h3>
                <p className="text-md text-gray-400">{tokenBalance?.formattedValue}</p>
                <p className="text-xs text-gray-400">${tokenBalance?.tokenPrice} / unit</p>
              </div>
            ) : (
              <p className="text-xs text-yellow-300">Unable to fetch balances.</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">${tokenBalance?.usd.toFixed(2)}</p>
            {/* <div className="flex items-center gap-2">
              <p className={`text-sm font-medium ${token.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                {token.change}
              </p>
              <p className="text-sm text-gray-500">{token.changeValue}</p>
            </div> */}
          </div>
          <div className="flex gap-4 justify-end text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
            {token?.faucetUrl && (
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Link href={token.faucetUrl} target="_blank" rel="noopener noreferrer">
                  Get test tokens
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/exchange">Trade</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex items-center space-x-4 bg-gray-100 rounded-xl p-4">
      <div className="flex flex-row flex-1 items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Image src={token.logo} width={40} height={40} alt={token.label} />
          <div className="flex flex-col">
            <span className="text-gray-700">{token.label}</span>
            <h4 className="text-gray-600">
              <span className="">
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4 text-gray-400 inline-block" />
                ) : (
                  balances.get(token.symbol)?.balance
                )}
              </span>{' '}
              <span className="text-xs">{token.symbol.toUpperCase()}</span>
            </h4>
          </div>
        </div>
        {token?.faucetUrl && (
          <div className="flex">
            <Link
              className="text-xs flex hover:underline"
              href={token.faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get tokens
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
