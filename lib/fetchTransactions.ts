import invariant from "tiny-invariant";
import { EtherscanTransaction } from "@/types/EtherscanTransaction";
import { Chain } from "wagmi/chains";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

invariant(ETHERSCAN_API_KEY, 'ETHERSCAN_API_KEY is not set');

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export const fetchTransactions = async(
  address: string,
  chain: Chain,
): Promise<EtherscanTransaction[]> => {
  invariant(chain.blockExplorers?.default.apiUrl, 'Chain API URL is not set');

  const url = new URL(chain.blockExplorers.default.apiUrl)
  const params: Record<string, string> = {
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    sort: 'desc',
    apikey: ETHERSCAN_API_KEY,
  };

  // Append query parameters to the URL
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data: EtherscanResponse = await response.json();

    return data.result;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
