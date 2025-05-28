'use client';
import { TokenBalance } from '@/components/wallet/TokenBalance';
import { Token, tokens } from '@/const/tokens';

export default function TokensPage() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Token Portfolio</h3>

      <div className="grid gap-4">
        {tokens.map((token) => (
          <TokenBalance key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
}

type ERC20TokenBalanceProps = {
  token: Token;
};
