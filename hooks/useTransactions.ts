import { getTransactionsHistory } from "@/app/actions/getTransactionsHistory";
import { AlchemyAssetTransaction } from "@/types/AlchemyAssetTransaction";
import { useQuery } from "@tanstack/react-query";
import { Address, Chain } from "viem";

export const useTransactions = ({ address, chainId }: { address?: Address, chainId?: Chain['id'] }, options: { enabled: boolean }) => {
  return useQuery<AlchemyAssetTransaction[], Error>({
    queryKey: ['transactions', address, chainId],
    queryFn: async () => {
      return await getTransactionsHistory({ address: address!, chainId: chainId! })
    },
    enabled: !!(options.enabled && chainId && address),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });
}
