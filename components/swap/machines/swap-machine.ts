import { poolFeeMap } from "@/components/swap/TokenSwap";
import { tokenMap, TokenMapKey } from "@/const/tokens";
import { Hash } from "viem";
import { AnyEventObject, assign, PromiseActorLogic, setup } from "xstate";

export type FeeTier = 500 | 3000 | 10000;

export type QuotesMap = Record<FeeTier, bigint>;

export interface SwapContext {
  tokenIn: TokenMapKey;
  tokenOut: TokenMapKey;
  amount: string;
  fee: FeeTier;
  quotesMap?: QuotesMap;
  fieldError?: Partial<Record<keyof Pick<SwapContext, 'tokenIn' | 'tokenOut' | 'amount' | 'fee'>, string>>;
  submitError?: string;
  dirty: boolean; // helper to prevent unnecessary re-fetching of quotes
}

export type SwapEvent =
  | { type: 'CHANGE'; field: keyof Pick<SwapContext, 'tokenIn' | 'tokenOut' | 'amount'>; value: string | number }
  | { type: 'UPDATE_FEE'; field: keyof SwapContext; value: FeeTier }
  | { type: 'xstate.done.actor.fetchQuotes'; output: QuotesMap }
  | { type: 'SWAP_TOKENS' }
  | { type: 'EXECUTE_SWAP'; }
  | { type: 'AWAIT_CONFIRMATION'; }
  | { type: 'RESET' };

const DEFAULT_FEE_TIER: FeeTier = 3000

const initialContext = {
  tokenIn: tokenMap.link.symbol,
  tokenOut: tokenMap.usdc.symbol,
  amount: '',
  fee: DEFAULT_FEE_TIER,
  quotesMap: undefined,
  fieldError: undefined,
  submitError: undefined,
  dirty: false,
} as SwapContext

type FetchQuotesLogic = PromiseActorLogic<QuotesMap, SwapContext>
type SubmitSwapLogic = PromiseActorLogic<Hash, SwapContext>
type AwaitConfirmationLogic = PromiseActorLogic<void, { txHash: Hash }>

export const swapMachine = setup({
  types: {
    context: {} as SwapContext,
    events: {} as SwapEvent,
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
    updateFee: assign({
      fee: ({ event }) => {
        if (event.type === 'UPDATE_FEE') {
          return event.value
        }
        return DEFAULT_FEE_TIER;
      }
    }),
    setQuotesAndFee: assign({
      dirty: false, // prevent unnecessary re-fetching
      fee: ({ event }) => {
        if (event.type === 'xstate.done.actor.fetchQuotes') {
          const quotesMap = event.output as QuotesMap;

          const bestFee: FeeTier | undefined = Object.entries(quotesMap).reduce((bestFee, [fee, currentAmount]) => {
            const bestAmount = quotesMap[bestFee];
            const feeNum = Number(fee) as FeeTier;
            return currentAmount > bestAmount ? feeNum : bestFee;
          }, DEFAULT_FEE_TIER as FeeTier);

          return bestFee ?? DEFAULT_FEE_TIER;
        }
        return DEFAULT_FEE_TIER;
      },
      quotesMap: ({ event }) => {
        // actors have a specific event type for done events
        if (event.type === 'xstate.done.actor.fetchQuotes') {
          return event.output;
        }
      },
    }),
    clearQuote: assign(({ context }: { context: SwapContext }): SwapContext => ({
      ...context,
      quotesMap: undefined,
      submitError: undefined,
      dirty: false,
    })),
    setSubmitError: assign({
      submitError: ({ event }) => {
        if ('error' in event && event.error) {
          return (event.error as Error)?.message || 'An error occurred while processing your request.';
        }
      },
      dirty: false,
    }),
    clearSubmitError: assign(({ context }: { context: SwapContext }): SwapContext => ({
      ...context,
      submitError: undefined,
    })),
    resetContext: assign(() => ({ ...initialContext })),
    validateField: () => {
      throw new Error('validateField action is not implemented yet');
    },
  },

  actors: {
    fetchQuotes: (() => { throw new Error('Provide actor logic') }) as unknown as FetchQuotesLogic,
    submitSwap: (() => { throw new Error('Provide actor logic') }) as unknown as SubmitSwapLogic,
    awaitBlockchainConfirmation: (() => { throw new Error('Provide actor logic') }) as unknown as AwaitConfirmationLogic,
  },

  guards: {
    canQuote: ({ context }) =>
      context.dirty &&
      Boolean(context.tokenIn) &&
      Boolean(context.tokenOut) &&
      context.amount !== '' &&
      Number(context.amount) > 0,
  },

}).createMachine(
  {
    id: 'swap',
    initial: 'idle',
    context: { ...initialContext },
    states: {
      idle: {
        on: {
          CHANGE: { actions: ['clearQuote', 'updateField', 'validateField'] },
          UPDATE_FEE: { actions: 'updateFee' },
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
        invoke: [{
          id: 'fetchQuotes',
          src: 'fetchQuotes',
          input: ({ context }: { context: SwapContext }) => context,
          onDone: {
            target: 'idle',
            actions: 'setQuotesAndFee',
          },
          onError: {
            target: 'idle',
            actions: 'setSubmitError',
          },
        }],
      },
      submitting: {
        invoke: [{
          id: 'submitSwap',
          src: 'submitSwap',
          input: ({ context }: { context: SwapContext }) => context,
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
        }],
      },
      awaitingBlockchainConfirmation: {
        invoke: {
          id: 'awaitBlockchainConfirmation',
          src: 'awaitBlockchainConfirmation',
          input: ({ event }: { event: AnyEventObject }) => ({
            txHash: event.output! as Hash,
          }),
          onDone: {
            actions: 'resetContext',
            target: 'confirmed',
          },
          onError: [{
            // user rejected the request
            guard: ({ event }: { event: AnyEventObject }) => {
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
);

type CreateSwapMachineTypes = {
  actors: {
    fetchQuotes: FetchQuotesLogic
    submitSwap: SubmitSwapLogic
    awaitBlockchainConfirmation: AwaitConfirmationLogic
  }
}

// Enforce devs to provide necessary dependencies
export function createSwapMachine({ actors }: CreateSwapMachineTypes) {
  return swapMachine.provide({ actors })
}

