import { Abi, Address } from 'viem';
import { LINK_TOKEN_ABI } from './abi/link-token-abi';
import { USDC_ABI } from './abi/usdc-abi';
import { WETH_ABI } from './abi/weth-abi';

type NativeToken = {
  symbol: string;
  decimals: number;
  label: string;
  logo: string;
  type: 'native';
  faucetUrl?: string;
}

export type ERC20Token = Omit<NativeToken, 'type'> & {
  abi: Abi;
  address: Address;
  type: 'erc20';
}

export type Token = NativeToken | ERC20Token;

export type TokenMapKey = keyof typeof tokenMap;

export const tokenMap: Record<Token['symbol'], Token> = {
  eth: {
    symbol: 'eth',
    label: 'Sepolia ETH',
    decimals: 18,
    logo: '/images/tokens/eth.png',
    type: 'native',
    faucetUrl: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia'
  },
  weth: {
    symbol: 'weth',
    label: 'Wrapped Ethereum',
    address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
    decimals: 18,
    abi: WETH_ABI,
    logo: '/images/tokens/weth.png',
    type: 'erc20',
  },
  link: {
    symbol: 'link',
    label: 'ChainLink Token',
    address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    decimals: 18,
    abi: LINK_TOKEN_ABI,
    logo: '/images/tokens/link.png',
    type: 'erc20',
    faucetUrl: 'https://faucets.chain.link/sepolia'
  },
  usdc: {
    symbol: 'usdc',
    label: 'USD Coin',
    address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    decimals: 6,
    abi: USDC_ABI,
    logo: '/images/tokens/usdc.png',
    type: 'erc20',
  },
};

export const tokens: Token[] = Object.values(tokenMap);

export const erc20Tokens = tokens.filter((token) => token.symbol !== tokenMap.eth.symbol) as ERC20Token[];

export const isErc20 = (token: Token): token is ERC20Token => 'address' in token && 'abi' in token;

export const isNativeToken = (tokenSymbol: TokenMapKey) => tokenMap[tokenSymbol].type === 'native';
