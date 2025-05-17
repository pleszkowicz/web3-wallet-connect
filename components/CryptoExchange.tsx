'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { UNISWAP_V3_QUOTER_ABI } from '@/const/uniswap/uniswap-v3-quoter-abi';
import { UNISWAP_V3_ROUTER_ABI } from '@/const/uniswap/uniswap-v3-router-abi';
import { CHAIN_TO_ADDRESSES_MAP } from '@uniswap/sdk-core';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { Abi, Address, formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useAccount, useBalance, usePublicClient, useReadContract, useSimulateContract, useWriteContract } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import * as Yup from 'yup';
import { ContentLayout } from './ContentLayout';
import { TokenSelect } from './TokenSelect';
import { useToast } from './ui/hooks/use-toast';

const swapRouterAddress = CHAIN_TO_ADDRESSES_MAP[baseSepolia.id].swapRouter02Address;
const quoterAddress = CHAIN_TO_ADDRESSES_MAP[baseSepolia.id].quoterAddress;

const feeMap = {
  '0.05%': 500,
  '0.3%': 3000,
  '1%': 10000,
};

const fees = Object.keys(feeMap);

export function CryptoExchange() {
  const [tokenInSymbol, setTokenInSymbol] = useState<TokenMapKey>(tokenMap.weth.symbol);
  const [tokenOutSymbol, setTokenOutSymbol] = useState<TokenMapKey>(tokenMap.usdc.symbol);
  const [amount, setAmount] = useState('0.1');
  const [fee, setFee] = useState<keyof typeof feeMap>('0.3%');
  const { address, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { sendCallsAsync } = useSendCalls();
  const client = usePublicClient();
  const { toast } = useToast();

  const tokenIn = tokenMap[tokenInSymbol];
  const tokenOut = tokenMap[tokenOutSymbol];

  const { data: erc20Balance } = useReadContract({
    address: tokenIn.address,
    abi: tokenIn.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!tokenIn.abi && !!tokenIn.address && !!address },
  });

  const { writeContractAsync, isPending: isWriteContractPending } = useWriteContract();

  const currentBalance = (tokenIn === tokenMap.eth ? ethBalance?.value : (erc20Balance as bigint)) ?? 0;

  const validationSchema = Yup.object().shape({
    tokenIn: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Token is required'),
    tokenOut: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Token is required'),
    value: Yup.string()
      .required('Value is required')
      .test('is-valid-value', 'Insufficient balance', function (value) {
        const { path, createError } = this;
        const availableBalance = currentBalance ? Number(formatEther(currentBalance)) : 0;
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
    address: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27', // Quoter V2 on Sepolia
    abi: UNISWAP_V3_QUOTER_ABI,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        tokenIn: tokenIn.address as Address, // Input token address
        tokenOut: tokenOut.address as Address, // Output token address
        amountIn: parseUnits(amount, tokenIn.decimals), // Amount of input token
        amountOutMinimum: 0n, // Minimum amount of output tokens to receive
        fee: feeMap[fee], // Pool fee (e.g., 0.5%)
        sqrtPriceLimitX96: 0n, // No price limit
      },
    ],
    query: {
      enabled: !!address && amount !== '0' && !!tokenIn.address && !!tokenOut.address,
      retry: 0,
    },
  });

  console.log('quoteExactInputSingle', quoteExactInputSingle);
  console.log('formatether', formatEther(parseEther(amount)));

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
      args: [swapRouterAddress, parseEther(amount)],
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
    //       amountOutMinimum: 0n, // Minimum amount of output tokens to receive
    //       sqrtPriceLimitX96: 0n, // No price limit
    //     },
    //   ],
    // },
    // ],
    // });
  };

  return (
    <ContentLayout title="Crypto Exchange" description="Swap your crypto across different blockchains" showBackButton>
      <Formik
        initialValues={{ tokenIn: tokenMap.eth.symbol, tokenOut: tokenMap.usdc.symbol, value: 0.000001 }}
        onSubmit={async (values, { resetForm }) => {
          try {
            await writeContractAsync({
              address: tokenIn.address as Address,
              abi: tokenIn.abi as Abi,
              functionName: 'approve',
              args: [swapRouterAddress, parseEther(amount)],
            });

            // Swap
            const txHash = await writeContractAsync({
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

            toast({
              title: 'Swap initiated',
              description: 'Waiting for confirmation on the blockchain.',
            });

            await client?.waitForTransactionReceipt({ hash: txHash });

            toast({ title: 'Swap confirmed on the blockchain!' });

            resetForm();
          } catch (error) {
            console.error('Error sending transaction:', error);
            toast({
              title: 'Swap failed',
              description: 'An error occurred while swapping. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        validationSchema={validationSchema}
      >
        <Form className="space-y-4">
          <div className="space-y-2">
            <TokenSelect
              label="From"
              name="tokenIn"
              tokens={tokens}
              onChange={(tokenSymbol: TokenMapKey) => setTokenInSymbol(tokenSymbol)}
            />
          </div>

          <div className="space-y-2">
            <TokenSelect
              label="To"
              name="tokenOut"
              tokens={tokens}
              onChange={(tokenSymbol: TokenMapKey) => setTokenOutSymbol(tokenSymbol)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Value{' '}
              <span className="text-xs">
                (max {currentBalance ? formatEther(currentBalance as bigint) : '0.00'} {tokenIn.label})
              </span>
            </Label>
            <Field as={Input} id="value" name="value" placeholder="0.00" />
            <ErrorMessage name="value" component="div" className="text-red-500" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">Fee</Label>
            <Select value={fee} onValueChange={(value) => setFee(value as keyof typeof feeMap)}>
              <SelectTrigger id="fee">
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

          <div className="space-y-2">
            <Label>You will get</Label>
            <p className="text-sm text-muted-foreground">
              {isQuoteLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <span>
                  {quoteExactInputSingle?.result ? formatUnits(quoteExactInputSingle.result[0], tokenOut.decimals) : ''}
                </span>
              )}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!quoteExactInputSingle || isWriteContractPending}>
            Exchange
          </Button>
        </Form>
      </Formik>
    </ContentLayout>
  );
}
