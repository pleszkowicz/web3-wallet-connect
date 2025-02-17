import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// I had to provide from scratch since default localhost wagmi/chains didn't work
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
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(), // Explicit RPC URL
  },
})
