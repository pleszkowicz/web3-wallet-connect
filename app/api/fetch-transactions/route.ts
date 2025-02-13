'use server';
import { config } from "@/config/wagmiConfig";
import { EtherscanTransaction } from "@/types/EtherscanTransaction";
import { NextApiRequest } from "next";
import invariant from "tiny-invariant";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY as string;

invariant(ETHERSCAN_API_KEY, 'ETHERSCAN_API_KEY is not found');

type EtherscanResponse = {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export async function GET(req: NextApiRequest) {
  const url = new URL(req.url ?? '', 'http://localhost:3000') // dummy base URL to extract params
  const address = url.searchParams.get('address')
  const chainId = url.searchParams.get('chainId')

  const currentChain = config.chains.find((chain) => chainId === chain.id.toString())

  if (!address) {
    return Response.json({ error: 'Address is required' }, { status: 400 });
  }

  const apiUrl = currentChain?.blockExplorers?.default.apiUrl

  console.log('etherscanAPIUrl', apiUrl)

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

    return Response.json(data.result);
  } catch (error: unknown) {
    console.error('Error fetching transactions:', error);
    return Response.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
