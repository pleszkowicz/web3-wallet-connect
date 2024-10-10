import invariant from "tiny-invariant";
import { EtherscanTransaction } from "@/types/EtherscanTransaction";
import { Chain } from "wagmi/chains";

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export const fetchTransactions = async (
  address: string,
  chain: Chain
): Promise<EtherscanTransaction[]> => {
  const res = await fetch(`/api/fetch-transactions?address=${address}&chainId=${chain.id}`);
  const data: EtherscanTransaction[] = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return data;
};
