import { Abi, Address } from 'viem';
import { BASE_SEPOLIA_LINK_TOKEN_ABI } from './abi/base-sepolia-link-token-abi';

export type Token = {
  symbol: string;
  address: Address;
  decimals: number;
  label: string;
  abi?: Abi;
};

export const tokenMap = {
  weth: {
    symbol: 'weth',
    label: 'Wrapped Ethereum (WETH)',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
  },
  usdc: { symbol: 'usdc', label: 'USD Coin (USDC)', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6 },
  link: {
    symbol: 'link',
    label: 'ChainLink Token (LINK)',
    address: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    decimals: 18,
    abi: BASE_SEPOLIA_LINK_TOKEN_ABI,
  },
  ora: { symbol: 'ora', label: 'ORA Coin (ORA)', address: '0xfCdb7D436faE3D330c408d1187eef1E9a5419a5A', decimals: 18 },
  dog: { symbol: 'dog', label: 'DogToken (DOG)', address: '0x41e7D8eD48b01138B7532D70b1edCb551df8c9d6', decimals: 18 },
  anymal: {
    symbol: 'anymal',
    label: 'Anymal Protocol (ANYMAL)',
    address: '0xfb65eF78e5B8D7718cf9BebAdfcCF3E46bD846Ac',
    decimals: 18,
  },
} as const;


export const tokens: Token[] = Object.values(tokenMap);
