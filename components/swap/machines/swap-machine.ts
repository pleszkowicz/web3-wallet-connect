import { tokenMap, TokenMapKey } from "@/const/tokens";
import { Hash } from "viem";
import { assign, createMachine } from "xstate";

export type FeeTier = 500 | 3000 | 10000;

export interface SwapContext {
  tokenIn: TokenMapKey;
  tokenOut: TokenMapKey;
  amount: string;
  fee: FeeTier;
  quote?: bigint;
  error?: string;
  txHash?: Hash;
  dirty: boolean; // prevents unnecessary re-fetching of quotes
}

export type SwapEvent =
  | { type: 'CHANGE'; field: keyof Pick<SwapContext, 'tokenIn' | 'tokenOut' | 'amount' | 'fee'>; value: string | number }
  | { type: 'xstate.done.actor.fetchQuote'; output: bigint }
  | { type: 'SWAP_TOKENS'; field: 'tokenIn' | 'tokenOut'; value: string }
  | { type: 'EXECUTE_SWAP'; }
  | { type: 'AWAIT_CONFIRMATION'; }
  | { type: 'AWAIT_CONFIRMATION.DONE'; txHash: string }
  | { type: 'AWAIT_CONFIRMATION.ERROR'; data: unknown }
  | { type: 'RESET' };

const initialContext = {
  tokenIn: tokenMap.link.symbol,
  tokenOut: tokenMap.usdc.symbol,
  amount: '',
  fee: 3000,
  quote: undefined,
  error: undefined,
  dirty: false,
  txHash: undefined,
} as SwapContext

export const swapMachine = createMachine(
  {
    id: 'swap',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {
        on: {
          CHANGE: { actions: ['clearQuote', 'updateField',] },
          SWAP_TOKENS: { actions: ['clearQuote', 'swapTokens',] },
          EXECUTE_SWAP: 'submitting',
          AWAIT_CONFIRMATION: 'awaitingBlockchainConfirmation',
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
          input: ({ context }) => context,
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
          input: ({ context }) => context,
          onDone: {
            target: 'awaitingBlockchainConfirmation',
          },
          onError: {
            target: 'idle',
            actions: 'setError',
          },
        },
      },
      awaitingBlockchainConfirmation: {
        invoke: {
          id: 'await-blockchain-confirmation',
          src: 'awaitBlockchainConfirmation',
          input: ({ event }) => ({
            txHash: event.output as Hash,
          }),
          onDone: {
            actions: 'resetContext',
            target: 'confirmed',
          },
          onError: {
            target: 'idle',
            actions: 'setError',
          },
        },
      },
      confirmed: {
        on: {
          RESET: { target: 'idle' },
        },
      },
      submittingError: {
        on: {
          'AWAIT_CONFIRMATION.ERROR': {
            target: 'idle',
            actions: 'setError',
          },
        },
      },
      error: {
        on: {
          RESET: { target: 'idle', actions: 'resetContext' }
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
      swapTokens: assign(({ context, event }: { context: SwapContext; event: SwapEvent }) => {
        if (event.type === 'SWAP_TOKENS') {
          return { ...context, tokenIn: context.tokenOut, tokenOut: context.tokenIn, dirty: true, error: undefined };
        }
        return context;
      }),
      setQuote: assign({
        dirty: () => false, // prevent unnecessary re-fetching
        quote: ({ event }: { event: SwapEvent }) => {
          // actors have a specific event type for done events
          if (event.type === 'xstate.done.actor.fetchQuote') {
            return event.output;
          }
        },
        error: () => undefined,
      }),
      setError: assign({
        error: ({ event }: { event: { error: { message?: string } } }) => {
          return event.error.message;
        },
        dirty: () => false, // ← clear dirty on error too
      }),
      clearQuote: assign(({ context }: { context: SwapContext }) => ({
        ...context,
        quote: undefined,
        error: undefined,
        dirty: true,
      })),
      resetContext: assign(() => (initialContext)),
    },
  }
);
