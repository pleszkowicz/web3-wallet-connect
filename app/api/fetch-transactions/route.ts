'use server';
import { config } from "@/config/wagmiConfig";
import { EtherscanTransaction } from "@/types/EtherscanTransaction";
import { NextRequest } from "next/server";
import invariant from "tiny-invariant";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY as string;

invariant(ETHERSCAN_API_KEY, 'ETHERSCAN_API_KEY is not found');

type EtherscanResponse = {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url ?? '', 'http://localhost:3000') // dummy base URL to extract params
  const address = url.searchParams.get('address')
  const chainId = url.searchParams.get('chainId')

  const currentChain = config.chains.find((chain) => chainId === chain.id.toString())

  if (!address) {
    return Response.json({ error: 'Address is required' }, { status: 400 });
  }

  // Get Etherscan API URL
  const apiUrl = currentChain?.blockExplorers?.default.apiUrl

  console.log('apiUrl', apiUrl)

  if (apiUrl) {
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
  } else if (currentChain?.id === hardhat.id) {
    // custom solutiom for hardhad local node since Etherscan doesn't work with local nodes
    const client = createPublicClient({
      chain: hardhat,
      transport: http()
    })
    const latestBlock = await client.getBlockNumber()
    console.log('latestBlock', latestBlock)
    const startBlock = latestBlock >= BigInt(10) ? latestBlock - BigInt(10) : BigInt(0); // Ensure non-negative
    const transactions: Record<string, unknown>[] = [];

    console.log('startBlock', startBlock)
    console.log('latestBlock', latestBlock)

    for (let i = startBlock; i <= latestBlock; i++) {
      console.log('i', i)
      const block = await client.getBlock({ blockNumber: i });
      console.log('block', block)
      const blockTransactions = await Promise.all(
        block.transactions.map((hash) => client.getTransaction({ hash }))
      );

      console.log('blockTransactions', blockTransactions)

      blockTransactions.forEach((tx) => {
        console.log('tx:', tx)
        if (tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
          // enhance tx by block `timestamp`
          transactions.push({ timeStamp: block.timestamp, ...tx });
        }
      });
    }
    return new Response(JSON.stringify(transactions, replacer))
  }
}

function replacer(key: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}
