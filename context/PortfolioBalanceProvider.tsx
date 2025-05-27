'use client';
import { erc20Tokens, Token, tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { useQuery } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useBalance, useReadContracts } from 'wagmi';

export interface TokenPriceAndBalance {
  formattedValue: number;
  rawValue: bigint;
  tokenPrice: number;
  usd: number;
}

interface PortfolioContext {
  balances: Map<string, TokenPriceAndBalance>;
  error?: unknown;
  isLoading: boolean;
  totalUsd: number;
  refetchTokens: () => void;
}

const PortfolioBalanceContext = createContext<PortfolioContext>({
  balances: new Map(),
  isLoading: true,
  error: undefined,
  totalUsd: 0,
  refetchTokens: () => {},
});

export function usePortfolio() {
  return useContext(PortfolioBalanceContext);
}

export const PortfolioBalanceProvider = ({ children }: PropsWithChildren) => {
  const { address, chainId } = useAccount();
  const balancesRef = useRef<Map<TokenMapKey, TokenPriceAndBalance>>(new Map());
  const [totalUsd, setTotalUsd] = useState(0);

  const {
    data: ethBalance,
    error: ethBalanceError,
    isLoading: isEthBalanceLoading,
    refetch: refetchEth,
  } = useBalance({ address });

  const tokenSymbols = tokens.map((token) => token.symbol).join(',');

  // 1) fetch USD prices once
  const {
    data: priceMap = {} as Record<string, number>,
    isLoading: isPricesLoading,
    refetch: refetchPrices,
    error: priceMapError,
  } = useQuery({
    queryKey: ['prices', tokenSymbols],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?symbols=${tokenSymbols}&vs_currencies=usd`
      );
      const json: Record<string, { usd: number }> = await res.json();
      // flatten to Record<string,number>
      return Object.fromEntries(Object.entries(json).map(([id, { usd }]) => [id, usd])) as Record<string, number>;
    },
    retry: 3,
  });

  // 2) batch all ERC-20 balanceOf calls
  const {
    data: erc20onChainBalances,
    isLoading: isLoadingOnChain,
    error: erc20onChainError,
    refetch: refetchErc20onChainBalances,
  } = useReadContracts({
    contracts: erc20Tokens.map((token: Token) => ({
      address: token.address,
      abi: token.abi,
      functionName: 'balanceOf',
      args: [address!],
      chainId,
    })),
    query: {
      enabled: !!address,
    },
  });

  // 3) combine when both are ready
  useEffect(() => {
    if (!erc20onChainBalances || !priceMap || isLoadingOnChain) {
      return;
    }

    let total = 0;

    // ETH
    if (ethBalance) {
      const ethAmount = parseFloat(formatUnits(ethBalance.value, tokenMap.eth.decimals));
      const tokenPrice = priceMap[tokenMap.eth.symbol] || 0;
      const ethUsd = ethAmount * tokenPrice;
      balancesRef.current.set(tokenMap.eth.symbol, {
        formattedValue: ethAmount,
        rawValue: ethBalance.value,
        tokenPrice: tokenPrice,
        usd: ethUsd,
      });
      total += ethUsd;
    }

    // ERC-20
    erc20Tokens.forEach((token, i) => {
      const raw = erc20onChainBalances[i];
      const rawValue = raw.result as bigint;
      const human = raw?.result ? parseFloat(formatUnits(rawValue, token.decimals)) : 0;
      const tokenPrice = priceMap[token.symbol] || 0;
      const usdVal = human * (priceMap[token.symbol] || 0);
      total += usdVal;

      balancesRef.current.set(token.symbol as TokenMapKey, {
        formattedValue: human,
        rawValue: rawValue,
        tokenPrice: tokenPrice,
        usd: usdVal,
      });
    });

    setTotalUsd(total);
  }, [ethBalance, erc20onChainBalances, priceMap, isLoadingOnChain]);

  const refetchTokens = () => {
    refetchEth();
    refetchErc20onChainBalances();
    refetchPrices();
  };

  return (
    <PortfolioBalanceContext.Provider
      value={{
        balances: balancesRef.current,
        error: ethBalanceError || erc20onChainError || priceMapError,
        totalUsd,
        refetchTokens,
        isLoading: isLoadingOnChain || isEthBalanceLoading || isPricesLoading,
      }}
    >
      {children}
    </PortfolioBalanceContext.Provider>
  );
};
