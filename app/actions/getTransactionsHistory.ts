'use server';
import { chainTransportsURLMap, config, transports } from "@/config/wagmiConfig";
import { AlchemyAssetTransaction } from "@/types/AlchemyAssetTransaction";
import invariant from "tiny-invariant";
import { Address, createPublicClient, formatEther, http } from "viem";
import { hardhat } from "viem/chains";

type AlchemyResponse = {
    transfers: AlchemyAssetTransaction[];
}

type TransportKeys = keyof typeof transports;
type GetTransactionsHistoryTypeProps = { address: Address, chainId: number }

export async function getTransactionsHistory({ address, chainId }: GetTransactionsHistoryTypeProps) {
    invariant(chainId, '`chainId` is required');
    invariant(address, '`address` is required');

    const currentChain = config.chains.find((chain) => chainId === chain.id)
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

        return result.transfers
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
                        asset: 'ETH', // mocked; not possible to map to Alchemy response
                        category: 'erc20', //  mocked; not possible to map to Alchemy response
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

        return transactions
    }
    return []
}
