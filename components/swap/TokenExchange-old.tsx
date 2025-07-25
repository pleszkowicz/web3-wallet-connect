'use client';
import { ContentCard } from '@/components/ContentCard';
import { ContentLayout } from '@/components/ContentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form/FormError';
import { TokenSelectOld } from '@/components/ui/form/TokenSelect-old';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERC20Token, isErc20, isNativeToken, tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { UNISWAP_V3_QUOTER_ABI } from '@/const/uniswap/uniswap-v3-quoter-abi';
import { UNISWAP_V3_ROUTER_ABI } from '@/const/uniswap/uniswap-v3-router-abi';
import { usePortfolioBalance } from '@/context/PortfolioBalanceProvider';
import { cn } from '@/lib/cn';
import { CHAIN_TO_ADDRESSES_MAP } from '@uniswap/sdk-core';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { ChangeEvent, useState } from 'react';
import { Address, formatUnits, Hash, parseEther, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useAccount, usePublicClient, useSimulateContract, useWriteContract } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import * as Yup from 'yup';

const swapRouterAddress = CHAIN_TO_ADDRESSES_MAP[sepolia.id].swapRouter02Address;
const quoterAddress = CHAIN_TO_ADDRESSES_MAP[sepolia.id].quoterAddress;

type FeeTier = 500 | 3000 | 10000;

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

const initialValues = {
  tokenIn: tokenMap.weth.symbol,
  tokenOut: tokenMap.usdc.symbol,
  value: '',
};

export function TokenExchange() {
  const [tokenInSymbol, setTokenInSymbol] = useState<TokenMapKey>(initialValues.tokenIn);
  const [tokenOutSymbol, setTokenOutSymbol] = useState<TokenMapKey>(initialValues.tokenOut);
  const [amount, setAmount] = useState(initialValues.value);
  const [poolFee, setPoolFee] = useState<FeeOption>(poolFeeMap[3000]);
  const { address } = useAccount();
  const { balances } = usePortfolioBalance();
  const { sendCallsAsync } = useSendCalls();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

  const client = usePublicClient();

  const tokenIn = tokenMap[tokenInSymbol];
  const tokenOut = tokenMap[tokenOutSymbol];

  const { writeContractAsync, isPending: isWriteContractPending } = useWriteContract();

  const tokenInBalance = balances.get(tokenIn.symbol)?.rawValue ?? 0n;

  const validationSchema = Yup.object().shape({
    tokenIn: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Token is required'),
    tokenOut: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Token is required'),
    value: Yup.number()
      .required('Value is required')
      .test('balance', 'Insufficient funds', (v) => {
        const availableBalance = tokenInBalance ? Number(formatUnits(tokenInBalance, tokenIn.decimals)) : 0;
        return typeof v === 'number' && v > 0 && v <= availableBalance;
      }),
  });

  const { data: quoteExactInputSingle, isLoading: isQuoteLoading } = useSimulateContract({
    address: quoterAddress as Address, // Quoter V2 on Sepolia
    abi: UNISWAP_V3_QUOTER_ABI,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        tokenIn: (tokenIn as ERC20Token).address, // Input token address
        tokenOut: (tokenOut as ERC20Token).address, // Output token address
        amountIn: parseUnits(amount, tokenIn.decimals), // Amount of input token
        amountOutMinimum: 0n, // Minimum amount of output tokens to receive
        fee: poolFee.fee, // Pool fee (e.g., 0.5%)
        sqrtPriceLimitX96: 0n, // No price limit
      },
    ],
    query: {
      enabled: !!address && amount !== '0' && !!isErc20(tokenIn) && !!isErc20(tokenOut),
      retry: 0,
    },
  });

  const SLIPPAGE_TOLERANCE = 500n; // 5.0% (500 bps)
  const SLIPPAGE_DENOMINATOR = 10000n;

  const expectedAmountOut = quoteExactInputSingle?.result?.[0] ?? 0n;

  const amountOutMinimum = (expectedAmountOut * (SLIPPAGE_DENOMINATOR - SLIPPAGE_TOLERANCE)) / SLIPPAGE_DENOMINATOR;

  const isSubmitDisabled =
    tokenIn.symbol === tokenOut.symbol || !quoteExactInputSingle?.result?.[0] || isWriteContractPending;

  // const handleExchange = async () => {
  //   // approve
  //   await writeContractAsync({
  //     address: tokenIn.address as Address,
  //     abi: tokenIn.abi as Abi,
  //     functionName: 'approve',
  //     args: [swapRouterAddress, parseUnits(amount, tokenIn.decimals)],
  //   });

  //   // Swap
  //   await writeContractAsync({
  //     address: swapRouterAddress as Address,
  //     abi: UNISWAP_V3_ROUTER_ABI,
  //     functionName: 'exactInputSingle',
  //     args: [
  //       {
  //         tokenIn: tokenIn.address as Address, // Input token address
  //         tokenOut: tokenOut.address as Address, // Output token address
  //         fee: poolFee.fee, // Pool fee (e.g., 0.5%)
  //         recipient: address as Address, // Recipient address
  //         amountIn: parseUnits(amount, tokenIn.decimals), // Amount of input token
  //         amountOutMinimum: 0n, // Minimum amount of output tokens to receive
  //         sqrtPriceLimitX96: 0n, // No price limit
  //       },
  //     ],
  //   });

  // sendCallsAsync({
  //   account: address as Address,
  //   calls: [
  //     {
  //       address: cryptoMap.weth.address,
  //       abi: WETH_ABI,
  //       functionName: 'deposit',
  //       args: [],
  //       value: parseEther(amount), // Amount of WETH to deposit
  //     },
  // {
  //   address: cryptoMap.weth.address,
  //   abi: WETH_ABI,
  //   functionName: 'approve',
  //   args: [BASE_SEPOLIA_SWAP_ROUTER_ABI, parseEther(amount)],
  // },
  // {
  //   address: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
  //   abi: BASE_SEPOLIA_SWAP_ROUTER_ABI,
  //   functionName: 'exactInputSingle',
  //   args: [
  //     {
  //       tokenIn: cryptoMap.weth.address, // Input token address
  //       tokenOut: cryptoMap.link.address, // Output token address
  //       fee: 500, // Pool fee (e.g., 0.5%)
  //       recipient: address as Address, // Recipient address
  //       amountIn: parseEther(amount), // Amount of input token
  //       amountOutMinimum: 0n, // No price limit
  //     },
  //   ],
  // },
  // ],
  // });
  // };

  const onFormSubmit = async (values: typeof initialValues, { resetForm }: FormikHelpers<typeof initialValues>) => {
    setDialogOpen(true);
    setTxStatus('waiting-approve');

    try {
      let txHash: Hash;

      if (isNativeToken(tokenIn.symbol) && tokenOut === tokenMap.weth) {
        txHash = await writeContractAsync({
          address: (tokenMap.weth as ERC20Token).address,
          abi: (tokenMap.weth as ERC20Token).abi,
          functionName: 'deposit',
          args: [],
          value: parseEther(amount), // Amount of WETH to deposit
        });
        setTxStatus('pending');
      } else {
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
          address: (tokenIn as ERC20Token).address,
          abi: (tokenIn as ERC20Token).abi,
          functionName: 'approve',
          args: [swapRouterAddress, parseEther(values.value.toString())],
        });

        setTxStatus('pending');

        // Swap
        txHash = await writeContractAsync({
          address: swapRouterAddress as Address,
          abi: UNISWAP_V3_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: (tokenIn as ERC20Token).address,
              tokenOut: (tokenOut as ERC20Token).address,
              fee: poolFee.fee,
              recipient: address!,
              amountIn: parseUnits(amount, tokenIn.decimals),
              amountOutMinimum, // Minimum amount of output tokens to receive
              sqrtPriceLimitX96: 0n, // No price limit
            },
          ],
        });
      }

      await client?.waitForTransactionReceipt({ hash: txHash });

      setTxStatus('confirmed');
      resetForm();
    } catch (error) {
      setDialogOpen(false);

      if ((error as Error)?.message?.includes('User rejected the request')) {
        return;
      }
      console.error('Error sending transaction:', error);
      setTxStatus('error');
    }
  };

  return (
    <ContentLayout title="Swap" description="Exchange tokens instantly" goBackUrl="/dashboard/tokens">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <ContentCard
          title="Swap Tokens"
          description="Trade tokens in an instant"
          badge={<Badge className="border-blue-500/20 bg-blue-500/10 text-blue-400">Uniswap V3</Badge>}
        >
          <Formik
            initialValues={{
              tokenIn: initialValues.tokenIn,
              tokenOut: initialValues.tokenOut,
              value: initialValues.value,
            }}
            onSubmit={onFormSubmit}
            validationSchema={validationSchema}
          >
            {({ setFieldValue, values, setFieldError, isValid: isFormValid }) => {
              const handleSwapTokens = () => {
                const { tokenIn, tokenOut } = values;
                setFieldValue('tokenIn', tokenOut);
                setFieldValue('tokenOut', tokenIn);
                setTokenInSymbol(tokenOut);
                setTokenOutSymbol(tokenIn);
              };

              const outputAmount = quoteExactInputSingle?.result
                ? Number(formatUnits(quoteExactInputSingle.result[0], tokenOut.decimals))
                : 0;

              let formattedExchangeRate = '—';

              if (outputAmount <= 0) {
                formattedExchangeRate = 'No liquidity';
              } else {
                const rate = outputAmount / Number(values.value);

                if (!isFinite(rate) || isNaN(rate) || rate <= 0) {
                  formattedExchangeRate = 'No liquidity';
                } else {
                  formattedExchangeRate = `1 ${values.tokenIn.toUpperCase()} = ${rate.toFixed(6)} ${values.tokenOut.toUpperCase()}`;
                }
              }
              return (
                <Form className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-white">You Pay</Label>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>
                        Balance: {balances.get(values.tokenIn)?.formattedValue.toFixed(8) ?? 0}{' '}
                        {values.tokenIn.toLocaleUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* <div className="flex flex-row">
                    <div className="flex flex-row items-center text-gray-200">
                      <Label htmlFor="fee" className="text-nowrap">
                        Pool fee
                      </Label>
                      <Select value={fee} onValueChange={(value) => setFee(value as keyof typeof feeMap)}>
                        <SelectTrigger id="fee" className="border-none focus:ring-0">
                          <SelectValue placeholder="Fee %" />
                        </SelectTrigger>
                        <SelectContent>
                          {fees.map((fee) => (
                            <SelectItem key={fee} value={fee}>
                              {fee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div> */}

                  <ContentCard variant="light" className="pt-4">
                    <div className="relative flex flex-row items-center justify-between">
                      <div>
                        <Field
                          as={Input}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('value', e.target.value);
                            setAmount(e.target.value);
                          }}
                          id="value"
                          type="number"
                          name="value"
                          placeholder="0.00"
                          className="h-auto appearance-none border-none bg-transparent p-0 text-5xl font-bold text-gray-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        />

                        <div className="mt-1 text-sm text-gray-400">
                          ≈$
                          {tokenIn.symbol &&
                            ((balances.get(values.tokenIn)?.tokenPrice ?? 0) * Number(amount)).toFixed(2)}
                        </div>
                      </div>

                      <FormError name="value" className="absolute -bottom-6" />

                      <div className="flex items-center">
                        <TokenSelectOld
                          name="tokenIn"
                          tokens={tokens}
                          onChange={(tokenSymbol: TokenMapKey) => {
                            setFieldError('amount', undefined);
                            setTokenInSymbol(tokenSymbol);
                          }}
                        />
                      </div>
                    </div>
                  </ContentCard>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      onClick={handleSwapTokens}
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
                        {isQuoteLoading ? (
                          <span className="animate-pulse text-xs">Fetching quote</span>
                        ) : quoteExactInputSingle?.result ? (
                          Number(formatUnits(quoteExactInputSingle.result[0], tokenOut.decimals)).toFixed(6)
                        ) : (
                          '0'
                        )}
                      </div>

                      <div className="flex items-center">
                        <TokenSelectOld
                          name="tokenOut"
                          tokens={tokens}
                          onChange={(tokenSymbol: TokenMapKey) => {
                            setFieldError('amount', undefined);
                            setTokenOutSymbol(tokenSymbol);
                          }}
                        />
                      </div>
                    </div>
                  </ContentCard>

                  {/* Swap Details */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300 ease-out',
                      Number(values.value) > 0
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
                              onClick={() => setPoolFee(option)}
                              className={`flex h-auto cursor-pointer flex-col items-center gap-1 p-3 transition-all duration-200 hover:bg-gray-700 ${
                                poolFee.fee === option.fee
                                  ? `border-2 ${option.color.replace('text-', 'border-')} bg-gray-700`
                                  : 'border-gray-600 bg-gray-800'
                              }`}
                            >
                              <span className={`font-bold ${poolFee === option ? option.color : 'text-white'}`}>
                                {option.label}
                              </span>
                              <span className="text-center text-xs leading-tight text-gray-400">
                                {option.description}
                              </span>
                              <Badge
                                className={`text-xs ${
                                  poolFee.fee === option.fee
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
                          <span className="text-white">{poolFee.label}</span>
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
                    <Button type="submit" className="mt-4" size="xl" disabled={isSubmitDisabled || !isFormValid}>
                      Swap
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </ContentCard>
      </div>

      <TransactionStatusDialog
        open={dialogOpen && txStatus !== 'idle'}
        status={txStatus}
        onClose={() => {
          setDialogOpen(false);
          setTxStatus('idle');
        }}
        onNewSwap={() => {
          setDialogOpen(false);
          setTxStatus('idle');
        }}
      />
    </ContentLayout>
  );
}

type TransactionStatus = 'idle' | 'waiting-approve' | 'pending' | 'confirmed' | 'error';

type TransactionStatusDialogProps = {
  open: boolean;
  status: TransactionStatus;
  onClose: () => void;
  onNewSwap?: () => void;
};

const STATUSES = {
  'waiting-approve': {
    title: 'Awaiting wallet confirmation',
    icon: <span className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-400" />,
    message: 'Please confirm the transaction in your wallet.',
  },
  pending: {
    title: 'Transaction Pending',
    icon: <span className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-400" />,
    message: 'Waiting for confirmation on the blockchain...',
  },
  confirmed: {
    title: <span className="flex items-center">Swap Confirmed </span>,
    icon: undefined,
    message: undefined,
  },
  error: {
    title: 'Transaction Failed',
    icon: <span className="text-3xl text-red-400">✗</span>,
    message: 'Transaction failed. Please try again.',
  },
};

export const TransactionStatusDialog = ({ open, status, onClose, onNewSwap }: TransactionStatusDialogProps) => {
  const current = STATUSES[status as keyof typeof STATUSES];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="dialog-content" className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{current?.title || 'Swap'}</DialogTitle>
        </DialogHeader>
        {current && (
          <div className="flex flex-col items-center gap-2 py-4">
            {current?.icon}
            <p className="text-center text-gray-400">{current.message}</p>
          </div>
        )}
        <DialogFooter>
          {status === 'confirmed' && (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/tokens">Go to Dashboard</Link>
              </Button>
              <Button variant="secondary" onClick={onNewSwap}>
                New Swap
              </Button>
            </>
          )}
          {status === 'error' && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
