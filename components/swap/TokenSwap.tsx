'use client';
import { ContentCard } from '@/components/ContentCard';
import { ContentLayout } from '@/components/ContentLayout';
import { createSwapMachine, FeeTier, SwapContext } from '@/components/swap/machines/swap-machine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TokenSelect } from '@/components/ui/form/TokenSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { ERC20Token, isNativeToken, tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { UNISWAP_V3_QUOTER_ABI } from '@/const/uniswap/uniswap-v3-quoter-abi';
import { UNISWAP_V3_ROUTER_ABI } from '@/const/uniswap/uniswap-v3-router-abi';
import { usePortfolioBalance } from '@/context/PortfolioBalanceProvider';
import { cn } from '@/lib/cn';
import { CHAIN_TO_ADDRESSES_MAP } from '@uniswap/sdk-core';
import { useMachine } from '@xstate/react';
import { ArrowUpDown, Check } from 'lucide-react';
import Link from 'next/link';
import { Address, formatUnits, Hash, parseEther, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { assign, fromPromise } from 'xstate';

const { swapRouter02Address, quoterAddress } = CHAIN_TO_ADDRESSES_MAP[sepolia.id];

export type FeeOption = {
  fee: FeeTier;
  label: string;
  description: string;
  volume: string;
  color: string;
};

export const poolFeeOptions: FeeOption[] = [
  {
    fee: 500,
    label: '0.05%',
    description: 'Best for very stable pairs',
    volume: 'High',
    color: 'text-green-400',
  },
  {
    fee: 3000,
    label: '0.3%',
    description: 'Best for most pairs',
    volume: 'Medium',
    color: 'text-blue-400',
  },
  {
    fee: 10000,
    label: '1.0%',
    description: 'Best for exotic pairs',
    volume: 'Low',
    color: 'text-orange-400',
  },
];

export const poolFeeMap: Record<FeeTier, FeeOption> = poolFeeOptions.reduce(
  (acc, feeItem) => {
    acc[feeItem.fee] = feeItem;
    return acc;
  },
  {} as Record<FeeTier, FeeOption>
);

const SLIPPAGE_TOLERANCE = 500n; // 5.0% (500 bps)
const SLIPPAGE_DENOMINATOR = 10000n;

export function TokenSwap() {
  const publicClient = usePublicClient();
  const { balances } = usePortfolioBalance();

  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  const fetchQuoteActor = fromPromise<bigint, SwapContext>(async ({ input }) => {
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
  });

  const submitSwapActor = fromPromise<Hash, SwapContext>(async ({ input }) => {
    let txHash: Hash;

    try {
      if (isNativeToken(input.tokenIn) && input.tokenOut === tokenMap.weth.symbol) {
        txHash = await writeContractAsync({
          address: (tokenMap.weth as ERC20Token).address,
          abi: (tokenMap.weth as ERC20Token).abi,
          functionName: 'deposit',
          args: [],
          value: parseEther(input.amount), // Amount of WETH to deposit
        });
      } else {
        // Test multicall

        // const { capabilities, id } = await sendCallsAsync({
        //   account: address as Address,
        //   calls: [
        //     {
        //       address: tokenIn.address as Address,
        //       abi: tokenIn.abi as Abi,
        //       functionName: 'approve',
        //       args: [swapRouterAddress, parseEther(values.value.toString())],
        //     },
        //     {
        //       address: swapRouterAddress as Address,
        //       abi: UNISWAP_V3_ROUTER_ABI,
        //       functionName: 'exactInputSingle',
        //       args: [
        //         {
        //           tokenIn: tokenIn.address as Address,
        //           tokenOut: tokenOut.address as Address,
        //           fee: poolFee.fee,
        //           recipient: address as Address,
        //           amountIn: parseUnits(amount, tokenIn.decimals),
        //           amountOutMinimum, // Minimum amount of output tokens to receive
        //           sqrtPriceLimitX96: BigInt(0), // No price limit
        //         },
        //       ],
        //     },
        //   ],
        // });
        // console.log(capabilities, id);
        // txHash = id as Address;

        // Approve
        await writeContractAsync({
          address: (tokenMap[tokenIn] as ERC20Token).address,
          abi: (tokenMap[tokenIn] as ERC20Token).abi,
          functionName: 'approve',
          args: [swapRouter02Address, parseUnits(amount, tokenMap[tokenIn].decimals)],
        });

        // Swap
        txHash = await writeContractAsync({
          address: swapRouter02Address as Address,
          abi: UNISWAP_V3_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: (tokenMap[tokenIn] as ERC20Token).address,
              tokenOut: (tokenMap[tokenOut] as ERC20Token).address,
              fee: fee,
              recipient: address!,
              amountIn: parseUnits(amount, tokenMap[tokenIn].decimals),
              amountOutMinimum, // Minimum amount of output tokens to receive
              sqrtPriceLimitX96: 0n, // No price limit
            },
          ],
        });
      }

      return txHash;
    } catch (error) {
      console.error('Error submitting swap:', error);
      throw error || new Error('Failed to submit swap transaction');
    }
  });

  const awaitBlockchainConfirmationActor = fromPromise<void, { txHash: Hash }>(async ({ input }) => {
    try {
      if (input.txHash) {
        const receipt = await publicClient?.waitForTransactionReceipt({ hash: input.txHash });

        if (receipt?.status === 'success') {
          return;
        }

        if (receipt?.status === 'reverted') {
          throw new Error('Transaction reverted');
        }
        throw new Error('Transaction failed');
      }
      return;
    } catch (error) {
      console.error('Tx error:', error);
      throw error || new Error('Failed to wait for transaction confirmation');
    }
  });

  const machineWithDeps = createSwapMachine({
    actors: {
      fetchQuote: fetchQuoteActor,
      awaitBlockchainConfirmation: awaitBlockchainConfirmationActor,
      submitSwap: submitSwapActor,
    },
  }).provide({
    actions: {
      validateField: assign(({ context }: { context: SwapContext }) => {
        let errorMessage: string | undefined;
        const { amount, tokenIn } = context;
        const typedAmount = Number(amount);
        const tokenInBalance = balances.get(tokenIn)?.formattedValue ?? 0n;

        if (typedAmount <= 0) {
          errorMessage = 'Amount must be greater than 0';
        } else if (typedAmount > tokenInBalance) {
          errorMessage = 'Insufficient balance';
        }
        if (errorMessage) {
          return { ...context, fieldError: { amount: errorMessage } };
        }
        return { ...context, fieldError: undefined };
      }),
    },
  });

  const [state, send] = useMachine(machineWithDeps);

  const { tokenIn, tokenOut, amount, fee, quote } = state.context;

  const expectedAmountOut = quote ? Number(formatUnits(quote, tokenMap[tokenOut].decimals)) : 0;

  const amountOutMinimum = ((quote ?? 0n) * (SLIPPAGE_DENOMINATOR - SLIPPAGE_TOLERANCE)) / SLIPPAGE_DENOMINATOR;

  let formattedExchangeRate = '—';

  if (expectedAmountOut <= 0) {
    formattedExchangeRate = 'No liquidity';
  } else {
    const rate = expectedAmountOut / Number(amount);

    if (!isFinite(rate) || isNaN(rate) || rate <= 0) {
      formattedExchangeRate = 'No liquidity';
    } else {
      formattedExchangeRate = `1 ${tokenIn.toUpperCase()} = ${rate.toFixed(6)} ${tokenOut.toUpperCase()}`;
    }
  }

  return (
    <ContentLayout title="Swap" description="Exchange tokens instantly" goBackUrl="/dashboard/tokens">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <ContentCard
          title="Swap Tokens"
          description="Trade tokens in an instant"
          badge={<Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400">Uniswap V3</Badge>}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">You Pay</Label>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>
                  Balance: {balances.get(tokenIn)?.formattedValue.toFixed(8) ?? 0} {tokenIn.toLocaleUpperCase()}
                </span>
              </div>
            </div>

            <ContentCard variant="light" className="pt-4">
              <div className="relative flex flex-row items-center justify-between">
                <div>
                  <Input
                    onChange={(e) => send({ type: 'CHANGE', field: 'amount', value: e.target.value })}
                    id="value"
                    type="number"
                    name="value"
                    placeholder="0.00"
                    className="h-auto appearance-none border-none bg-transparent p-0 text-5xl font-bold text-gray-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                  />

                  <div className="mt-1 text-sm text-gray-400">
                    ≈$
                    {tokenIn && ((balances.get(tokenIn)?.tokenPrice ?? 0) * Number(amount)).toFixed(2)}
                  </div>
                </div>

                <p className="absolute -bottom-6">
                  {state.context.fieldError?.amount && (
                    <span className="text-sm text-yellow-300">{state.context.fieldError.amount}</span>
                  )}
                </p>

                <div className="flex items-center">
                  <TokenSelect
                    name="tokenIn"
                    value={tokenIn}
                    tokens={tokens}
                    onChange={(tokenSymbol: TokenMapKey) => {
                      send({ type: 'CHANGE', field: 'tokenIn', value: tokenSymbol });
                    }}
                  />
                </div>
              </div>
            </ContentCard>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={() => send({ type: 'SWAP_TOKENS' })}
                size="icon"
                className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 hover:shadow-blue-500/25"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>

            <Label htmlFor="tokenOut" className="text-sm font-medium text-white">
              You Receive
            </Label>

            <ContentCard variant="light" className="pt-4">
              <div className="flex items-center gap-1">
                <div className="flex-1 truncate overflow-hidden text-5xl font-bold text-gray-200">
                  {state.matches('loadingQuote') ? (
                    <Loader iconOnly size="sm" />
                  ) : // <span className="animate-pulse text-xs">Fetching quote</span>
                  quote && amount ? (
                    expectedAmountOut
                  ) : (
                    '0'
                  )}
                </div>

                <div className="flex items-center">
                  <TokenSelect
                    name="tokenOut"
                    value={tokenOut}
                    tokens={tokens}
                    onChange={(tokenSymbol: TokenMapKey) => {
                      send({ type: 'CHANGE', field: 'tokenOut', value: tokenSymbol });
                    }}
                  />
                </div>
              </div>
            </ContentCard>

            {/* Swap Details */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-out',
                Number(amount) > 0
                  ? 'mt-4 max-h-[500px]' // “open” state: enough max-height + some top margin
                  : 'mt-0 max-h-0' // “closed” state: zero height + no margin
              )}
            >
              <ContentCard variant="light" className="space-y-6 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white">{formattedExchangeRate}</span>
                </div>

                {/* Pool Fee Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white">Pool Fee</span>
                    </div>
                    <span className="text-sm text-gray-400">Select fee tier</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {poolFeeOptions.map((option) => (
                      <Button
                        type="button"
                        key={option.fee}
                        variant="outline"
                        onClick={() => send({ type: 'CHANGE', field: 'fee', value: option.fee })}
                        className={`flex h-auto cursor-pointer flex-col items-center gap-1 p-3 transition-all duration-200 hover:bg-gray-700 ${
                          fee === option.fee
                            ? `border-2 ${option.color.replace('text-', 'border-')} bg-gray-700`
                            : 'border-gray-600 bg-gray-800'
                        }`}
                      >
                        <span className={`font-bold ${fee === option.fee ? option.color : 'text-white'}`}>
                          {option.label}
                        </span>
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
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Selected Pool Fee</span>
                    </div>
                    <span className="text-white">{poolFeeMap[fee].label}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Slippage Tolerance</span>
                    </div>
                    <span className="text-white">{(Number(SLIPPAGE_TOLERANCE) / 100).toFixed(2)}%</span>
                  </div>
                </div>
              </ContentCard>
            </div>

            <div className="text- mt-4 flex w-full justify-center">
              <Button
                type="submit"
                className="mt-4"
                size="xl"
                onClick={() => send({ type: 'EXECUTE_SWAP' })}
                disabled={state.matches('submitting') || quote === undefined}
              >
                Swap
              </Button>
            </div>
          </div>
        </ContentCard>
      </div>

      <TransactionStatusDialog
        open={Object.keys(TRANSACTION_STATUSES).includes(state.value as string)}
        errorMessage={state.context.submitError}
        status={state.value as TransactionStatus}
        onClose={() => {
          send({ type: 'RESET' });
        }}
        onNewSwap={() => {
          send({ type: 'RESET' });
        }}
      />
    </ContentLayout>
  );
}

const TRANSACTION_STATUSES = {
  submitting: {
    title: 'Awaiting wallet confirmation',
    icon: <Loader />,
    message: 'Please confirm the transaction in your wallet.',
  },
  awaitingBlockchainConfirmation: {
    title: 'Transaction Pending',
    icon: <Loader />,
    message: 'Waiting for confirmation on the blockchain...',
  },
  confirmed: {
    title: 'Congratulations - Swap Confirmed',
    // confetti like lucide react icon
    icon: <Check className="text-3xl text-green-400" />,
    message: (
      <>
        Your swap was successful! <br />
        You can view it in your{' '}
        <Link className="font-semibold text-blue-500" href="/dashboard/transactions">
          transaction history
        </Link>
        .
      </>
    ),
  },
  submittingError: {
    title: 'Transaction Failed',
    icon: <span className="text-3xl text-red-400">✗</span>,
    message: 'Transaction failed. Please try again.',
  },
} as const;

type TransactionStatus = keyof typeof TRANSACTION_STATUSES;

type TransactionStatusDialogProps = {
  open: boolean;
  errorMessage?: string;
  status: TransactionStatus;
  onClose: () => void;
  onNewSwap?: () => void;
};

export const TransactionStatusDialog = ({
  open,
  errorMessage,
  status,
  onClose,
  onNewSwap,
}: TransactionStatusDialogProps) => {
  const current = TRANSACTION_STATUSES[status];
  const message = status === 'submittingError' ? errorMessage : current?.message;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-center">{current?.title || 'Swap'}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col items-center gap-2 py-4">
          <>
            {current?.icon}
            <span className="text-center text-gray-400">{message}</span>
          </>
        </DialogDescription>
        <DialogFooter>
          {status === 'confirmed' && (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/tokens">Go back to Dashboard</Link>
              </Button>
              <Button variant="default" onClick={onNewSwap}>
                New Swap
              </Button>
            </>
          )}
          {status === 'submittingError' && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
