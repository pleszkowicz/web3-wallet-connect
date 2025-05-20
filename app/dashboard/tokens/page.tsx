'use client';
import TokenBalance from '@/components/TokenBalance';
import { Token, tokenMap, tokens } from '@/const/tokens';
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
      <TokenBalance balance={balance?.value} isLoading={isBalanceLoading} token={tokenMap.eth} />
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
  const { address, isConnected } = useAccount();

  invariant(address, 'Address is required');

  const { data: balance, isLoading } = useReadContract({
    address: token.address,
    abi: token.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!token.address },
  });

  return (
    <div>
      {isConnected ? (
        <TokenBalance token={token} balance={balance as bigint | undefined} isLoading={isLoading} />
      ) : (
        <p>Please connect your wallet to Sepolia</p>
      )}
    </div>
  );
}
