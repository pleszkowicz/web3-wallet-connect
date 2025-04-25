import invariant from 'tiny-invariant';
import { createConfig, webSocket } from 'wagmi';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;
invariant(ALCHEMY_API_KEY, 'ALCHEMY_API_KEY is not found');

export const chainTransportsURLMap = {
  [sepolia.id]: {
    webSocket: `wss://eth-sepolia.g.alchemy.com/v2/P_GFW7qc_w2oYJmtO7PYYtdPwNESKN96`,
    http: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [mainnet.id]: {
    webSocket: `wss://eth-mainnet.g.alchemy.com/v2/P_GFW7qc_w2oYJmtO7PYYtdPwNESKN96`,
    http: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [hardhat.id]: {
    webSocket: 'ws://localhost:8545',
    http: undefined,
  },
};

export const transports = {
  [sepolia.id]: webSocket(chainTransportsURLMap[sepolia.id].webSocket, { retryCount: 0 }),
  [mainnet.id]: webSocket(chainTransportsURLMap[mainnet.id].webSocket, { retryCount: 0 }),
  [hardhat.id]: webSocket(chainTransportsURLMap[hardhat.id].webSocket, { retryCount: 0 }),
};

export const config = createConfig({
  chains: [sepolia, mainnet, hardhat],
  connectors: [],
  transports,
});
