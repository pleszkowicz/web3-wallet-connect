'use client';
import { poolFeeOptions } from '@/components/swap/TokenExchange';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TokenSelect2 } from '@/components/ui/form/TokenSelect2';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERC20Token, tokenMap, TokenMapKey, tokens } from '@/const/tokens';
// machines/swapMachine.ts
import { UNISWAP_V3_QUOTER_ABI } from '@/const/uniswap/uniswap-v3-quoter-abi';
import { UNISWAP_V3_ROUTER_ABI } from '@/const/uniswap/uniswap-v3-router-abi';
import { CHAIN_TO_ADDRESSES_MAP } from '@uniswap/sdk-core';
import { useMachine } from '@xstate/react';
import { Address, formatUnits, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import type { UseWriteContractReturnType } from 'wagmi';
import { useAccount, usePublicClient, UsePublicClientReturnType, useWriteContract } from 'wagmi';
import { assign, createMachine, fromPromise } from 'xstate';

const { swapRouter02Address: swapRouterAddress, quoterAddress } = CHAIN_TO_ADDRESSES_MAP[sepolia.id];

// types/xstate-system.d.ts

export interface SwapSystem {
  publicClient: UsePublicClientReturnType;
  writeContractAsync: UseWriteContractReturnType['writeContractAsync'];
}

// 3) Definicja maszyny
interface SwapContext {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  fee: number;
  quote?: bigint;
  error?: string;
}

type SwapEvent =
  | { type: 'CHANGE'; field: keyof Omit<SwapContext, 'quote' | 'error'>; value: string | number }
  | { type: 'GET_QUOTE' }
  | { type: 'DO_SWAP'; recipient: string }
  | { type: 'RESET' }
  // standardowe eventy actorów:
  | { type: 'xstate.done.actor.fetchQuote'; output: bigint }
  | { type: 'xstate.error.actor.fetchQuote'; data: unknown }
  | { type: 'xstate.done.actor.submitSwap' }
  | { type: 'xstate.error.actor.submitSwap'; data: unknown };

export const swapMachine = createMachine(
  {
    id: 'swap',
    initial: 'idle',
    context: {
      tokenIn: tokenMap.weth.symbol,
      tokenOut: tokenMap.usdc.symbol,
      amount: '',
      fee: 3000,
      quote: undefined,
      error: undefined,
      dirty: false,
    },

    states: {
      idle: {
        on: {
          CHANGE: [{ actions: 'updateField' }],
          DO_SWAP: 'submitting',
          RESET: { target: 'idle', actions: 'resetContext' },
        },
        always: {
          guard: 'canQuote',
          target: 'loadingQuote',
        },
      },
      loadingQuote: {
        invoke: {
          id: 'fetchQuote',
          src: 'fetchQuote',
          input: ({ context }) => ({
            tokenIn: context.tokenIn,
            tokenOut: context.tokenOut,
            amount: context.amount,
            fee: context.fee,
          }),
          onDone: {
            target: 'idle',
            actions: 'setQuote',
          },
          onError: {
            target: 'idle',
            actions: 'setError',
          },
        },
      },
      submitting: {
        invoke: {
          id: 'submitSwap',
          src: 'submitSwap',
          input: ({ context }) => {
            return {
              tokenIn: context.tokenIn,
              tokenOut: context.tokenOut,
              amount: context.amount,
              fee: context.fee,
              recipient: context.recipient,
            };
          },
          onDone: {
            target: 'idle',
            actions: 'resetContext',
          },
          onError: {
            target: 'idle',
            actions: 'setError',
          },
        },
      },
    },
  },
  {
    guards: {
      canQuote: ({ context }) =>
        context.dirty &&
        Boolean(context.tokenIn) &&
        Boolean(context.tokenOut) &&
        context.amount !== '' &&
        Number(context.amount) > 0,
    },
    actions: {
      updateField: assign(({ context, event }: { context: SwapContext; event: SwapEvent }) => {
        if (event.type === 'CHANGE') {
          return { ...context, [event.field]: event.value, dirty: true };
        }
        return context;
      }),
      setQuote: assign({
        dirty: () => false,
        quote: ({ event }: { event: SwapEvent }) => {
          if (event.type === 'xstate.done.actor.fetchQuote') {
            return event.output;
          }
        },
        error: () => undefined,
      }),
      setError: assign({
        error: ({ event }: { event: { error: { message?: string } } }) => {
          debugger;
          return event.error.message;
        },
        dirty: () => false, // ← clear dirty on error too
      }),
      resetContext: assign(() => ({
        tokenIn: '',
        tokenOut: '',
        amount: '',
        fee: 3000,
        quote: undefined,
        error: undefined,
      })),
    },
  }
);

export function TokenExchange2() {
  const publicClient = usePublicClient();
  const writeContractAsync = useWriteContract();
  const { address } = useAccount();

  const fetchQuoteActor = fromPromise<bigint, { tokenIn: TokenMapKey; tokenOut: Address; amount: string; fee: number }>(
    async ({ input, system, ...rest }) => {
      const res = await publicClient?.simulateContract({
        address: quoterAddress as Address,
        abi: UNISWAP_V3_QUOTER_ABI,
        functionName: 'quoteExactInputSingle',
        args: [
          {
            tokenIn: (tokenMap[input.tokenIn] as ERC20Token).address,
            tokenOut: (tokenMap[input.tokenOut] as ERC20Token).address,
            amountIn: parseUnits(input.amount, tokenMap[input.tokenIn].decimals),
            fee: input.fee,
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
      });
      return res?.result[0] as bigint;
    }
  );

  const submitSwapActor = fromPromise<
    void,
    { tokenIn: Address; amount: string; fee: number; tokenOut: Address; recipient: Address }
  >(async ({ input, system }) => {
    // approve
    await writeContractAsync({
      address: (tokenMap[input.tokenIn] as ERC20Token).address,
      abi: (tokenMap[input.tokenIn] as ERC20Token).abi,
      functionName: 'approve',
      args: [swapRouterAddress!, parseUnits(input.amount, 18)],
    });
    // swap
    await writeContractAsync({
      address: swapRouterAddress! as Address,
      abi: UNISWAP_V3_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [
        {
          tokenIn: input.tokenIn,
          tokenOut: input.tokenOut,
          fee: input.fee,
          recipient: address,
          amountIn: parseUnits(input.amount, 18),
          amountOutMinimum: BigInt(0),
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    });
  });

  const machineWithDeps = swapMachine.provide({
    actors: {
      fetchQuote: fetchQuoteActor,
      submitSwap: submitSwapActor,
    },
  });

  const [state, send] = useMachine(machineWithDeps);

  const { tokenIn, tokenOut, amount, fee, quote, error } = state.context;

  console.log('state.context', state.context);
  console.log('tokenMap[tokenIn].decimals', tokenMap[tokenIn].decimals);
  console.log(
    'Number(formatUnits(quote, tokenMap[tokenIn].decimals)).toFixed(6)',
    quote && formatUnits(quote, tokenMap[tokenIn].decimals)
  );

  return (
    <div className="mx-auto max-w-md space-y-4 p-6 text-white">
      <TokenSelect2
        name="tokenIn"
        value={tokenIn}
        tokens={tokens}
        onChange={(tokenSymbol: TokenMapKey) => {
          send({ type: 'CHANGE', field: 'tokenIn', value: tokenSymbol });
        }}
      />

      <TokenSelect2
        name="tokenOut"
        value={tokenOut}
        tokens={tokens}
        onChange={(tokenSymbol: TokenMapKey) => {
          send({ type: 'CHANGE', field: 'tokenOut', value: tokenSymbol });
        }}
      />

      <Label htmlFor="amount">Amount</Label>
      <Input
        name="amount"
        type="number"
        value={amount}
        onChange={(e) => send({ type: 'CHANGE', field: 'amount', value: e.target.value })}
      />

      {/* <Select
        value={fee.toString()}
        onChange={(feeItem: FeeOption) => send({ type: 'CHANGE', field: 'fee', value: feeItem })}
        options={poolFeeOptions}
      /> */}

      {poolFeeOptions.map((option) => (
        <Button
          type="button"
          key={option.fee}
          variant="outline"
          onClick={() => send({ type: 'CHANGE', field: 'fee', value: option })}
          className={`flex h-auto cursor-pointer flex-col items-center gap-1 p-3 transition-all duration-200 hover:bg-gray-700 ${
            fee === option.fee
              ? `border-2 ${option.color.replace('text-', 'border-')} bg-gray-700`
              : 'border-gray-600 bg-gray-800'
          }`}
        >
          {/* <span className={`font-bold ${poolFee === option ? option.color : 'text-white'}`}>{option.label}</span> */}
          <span className="text-center text-xs leading-tight text-gray-400">{option.description}</span>
          <Badge
            className={`text-xs ${
              fee === option.fee
                ? `${option.color.replace('text-', 'bg-')}/20 ${option.color} border-current`
                : 'border-gray-500 bg-gray-600 text-gray-300'
            }`}
          >
            {option.volume} Volume
          </Badge>
        </Button>
      ))}

      <Button onClick={() => send({ type: 'GET_QUOTE' })} disabled={state.matches('loadingQuote')}>
        {state.matches('loadingQuote') ? 'Fetching…' : 'Get Quote'}
      </Button>
      {state.matches('loadingQuote') ? 'Fetching quote…' : ''}
      {quote && <div>Quote: {formatUnits(quote, tokenMap[tokenOut].decimals)}</div>}

      {error && <div className="text-red-500">Error: {error}</div>}

      <Button
        onClick={() => send({ type: 'DO_SWAP', recipient: /* Twój adres */ '' })}
        disabled={state.matches('submitting') || quote === undefined}
      >
        {state.matches('submitting') ? 'Swapping…' : 'Swap'}
      </Button>
    </div>
  );
}
