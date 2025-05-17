import { Abi, Address } from 'viem';
import { WETH_ABI } from './abi/weth-abi';
import { LINK_TOKEN_ABI } from './abi/link-token-abi';
import { DOG_TOKEN_ABI } from './abi/dog-token-abi';
import { USDC_ABI } from './abi/usdc-abi';
import { ANYMAL_PROTOCOL_ABI } from './abi/anymal-protocol-token-abi';

export type Token = {
  symbol: string;
  address?: Address;
  decimals: number;
  label: string;
  abi?: Abi;
};

export type TokenMapKey = keyof typeof tokenMap;

export const tokenMap = {
  eth: {
    symbol: 'eth', label: 'Ethereum (ETH)', address: undefined, decimals: 18, abi: undefined,
  },
  weth: {
    symbol: 'weth',
    label: 'Wrapped Ethereum (WETH)',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    abi: WETH_ABI,
  },
  usdc: { symbol: 'usdc', label: 'USD Coin (USDC)', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6, abi: USDC_ABI },
  link: {
    symbol: 'link',
    label: 'ChainLink Token (LINK)',
    address: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    decimals: 18,
    abi: LINK_TOKEN_ABI,
  },
  dog: { symbol: 'dog', label: 'DogToken (DOG)', address: '0x41e7D8eD48b01138B7532D70b1edCb551df8c9d6', decimals: 18, abi: DOG_TOKEN_ABI },
  anymal: {
    symbol: 'anymal',
    label: 'Anymal Protocol (ANYMAL)',
    address: '0xfb65eF78e5B8D7718cf9BebAdfcCF3E46bD846Ac',
    decimals: 18,
    abi: ANYMAL_PROTOCOL_ABI,
  },
} as const;


export const tokens: Token[] = Object.values(tokenMap);
