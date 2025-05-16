'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Token, tokenMap, tokens } from '@/const/tokens';
import { UNISWAP_V3_QUOTER_ABI } from '@/const/uniswap/uniswap-v3-quoter-abi';
import { UNISWAP_V3_ROUTER_ABI } from '@/const/uniswap/uniswap-v3-router-abi';
import { ArrowRightIcon } from 'lucide-react';
import { useState } from 'react';
import { Address, formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import { useAccount, useBalance, useSimulateContract, useWriteContract } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import { ContentLayout } from './ContentLayout';

const feeMap = {
  '0.05%': 500,
  '0.3%': 3000,
  '1%': 10000,
};
const fees = Object.keys(feeMap);

export function CryptoExchange() {
  const [fromCrypto, setFromCrypto] = useState<Token>(tokenMap.weth);
  const [toCrypto, setToCrypto] = useState<Token>(tokenMap.usdc);
  const [amount, setAmount] = useState('0.1');
  const [fee, setFee] = useState<keyof typeof feeMap>('0.3%');
  const { address, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { sendCallsAsync } = useSendCalls();

  console.log('chain', chain);
  const { writeContractAsync } = useWriteContract();

  console.table({
    tokenIn: fromCrypto.address, // Input token address
    tokenOut: toCrypto.address, // Output token address
    amountIn: parseUnits(amount, fromCrypto.decimals), // Amount of input token
    amountOutMinimum: 0n, // Minimum amount of output tokens to receive
    fee: feeMap[fee], // Pool fee (e.g., 0.5%)
    sqrtPriceLimitX96: 0n, // No price limit
  });

  const {
    data: quoteExactInputSingle,
    isLoading: isQuoteLoading,
    refetch,
  } = useSimulateContract({
    address: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27', // Quoter V2 on Sepolia
    abi: UNISWAP_V3_QUOTER_ABI,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        tokenIn: fromCrypto.address, // Input token address
        tokenOut: toCrypto.address, // Output token address
        amountIn: parseUnits(amount, fromCrypto.decimals), // Amount of input token
        amountOutMinimum: 0n, // Minimum amount of output tokens to receive
        fee: feeMap[fee], // Pool fee (e.g., 0.5%)
        sqrtPriceLimitX96: 0n, // No price limit
      },
    ],
    query: {
      enabled: !!address && amount !== '0',
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

    // Swap
    await writeContractAsync({
      address: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
      abi: UNISWAP_V3_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [
        {
          tokenIn: tokenMap.weth.address, // Input token address
          tokenOut: tokenMap.link.address, // Output token address
          fee: 500, // Pool fee (e.g., 0.5%)
          recipient: address as Address, // Recipient address
          amountIn: parseUnits(amount, fromCrypto.decimals), // Amount of input token
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
    // writeContractAsync({
    //   address: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4', // SwapRouter02 on Base Sepolia
    //   abi: BASE_SEPOLIA_SWAP_ROUTER_ABI,
    //   functionName: 'exactInputSingle',
    //   args: [
    //     {
    //       tokenIn: fromCrypto.address, // Input token address
    //       tokenOut: toCrypto.address, // Output token address
    //       fee: 500, // Pool fee (e.g., 0.5%)
    //       recipient: address as Address, // Recipient address
    //       amountIn: parseEther(amount), // Amount of input token
    //       amountOutMinimum: 0n, // Minimum amount of output tokens to receive
    //       sqrtPriceLimitX96: 0n, // No price limit
    //     },
    //   ],
    // });
    // Here you would implement the actual exchange logic
    console.log(`Exchanging ${amount} ${fromCrypto.label} to ${toCrypto.label}`);
  };

  return (
    <ContentLayout title="Crypto Exchange" description="Swap your crypto across different blockchains" showBackButton>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from-crypto">From</Label>
          <Select
            value={fromCrypto.symbol}
            onValueChange={(value) => setFromCrypto(tokenMap[value as keyof typeof tokenMap])}
          >
            <SelectTrigger id="from-crypto">
              <SelectValue placeholder="Select crypto" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            placeholder="0.00"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex justify-center">
          <ArrowRightIcon className="text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-crypto">To</Label>
          <Select
            value={toCrypto.symbol}
            onValueChange={(value) => setToCrypto(tokenMap[value as keyof typeof tokenMap])}
          >
            <SelectTrigger id="to-crypto">
              <SelectValue placeholder="Select crypto" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {quoteExactInputSingle?.result ? formatUnits(quoteExactInputSingle.result[0], toCrypto.decimals) : ''}
              </span>
            )}
          </p>
          {/* <div className="flex items-center justify-between bg-muted p-2 rounded-md">
            <span>{gasFee} ETH</span>
            <Button variant="ghost" size="sm" onClick={() => setGasFee((Math.random() * 0.01).toFixed(4))}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>*/}
        </div>
      </div>

      <Button className="w-full" disabled={!quoteExactInputSingle} onClick={handleExchange}>
        Exchange
      </Button>
    </ContentLayout>
  );
}
