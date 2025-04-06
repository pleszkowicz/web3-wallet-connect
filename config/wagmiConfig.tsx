import invariant from 'tiny-invariant';
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;

invariant(ALCHEMY_API_KEY, 'ALCHEMY_API_KEY is not found');

export const config = createConfig({
  chains: [
    mainnet,
    sepolia, // testnet
    hardhat,
  ],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [hardhat.id]: http(),
  },
});
