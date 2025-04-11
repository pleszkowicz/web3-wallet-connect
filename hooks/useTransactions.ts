import { AlchemyAssetTransaction } from "@/types/AlchemyAssetTransaction";
import { useQuery } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export const useTransactions = (address: string, options: { enabled: boolean }) => {
  const { chain: currentChain } = useAccount()

  invariant(currentChain, 'Network not found')

  return useQuery<AlchemyAssetTransaction[], Error>({
    queryKey: ['transactions', address, currentChain.id],
    queryFn: async () => {
      const params = new URLSearchParams({
        address: address,
        chainId: currentChain.id.toString(),
      });

      // Use params in the fetch call
      const response = await fetch(`/api/fetch-transactions?${params.toString()}`);
      return response.json();
    },
    enabled: options.enabled,
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });
}
