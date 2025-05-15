import invariant from 'tiny-invariant';
import { createConfig, webSocket } from 'wagmi';
import { base, baseSepolia, hardhat } from 'wagmi/chains';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
invariant(ALCHEMY_API_KEY, 'ALCHEMY_API_KEY is not found');

export const chainTransportsURLMap = {
  [base.id]: {
    webSocket: `wss://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    http: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [baseSepolia.id]: {
    webSocket: `wss://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    http: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [hardhat.id]: {
    webSocket: 'ws://localhost:8545',
    http: undefined,
  },
};

export const transports = {
  [base.id]: webSocket(chainTransportsURLMap[base.id].webSocket, { retryCount: 0 }),
  [baseSepolia.id]: webSocket(chainTransportsURLMap[baseSepolia.id].webSocket, { retryCount: 0 }),
  [hardhat.id]: webSocket(chainTransportsURLMap[hardhat.id].webSocket, { retryCount: 0 }),
};

export const config = createConfig({
  chains: [base, baseSepolia, hardhat],
  connectors: [],
  ssr: true,
  transports,
});
