'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { cn } from '@/lib/cn';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { RefreshCwIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Abi, Address, formatEther, isAddress, parseEther } from 'viem';
import { useAccount, useBalance, usePublicClient, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import * as Yup from 'yup';
import { ContentLayout } from './ContentLayout';
import { TokenSelect } from './TokenSelect';
import { useToast } from './ui/hooks/use-toast';

export function TokenTransferForm() {
  const [selectedToken, setSelectedToken] = useState<TokenMapKey>(tokenMap.eth.symbol);
  const { address, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { sendTransactionAsync, isPending: isTransactionPending } = useSendTransaction();
  const { toast } = useToast();

  const { data: erc20Balance } = useReadContract({
    address: tokenMap[selectedToken].address,
    abi: tokenMap[selectedToken].abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!tokenMap[selectedToken].abi && !!tokenMap[selectedToken].address && !!address },
  });

  const { writeContractAsync, isPending: isWriteContractPending } = useWriteContract();

  const client = usePublicClient();
  const [gasPrice, setGasPrice] = useState<bigint | undefined>();
  const [isGasPriceFetching, setIsGasPriceFetching] = useState(false);

  const fetchGas = useCallback(async () => {
    if (chain === undefined) {
      return;
    }
    try {
      setIsGasPriceFetching(true);
      const gasPrice = await client?.estimateGas({
        to: tokenMap[selectedToken].address,
        data: '0x',
        value: parseEther('1'),
      });
      setGasPrice(gasPrice);
    } finally {
      setIsGasPriceFetching(false);
    }
  }, [client, selectedToken, chain]);

  useEffect(() => {
    fetchGas();
  }, [fetchGas]);

  const currentBalance = (selectedToken === tokenMap.eth.symbol ? ethBalance?.value : (erc20Balance as bigint)) ?? 0;

  const validationSchema = Yup.object().shape({
    unit: Yup.string()
      .oneOf(Object.keys(tokenMap) as TokenMapKey[])
      .required('Unit is required'),
    from: Yup.string()
      .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format')
      .required('Sender address is required'),
    to: Yup.string()
      .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format')
      .required('Recipient address is required')
      .test('is-valid-address', 'Invalid wallet address', function (value) {
        return isAddress(value);
      }),
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

  return (
    <ContentLayout title="Send" description="Transfer your crypto to another address" showBackButton>
      <Formik
        initialValues={{ unit: tokenMap.eth.symbol, from: address, to: '', value: 0 }}
        onSubmit={async (values, { resetForm }) => {
          try {
            const txHash =
              selectedToken === tokenMap.eth.symbol
                ? await sendTransactionAsync({
                    to: values.to as Address,
                    value: parseEther(String(values.value)),
                  })
                : await writeContractAsync({
                    address: tokenMap[selectedToken].address,
                    abi: tokenMap[selectedToken].abi as Abi,
                    functionName: 'transfer',
                    args: [
                      values.to as Address, // Recipient address
                      parseEther(String(values.value)), // Amount to transfer
                    ],
                  });

            toast({
              title: 'Transaction sent',
              description: 'Waiting for confirmation on the blockchain.',
            });

            await client?.waitForTransactionReceipt({ hash: txHash });

            toast({ title: 'Transaction confirmed on the blockchain!' });

            resetForm();
          } catch (error) {
            if ((error as Error)?.message?.includes('User rejected the request')) {
              return;
            }
            console.error('Error sending transaction:', error);
            toast({
              title: 'Transaction failed',
              description: 'An error occurred while sending the transaction. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        validationSchema={validationSchema}
      >
        {() => {
          return (
            <Form className="space-y-4">
              <div className="space-y-2">
                <TokenSelect
                  label="Select Token"
                  name="unit"
                  tokens={tokens}
                  onChange={(tokenSymbol: TokenMapKey) => setSelectedToken(tokenSymbol)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Field as={Input} id="from" name="from" type="text" disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Field as={Input} id="to" name="to" placeholder="0x..." />
                <ErrorMessage name="to" component="div" className="text-red-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">
                  Value{' '}
                  <span className="text-xs">
                    (max {currentBalance ? formatEther(currentBalance as bigint) : '0.00'}{' '}
                    {tokenMap[selectedToken].label})
                  </span>
                </Label>
                <Field as={Input} id="value" name="value" placeholder="0.00" />
                <ErrorMessage name="value" component="div" className="text-red-500" />
              </div>
              <div className={cn('space-y-2', isGasPriceFetching ? 'animate-pulse disabled' : '')}>
                <div className="flex items-center justify-start gap-2 bg-muted p-2 rounded-md">
                  <Label>Estimated Gas Fee:</Label>
                  <span className="text-sm">
                    {gasPrice ? `${formatEther(gasPrice, 'gwei')} Gwei` : 'Loading...'}
                  </span>{' '}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    disabled={isGasPriceFetching}
                    onClick={() => !isGasPriceFetching && fetchGas()}
                  >
                    <RefreshCwIcon className={cn('w-4 h-4 mr-2', isGasPriceFetching ? 'animate-spin' : '')} />
                  </Button>
                  {/* {gasPrice ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="inline-block" width={20} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="text-xs">({formatEther(gasPrice, 'wei')} ETH)</span>
                      </TooltipContent>
                    </Tooltip>
                  ) : null} */}
                </div>
              </div>
              <Button
                disabled={isTransactionPending || isWriteContractPending}
                variant="default"
                className="w-full"
                type="submit"
              >
                Transfer
              </Button>
            </Form>
          );
        }}
      </Formik>
    </ContentLayout>
  );
}
