// pages/api/fetchTransactions.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import invariant from "tiny-invariant";
import { mainnet, sepolia } from "wagmi/chains";
import { EtherscanTransaction } from "@/types/EtherscanTransaction";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY as string;

invariant(ETHERSCAN_API_KEY, 'ETHERSCAN_API_KEY is not set');


interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, network, page, offset } = req.query;


  if (!address || typeof address !== 'string') {
    res.status(400).json({ error: 'Address is required and must be a string.' });
    return;
  }

  const url = new URL((network === 'sepolia' ? sepolia : mainnet).blockExplorers.default.apiUrl)
  const params: Record<string, string> = {
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    page: (page as string) || '1',
    offset: (offset as string) || '10',
    sort: 'desc',
    apikey: ETHERSCAN_API_KEY,
  };

  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());

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
