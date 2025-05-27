import { Abi, Address } from 'viem';
import { LINK_TOKEN_ABI } from './abi/link-token-abi';
import { USDC_ABI } from './abi/usdc-abi';
import { WETH_ABI } from './abi/weth-abi';

export type Token = {
  symbol: string;
  address?: Address;
  decimals: number;
  label: string;
  abi?: Abi;
  logo: string;
  faucetUrl: string;
};

export type TokenMapKey = keyof typeof tokenMap;

export const tokenMap = {
  eth: {
    symbol: 'eth',
    label: 'Sepolia ETH',
    address: undefined,
    decimals: 18,
    abi: undefined,
    logo: 'https://token-icons.s3.amazonaws.com/eth.png',
    faucetUrl: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia'
  },
  weth: {
    symbol: 'weth',
    label: 'Wrapped Ethereum',
    address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
    decimals: 18,
    abi: WETH_ABI,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  link: {
    symbol: 'link',
    label: 'ChainLink Token',
    address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    decimals: 18,
    abi: LINK_TOKEN_ABI,
    logo: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  },
  usdc: {
    symbol: 'usdc',
    label: 'USD Coin',
    address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    decimals: 6,
    abi: USDC_ABI,
    logo: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
  },
} as const;

export const tokens: Token[] = Object.values(tokenMap);

export const erc20Tokens = tokens.filter((token) => token.symbol !== tokenMap.eth.symbol);
