'use client';
import { TokenBalance } from '@/components/wallet/TokenBalance';
import { Token, tokenMap, tokens } from '@/const/tokens';
import Link from 'next/link';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useAccount, useBalance, useReadContract } from 'wagmi';

export default function TokensPage() {
  const { address } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });

  const erc20tokens = useMemo(() => {
    return tokens.filter((token) => !!token.address);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <TokenBalance
        balance={balance?.value}
        description={
          <Link
            className="text-xs flex hover:underline"
            href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get tokens
          </Link>
        }
        isLoading={isBalanceLoading}
        token={tokenMap.eth}
      />
      {erc20tokens.map((token) => (
        <ERC20TokenBalance key={token.symbol} token={token} />
      ))}
    </div>
  );
}

type ERC20TokenBalanceProps = {
  token: Token;
};

function ERC20TokenBalance({ token }: ERC20TokenBalanceProps) {
  const { address } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: token.address,
    abi: token.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!token.address },
  });

  return (
    <>
      <TokenBalance token={token} balance={balance as bigint | undefined} isLoading={isLoading} />
    </>
  );
}
