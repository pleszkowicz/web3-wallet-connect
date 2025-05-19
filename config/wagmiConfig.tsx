import invariant from 'tiny-invariant';
import { createConfig, webSocket } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
invariant(ALCHEMY_API_KEY, 'ALCHEMY_API_KEY is not found');

export const chainTransportsURLMap = {
  // [base.id]: {
  //   webSocket: `wss://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  //   http: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  // },
  [sepolia.id]: {
    webSocket: `wss://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    http: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [hardhat.id]: {
    webSocket: 'ws://localhost:8545',
    http: undefined,
  },
};

export const transports = {
  // [base.id]: webSocket(chainTransportsURLMap[base.id].webSocket, { retryCount: 0 }),
  [sepolia.id]: webSocket(chainTransportsURLMap[sepolia.id].webSocket, { retryCount: 0 }),
  [hardhat.id]: webSocket(chainTransportsURLMap[hardhat.id].webSocket, { retryCount: 0 }),
};

export const config = createConfig({
  chains: [/*base, */ sepolia, hardhat],
  connectors: [],
  ssr: true,
  transports,
});
