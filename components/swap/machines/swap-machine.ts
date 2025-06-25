import { tokenMap, TokenMapKey } from "@/const/tokens";
import { Hash } from "viem";
import { AnyEventObject, assign, createMachine } from "xstate";

export type FeeTier = 500 | 3000 | 10000;

export interface SwapContext {
  tokenIn: TokenMapKey;
  tokenOut: TokenMapKey;
  amount: string;
  fee: FeeTier;
  quote?: bigint;
  fieldError?: Partial<Record<keyof Pick<SwapContext, 'tokenIn' | 'tokenOut' | 'amount' | 'fee'>, string>>;
  submitError?: string;
  dirty: boolean; // helper to prevent unnecessary re-fetching of quotes
}

export type SwapEvent =
  | { type: 'CHANGE'; field: keyof Pick<SwapContext, 'tokenIn' | 'tokenOut' | 'amount' | 'fee'>; value: string | number }
  | { type: 'xstate.done.actor.fetchQuote'; output: bigint }
  | { type: 'SWAP_TOKENS'; field: 'tokenIn' | 'tokenOut'; value: string }
  | { type: 'EXECUTE_SWAP'; }
  | { type: 'AWAIT_CONFIRMATION'; }
  | { type: 'RESET' };

const initialContext = {
  tokenIn: tokenMap.link.symbol,
  tokenOut: tokenMap.usdc.symbol,
  amount: '',
  fee: 3000,
  quote: undefined,
  fieldError: undefined,
  submitError: undefined,
  dirty: false,
} as SwapContext

export const swapMachine = createMachine(
  {
    id: 'swap',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {
        on: {
          CHANGE: { actions: ['clearQuote', 'updateField', 'validateField'] },
          SWAP_TOKENS: { actions: ['clearQuote', 'swapTokens', 'validateField'] },
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
            actions: 'setSubmitError',
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
          onError: [{
            // user rejected the request
            guard: ({ event }) => {
              if ((event?.error as Error)?.message?.includes('User rejected the request')) {
                return true;
              }
              return false;
            },
            target: 'idle',
            actions: [
              'clearSubmitError'
            ]
          }, {
            target: 'submittingError',
            actions: 'setSubmitError',
          }],
        },
      },
      awaitingBlockchainConfirmation: {
        invoke: {
          id: 'await-blockchain-confirmation',
          src: 'awaitBlockchainConfirmation',
          input: ({ event }) => ({
            txHash: event.output! as Hash,
          }),
          onDone: {
            actions: 'resetContext',
            target: 'confirmed',
          },
          onError: [{
            // user rejected the request
            guard: ({ event }) => {
              if ((event?.error as Error)?.message?.includes('User rejected the request')) {
                return true;
              }
              return false;
            },
            target: 'idle',
            actions: [
              'clearSubmitError'
            ]
          }, {
            target: 'submittingError',
            actions: 'setSubmitError',
          }],
        },
      },
      confirmed: {
        on: {
          RESET: { target: 'idle' },
        },
      },
      submittingError: {
        on: {
          RESET: { target: 'idle', actions: 'resetContext' },
        }
      }
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
      updateField: assign(({ context, event }: { context: SwapContext; event: AnyEventObject }): SwapContext => {
        if (event.type === 'CHANGE') {
          return { ...context, [event.field]: event.value, dirty: true };
        }
        return context;
      }),

      swapTokens: assign(({ context, event }: { context: SwapContext; event: AnyEventObject }): SwapContext => {
        if (event.type === 'SWAP_TOKENS') {
          return { ...context, tokenIn: context.tokenOut, tokenOut: context.tokenIn, dirty: true, submitError: undefined };
        }
        return context;
      }),
      setQuote: assign({
        dirty: () => false, // prevent unnecessary re-fetching
        quote: ({ event }: { event: AnyEventObject }) => {
          // actors have a specific event type for done events
          if (event.type === 'xstate.done.actor.fetchQuote') {
            return event.output;
          }
        },
      }),
      clearQuote: assign(({ context }: { context: SwapContext }): SwapContext => ({
        ...context,
        quote: undefined,
        submitError: undefined,
        dirty: false,
      })),
      setSubmitError: assign({
        submitError: ({ event }: { event: AnyEventObject }) => {
          return event?.error?.message || 'An error occurred while processing your request.';
        },
        dirty: () => false,
      }),
      clearSubmitError: assign(({ context }: { context: SwapContext }): SwapContext => ({
        ...context,
        submitError: undefined,
      })),
      resetContext: assign(() => (initialContext)),
    },
  }
);
