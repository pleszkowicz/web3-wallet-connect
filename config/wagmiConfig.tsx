import { defineChain } from 'viem';
import { http, createConfig, webSocket } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// I had to provide from scratch since default localhost wagmi/chains didn't work
export const localhost = defineChain({
  id: 31337,
  name: 'Dev Network',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'], webSocket: ['ws://127.0.0.1:8545'] }, },
});

export const config = createConfig({
  chains: [
    mainnet,
    sepolia, // testnet
    localhost,
  ],
  connectors: [
    // injected(),
  ],
  transports: {
    [mainnet.id]: webSocket(`wss://mainnet.infura.io/ws/v3/YOUR_INFURA_ID`),
    [sepolia.id]: webSocket(`wss://sepolia.infura.io/ws/v3/YOUR_INFURA_ID`),
    [localhost.id]: webSocket(), // Dodanie WebSocket dla localhost
  },
})
