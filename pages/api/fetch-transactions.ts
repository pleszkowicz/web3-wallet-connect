import type { NextApiRequest, NextApiResponse } from 'next';
import invariant from "tiny-invariant";
import { EtherscanTransaction } from "@/types/EtherscanTransaction";
import { config } from "@/config/wagmiConfig";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY as string;

console.log('ETHERSCAN_API_KEY', ETHERSCAN_API_KEY)

invariant(ETHERSCAN_API_KEY, 'ETHERSCAN_API_KEY is not set');

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = new URL(req.url!, 'http://localhost:3000') // dummy base URL
  const address = url.searchParams.get('address')
  const chainId = url.searchParams.get('chainId')

  const currentChain = config.chains.find((chain) => chainId === chain.id.toString())

  if (!address) {
    res.status(400).json({ error: 'Address and chainId is required and must be a string.' });
    return;
  }

  const apiUrl = currentChain?.blockExplorers?.default.apiUrl
  invariant(apiUrl, 'Chain API URL is not found');

  const etherscanAPIUrl = new URL(apiUrl)
  const params: Record<string, string> = {
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    sort: 'desc',
    apikey: ETHERSCAN_API_KEY,
  };

  Object.keys(params).forEach((key) => etherscanAPIUrl.searchParams.append(key, params[key]));


  try {
    const response = await fetch(etherscanAPIUrl.toString());

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data: EtherscanResponse = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch transactions');
    }

    res.status(200).json(data.result);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
