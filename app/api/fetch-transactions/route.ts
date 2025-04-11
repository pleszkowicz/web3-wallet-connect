'use server';
import { chainTransportsURLMap, config } from "@/config/wagmiConfig";
import { AlchemyAssetTransaction } from "@/types/AlchemyAssetTransaction";
import { NextRequest } from "next/server";
import invariant from "tiny-invariant";
import { createPublicClient, formatEther, http } from "viem";
import { hardhat, mainnet, sepolia } from "viem/chains";

type AlchemyResponse = {
  transfers: AlchemyAssetTransaction[];
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url ?? '', 'http://localhost:3000') // dummy base URL to extract params
  const address = url.searchParams.get('address')
  const chainId = url.searchParams.get('chainId')

  invariant(chainId, 'Chain ID is required to be passed');

  const currentChain = config.chains.find((chain) => chainId === chain.id.toString())

  if (!address) {
    return Response.json({ error: 'Address is required' }, { status: 400 });
  }

  let network: string;

  switch (currentChain?.id) {
    case mainnet.id:
      network = 'eth-mainnet';
      break;
    case sepolia.id:
      network = 'eth-sepolia';
      break;
    default:
  }

  const apiUrl = chainTransportsURLMap[Number(chainId) as keyof typeof chainTransportsURLMap];

  if (apiUrl) {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromBlock: "0x0",
          toBlock: "latest",
          toAddress: address,
          category: ["external", "erc20", "erc721", "erc1155"],
          withMetadata: true,
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const { result }: { result: AlchemyResponse } = await response.json();

    return Response.json(result.transfers);
  } else if (currentChain?.id === Number(hardhat.id)) {
    // custom solution for hardhat local node since there is no explorer
    // and we need to fetch transactions from the local node
    const client = createPublicClient({
      chain: hardhat,
      transport: http()
    })
    const latestBlock = await client.getBlockNumber()
    const startBlock = latestBlock >= BigInt(10) ? latestBlock - BigInt(10) : BigInt(0); // Ensure non-negative
    const transactions: AlchemyAssetTransaction[] = [];

    console.log('startBlock', startBlock)
    console.log('latestBlock', latestBlock)

    for (let i = startBlock; i <= latestBlock; i++) {
      const block = await client.getBlock({ blockNumber: i });
      const blockTransactions = await Promise.all(
        block.transactions.map((hash) => client.getTransaction({ hash }))
      );

      blockTransactions.forEach((tx) => {
        if (tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
          transactions.push({
            blockNum: tx.blockHash,
            hash: tx.hash,
            from: tx.from,
            to: tx.to as string,
            value: Number(formatEther(tx.value)), // match with the format returned by Alchemy
            asset: 'ETH', // not possible to map it at this moment
            category: 'erc20', // not possible to map it at this moment
            rawContract: {
              value: tx.value as unknown as string,
              address: tx.to as unknown as string,
              decimal: undefined,
            },
            metadata: {
              blockTimestamp: new Date(Number(block.timestamp) * 1000).toString(), // e.g. "2023-11-15T12:34:56.000Z"
            }
          });
        }
      });
    }

    return new Response(JSON.stringify(transactions, replacer))
  }
}

function replacer(key: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}
