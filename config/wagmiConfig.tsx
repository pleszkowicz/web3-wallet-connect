import invariant from 'tiny-invariant';
import { createConfig, http } from 'wagmi';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;

invariant(ALCHEMY_API_KEY, 'ALCHEMY_API_KEY is not found');

export const chainTransportsURLMap = {
  [sepolia.id]: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [mainnet.id]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
};

export const transports = {
  [sepolia.id]: http(chainTransportsURLMap[sepolia.id]),
  [hardhat.id]: http(), // created custom transaction history handler
  [mainnet.id]: http(chainTransportsURLMap[mainnet.id]),
};

export const config = createConfig({
  chains: [
    sepolia, // testnet
    hardhat,
    mainnet,
  ],
  connectors: [],
  transports,
});
