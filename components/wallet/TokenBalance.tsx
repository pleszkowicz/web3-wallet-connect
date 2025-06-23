'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Token } from '@/const/tokens';
import { usePortfolioBalance } from '@/context/PortfolioBalanceProvider';
import Image from 'next/image';
import Link from 'next/link';

export interface WalletBalanceItemProps {
  token: Token;
}

export const TokenBalance = ({ token }: WalletBalanceItemProps) => {
  const { balances, error } = usePortfolioBalance();
  const tokenBalance = balances.get(token.symbol);

  return (
    <Card className="group border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 items-center justify-between">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
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
          <div className="text-left sm:text-right">
            <p className="text-xl font-bold text-white">${tokenBalance?.usd.toFixed(2)}</p>
            {/* <div className="flex items-center gap-2">
              <p className={`text-sm font-medium ${token.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                {token.change}
              </p>
              <p className="text-sm text-gray-500">{token.changeValue}</p>
            </div> */}
          </div>
          <div className="ml-4 flex flex-col justify-end gap-4 text-right transition-opacity duration-200 group-hover:opacity-100 sm:flex-row md:opacity-0">
            {token?.faucetUrl && (
              <Button asChild size="sm" variant="secondary">
                <Link href={token.faucetUrl} target="_blank" rel="noopener noreferrer">
                  Get test tokens
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/swap">Trade</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
