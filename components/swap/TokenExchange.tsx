'use client';
import { ContentLayout } from '@/components/ContentLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form/FormError';
import { TokenSelect } from '@/components/ui/form/TokenSelect';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { UNISWAP_V3_QUOTER_ABI } from '@/const/uniswap/uniswap-v3-quoter-abi';
import { UNISWAP_V3_ROUTER_ABI } from '@/const/uniswap/uniswap-v3-router-abi';
import { CHAIN_TO_ADDRESSES_MAP } from '@uniswap/sdk-core';
import { Field, Form, Formik } from 'formik';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useMemo, useState } from 'react';
import { Abi, Address, formatUnits, Hash, parseEther, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useAccount, useBalance, usePublicClient, useReadContract, useSimulateContract, useWriteContract } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import * as Yup from 'yup';

const swapRouterAddress = CHAIN_TO_ADDRESSES_MAP[sepolia.id].swapRouter02Address;
const quoterAddress = CHAIN_TO_ADDRESSES_MAP[sepolia.id].quoterAddress;

console.log('quoterAddress', quoterAddress);

const feeMap = {
  '0.05%': 500,
  '0.3%': 3000,
  '1%': 10000,
};

const fees = Object.keys(feeMap);

const initialValues = {
  tokenIn: tokenMap.weth.symbol,
  tokenOut: tokenMap.usdc.symbol,
  value: 0.000001,
};

export function TokenExchange() {
  const [tokenInSymbol, setTokenInSymbol] = useState<TokenMapKey>(initialValues.tokenIn);
  const [tokenOutSymbol, setTokenOutSymbol] = useState<TokenMapKey>(initialValues.tokenOut);
  const [amount, setAmount] = useState(initialValues.value.toString());
  const [fee, setFee] = useState<keyof typeof feeMap>('0.3%');
  const { address } = useAccount();
  const { push } = useRouter();
  const { data: ethBalance } = useBalance({ address });
  const { sendCallsAsync } = useSendCalls();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

  const client = usePublicClient();
  const { toast } = useToast();

  const tokenIn = tokenMap[tokenInSymbol];
  const tokenOut = tokenMap[tokenOutSymbol];

  const { data: erc20Balance } = useReadContract({
    address: tokenIn.address!,
    abi: tokenIn.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!tokenIn.abi && !!tokenIn.address && !!address },
  });

  const { writeContractAsync, isPending: isWriteContractPending } = useWriteContract();

  const tokenInBalance = (tokenIn === tokenMap.eth ? ethBalance?.value : (erc20Balance as bigint)) ?? 0n;

  const validationSchema = Yup.object().shape({
    tokenIn: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Token is required'),
    tokenOut: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Token is required'),
    value: Yup.string()
      .required('Value is required')
      .test('is-positive', 'Value must be greater than 0', function (value) {
        const { path, createError } = this;
        if (parseFloat(value) <= 0) {
          return createError({ path, message: 'Value must be greater than 0' });
        }
        return true;
      })
      .test('is-valid-value', 'Insufficient balance', function (value) {
        const { path, createError } = this;
        const availableBalance = tokenInBalance ? Number(formatUnits(tokenInBalance, tokenIn.decimals)) : 0;

        if (availableBalance === 0) {
          return createError({ path, message: 'Insufficient balance' });
        }

        if (parseFloat(value) > availableBalance) {
          return createError({
            path,
            message: `Exceeds available balance of ${availableBalance} and gas fee.`,
          });
        }
        return true;
      }),
  });

  console.log('quoterAddress', quoterAddress);

  const { data: quoteExactInputSingle, isLoading: isQuoteLoading } = useSimulateContract({
    address: quoterAddress as Address, // Quoter V2 on Sepolia
    abi: UNISWAP_V3_QUOTER_ABI,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        tokenIn: tokenIn?.address as Address, // Input token address
        tokenOut: tokenOut?.address as Address, // Output token address
        amountIn: parseUnits(amount, tokenIn.decimals), // Amount of input token
        amountOutMinimum: 0n, // Minimum amount of output tokens to receive
        fee: feeMap[fee], // Pool fee (e.g., 0.5%)
        sqrtPriceLimitX96: 0n, // No price limit
      },
    ],
    query: {
      enabled: !!address && amount !== '0' && !!tokenIn?.address && !!tokenOut?.address,
      retry: 0,
    },
  });

  const tokensOut = useMemo(() => {
    return tokens.filter((token) => token.symbol !== tokenIn.symbol);
  }, [tokenIn]);

  const isSubmitDisabled =
    tokenInBalance === 0n ||
    tokenIn.symbol === tokenOut.symbol ||
    !quoteExactInputSingle?.result?.[0] ||
    isWriteContractPending;

  const handleExchange = async () => {
    // Deposit WETH
    // await writeContractAsync({
    //   address: cryptoMap.weth.address as Address,
    //   abi: WETH_ABI,
    //   functionName: 'deposit',
    //   args: [],
    //   value: parseEther(amount), // Amount of WETH to deposit
    // });
    // approve
    await writeContractAsync({
      address: tokenIn.address as Address,
      abi: tokenIn.abi as Abi,
      functionName: 'approve',
      args: [swapRouterAddress, parseUnits(amount, tokenIn.decimals)],
    });

    // Swap
    await writeContractAsync({
      address: swapRouterAddress as Address,
      abi: UNISWAP_V3_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [
        {
          tokenIn: tokenIn.address as Address, // Input token address
          tokenOut: tokenOut.address as Address, // Output token address
          fee: feeMap[fee], // Pool fee (e.g., 0.5%)
          recipient: address as Address, // Recipient address
          amountIn: parseUnits(amount, tokenIn.decimals), // Amount of input token
          amountOutMinimum: 0n, // Minimum amount of output tokens to receive
          sqrtPriceLimitX96: 0n, // No price limit
        },
      ],
    });

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
  };

  return (
    <ContentLayout title="Swap" goBackUrl="/dashboard/tokens">
      <Formik
        initialValues={{ tokenIn: initialValues.tokenIn, tokenOut: initialValues.tokenOut, value: initialValues.value }}
        onSubmit={async (values, { resetForm }) => {
          setDialogOpen(true);
          setTxStatus('waiting-approve');

          try {
            let txHash: Hash;

            if (tokenIn === tokenMap.eth && tokenOut === tokenMap.weth) {
              txHash = await writeContractAsync({
                address: tokenMap.weth.address,
                abi: tokenMap.weth.abi,
                functionName: 'deposit',
                args: [],
                value: parseEther(amount), // Amount of WETH to deposit
              });
              setTxStatus('pending');
            } else {
              // Approve
              await writeContractAsync({
                address: tokenIn.address as Address,
                abi: tokenIn.abi as Abi,
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
                    tokenIn: tokenIn.address as Address,
                    tokenOut: tokenOut.address as Address,
                    fee: feeMap[fee],
                    recipient: address as Address,
                    amountIn: parseUnits(amount, tokenIn.decimals),
                    amountOutMinimum: 0n, // Minimum amount of output tokens to receive
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
        }}
        validationSchema={validationSchema}
      >
        {({ setFieldValue, values, setFieldError }) => {
          return (
            <Form className="space-y-2">
              <div className="bg-black bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 rounded-xl p-6 space-y-4">
                <div className="flex flex-row">
                  <div className="flex-1 text-gray-400 text-lg font-medium">You Pay</div>

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
                </div>

                <div className="flex flex-row relative items-start">
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
                      className="text-5xl text-gray-200 font-bold bg-transparent border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                    />

                    <div className="text-sm text-gray-400 mt-1">
                      {formatUnits(
                        (tokenIn === tokenMap.eth ? ethBalance?.value : (erc20Balance as bigint)) ?? 0n,
                        tokenIn.decimals
                      )}{' '}
                      {tokenIn.symbol.toUpperCase()}
                    </div>
                  </div>

                  <FormError name="value" className="absolute -bottom-6" />

                  <div className="flex flex-1 items-center">
                    <TokenSelect
                      className="bg-white text-gray-950 border-none rounded-full p-6 pl-3 pr-4 focus:ring-0 overflow-hidden"
                      name="tokenIn"
                      tokens={tokens}
                      onChange={(tokenSymbol: TokenMapKey) => {
                        setFieldError('amount', undefined);
                        setTokenInSymbol(tokenSymbol);
                      }}
                    />
                  </div>
                </div>

                {/* TODO: idea - add support for showing price in USD
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-400">
                    <span>${amount === '0' ? '0.00' : (Number(amount) * 20).toFixed(2)}</span>
                    <RefreshCw className="h-4 w-4 ml-2 cursor-pointer" />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="rounded-full h-8 px-3 bg-[#3a3a3a] border-none text-gray-300 hover:bg-[#4a4a4a]"
                      onClick={() => {}}
                    >
                      0
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full h-8 px-3 bg-[#3a3a3a] border-none text-gray-300 hover:bg-[#4a4a4a]"
                      onClick={() => {}}
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full h-8 px-3 bg-[#3a3a3a] border-none text-gray-300 hover:bg-[#4a4a4a]"
                      onClick={() => {}}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                 */}
                {/* </div> */}

                {/* Swap Button */}
                <div className="relative flex justify-center">
                  <Button
                    type="button"
                    onClick={() => {
                      const { tokenIn, tokenOut } = values;
                      setFieldValue('tokenIn', tokenOut);
                      setFieldValue('tokenOut', tokenIn);
                      setTokenInSymbol(tokenOut);
                      setTokenOutSymbol(tokenIn);
                      setAmount('0.1');
                    }}
                    className="absolute -mt-6 rounded-full w-12 h-12 bg-[#6c5ce7] hover:bg-[#5b4bc4] flex items-center justify-center p-0 border border-[#1c1c1c]"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>

                {/* <div className="bg-black bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 rounded-xl p-6 space-y-4"> */}
                <div className="text-gray-400 text-lg font-medium">You Receive</div>

                <div className="flex items-center gap-1">
                  <div className="text-5xl text-gray-200 font-bold flex-1 truncate overflow-hidden">
                    {isQuoteLoading ? (
                      <span className="animate-pulse text-xs">Fetching quote</span>
                    ) : quoteExactInputSingle?.result ? (
                      Number(formatUnits(quoteExactInputSingle.result[0], tokenOut.decimals)).toFixed(6)
                    ) : (
                      '0'
                    )}
                  </div>

                  <div className="flex items-center">
                    <TokenSelect
                      className="bg-white text-gray-950 border-none rounded-full p-6 pl-3 pr-4 focus:ring-0 overflow-hidden"
                      name="tokenOut"
                      tokens={tokens}
                      onChange={(tokenSymbol: TokenMapKey) => {
                        setFieldError('amount', undefined);
                        setTokenOutSymbol(tokenSymbol);
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex w-full justify-center text-">
                  <Button type="submit" variant="secondary" className="mt-4" size="xl" disabled={isSubmitDisabled}>
                    Swap
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      <TransactionStatusDialog
        open={dialogOpen && txStatus !== 'idle'}
        status={txStatus}
        onClose={() => {
          setDialogOpen(false);
          setTxStatus('idle');
          push('/dashboard/tokens');
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
    icon: <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2" />,
    message: 'Please confirm the transaction in your wallet.',
  },
  pending: {
    title: 'Transaction Pending',
    icon: <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2" />,
    message: 'Waiting for confirmation on the blockchain...',
  },
  confirmed: {
    title: <span className="flex items-center">Swap Confirmed </span>,
    icon: undefined,
    message: undefined,
  },
  error: {
    title: 'Transaction Failed',
    icon: <span className="text-red-400 text-3xl">✗</span>,
    message: 'Transaction failed. Please try again.',
  },
};

const TransactionStatusDialog = ({ open, status, onClose, onNewSwap }: TransactionStatusDialogProps) => {
  const current = STATUSES[status as keyof typeof STATUSES];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{current?.title || 'Swap'}</DialogTitle>
        </DialogHeader>
        {current && (
          <div className="py-4 flex flex-col items-center gap-2">
            {current?.icon}
            <p className="text-gray-400 text-center">{current.message}</p>
          </div>
        )}
        <DialogFooter>
          {status === 'confirmed' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Go to Dashboard
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
