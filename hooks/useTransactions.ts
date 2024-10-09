import { EtherscanTransaction } from "@/types/EtherscanTransaction";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/lib/fetchTransactions";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export const useTransactions = (address: string, options: { enabled: boolean }) => {
  const { chain: currentChain } = useAccount()

  invariant(currentChain, 'Network not found')

  return useQuery<EtherscanTransaction[], Error>({
    queryKey: ['transactions', address, currentChain.id],
    queryFn: () => fetchTransactions(address, currentChain),
    enabled: options.enabled,
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });
}
