import invariant from 'tiny-invariant';
import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;

invariant(ALCHEMY_API_KEY, 'ALCHEMY_API_KEY is not found');

// Override, since a default localhost wagmi/chains  didn't match
export const localhost = defineChain({
  id: 31337,
  name: 'Dev Network',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] }, },
});


export const config = createConfig({
  chains: [
    mainnet,
    sepolia, // testnet
    localhost,
  ],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [localhost.id]: http(),
  },
})
