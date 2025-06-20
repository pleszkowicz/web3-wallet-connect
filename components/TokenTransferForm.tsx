'use client';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form/FormError';
import { TokenSelect } from '@/components/ui/form/TokenSelect';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERC20Token, tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { usePortfolioBalance } from '@/context/PortfolioBalanceProvider';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';
import { Address, encodeFunctionData, formatEther, formatUnits, isAddress, parseEther, parseUnits } from 'viem';
import { useAccount, useBalance, usePublicClient, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import * as Yup from 'yup';

const initialValues = { unit: tokenMap.eth.symbol as TokenMapKey, to: '', value: '' };

export function TokenTransferForm() {
  const [selectedToken, setSelectedToken] = useState<TokenMapKey>(initialValues.unit);
  const { address, chain } = useAccount();
  const { balances } = usePortfolioBalance();
  const { data: ethBalance } = useBalance({ address });
  const { sendTransactionAsync, isPending: isTransactionPending } = useSendTransaction();
  const { toast } = useToast();
  const erc20Token = tokenMap[selectedToken] as ERC20Token;

  const { data: erc20Balance } = useReadContract({
    address: (tokenMap[selectedToken] as ERC20Token).address,
    abi: erc20Token.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!erc20Token?.abi && !!erc20Token.address && !!address },
  });

  const { writeContractAsync, isPending: isWriteContractPending } = useWriteContract();

  const client = usePublicClient();
  const [gasPrice, setGasPrice] = useState<bigint | undefined>();
  const [isGasPriceFetching, setIsGasPriceFetching] = useState(false);

  useEffect(() => {
    if (chain === undefined) {
      return;
    }
    const fetchGas = async () => {
      try {
        setIsGasPriceFetching(true);
        let gasPrice: bigint | undefined;
        if (selectedToken === tokenMap.eth.symbol) {
          // Native ETH transfer
          gasPrice = await client?.estimateGas({
            to: address as Address,
            value: 0n,
          });
        } else {
          // ERC20 transfer
          const erc20Token = tokenMap[selectedToken] as ERC20Token;
          // Try-catch to handle tokens that revert on estimation (e.g. paused, blacklisted, etc.)
          try {
            const dummyRecipient = address;
            const data = encodeFunctionData({
              abi: erc20Token.abi,
              functionName: 'transfer',
              args: [dummyRecipient, parseUnits('0.0000001', erc20Token.decimals)],
            });
            gasPrice = await client?.estimateGas({
              account: address as Address,
              to: erc20Token.address as Address,
              data,
              value: 0n,
            });
          } catch (err) {
            // If estimation fails, set undefined and optionally log or handle gracefully
            gasPrice = undefined;
          }
        }
        setGasPrice(gasPrice);
      } catch (error) {
        console.log('Error while fetching gas price', error);
      } finally {
        setIsGasPriceFetching(false);
      }
    };
    fetchGas();
  }, [client, selectedToken, chain, address]);

  const onFormSubmit = async (values: typeof initialValues, { resetForm }: FormikHelpers<typeof initialValues>) => {
    try {
      const txHash =
        selectedToken === tokenMap.eth.symbol
          ? await sendTransactionAsync({ to: values.to as Address, value: parseEther(String(values.value)) })
          : await writeContractAsync({
              address: erc20Token.address,
              abi: erc20Token.abi,
              functionName: 'transfer',
              args: [
                values.to as Address, // Recipient address
                parseUnits(values.value.toString(), tokenMap[selectedToken].decimals), // Amount to transfer
              ],
            });

      toast({ title: 'Transaction sent', description: 'Waiting for confirmation.', testId: 'transfer-sent-toast' });
      await client?.waitForTransactionReceipt({ hash: txHash });
      toast({ title: 'Transaction confirmed on-chain!', testId: 'transfer-confirmed-toast' });
      resetForm();
    } catch (error) {
      if ((error as Error)?.message?.includes('User rejected the request')) {
        return;
      }
      toast({
        title: 'Transaction failed',
        description: 'An error occurred during transfer',
        variant: 'destructive',
      });
    }
  };

  const currentBalance = (selectedToken === tokenMap.eth.symbol ? ethBalance?.value : (erc20Balance as bigint)) ?? 0n;

  const validationSchema = Yup.object().shape({
    to: Yup.string()
      .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')
      .required('Recipient is required')
      .test('is-valid-address', 'Invalid wallet address', (v) => !!v && isAddress(v)),
    value: Yup.number()
      .required('Value is required')
      .test('balance', 'Insufficient funds', (v) => {
        const availableBalance = Number(formatUnits(currentBalance, tokenMap[selectedToken].decimals));
        return typeof v === 'number' && v > 0 && v <= availableBalance;
      }),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <ContentCard title="Transfer token">
        <Formik validationSchema={validationSchema} initialValues={initialValues} onSubmit={onFormSubmit}>
          {({ setFieldValue, values, isValid }) => (
            <Form className="flex flex-col gap-4 space-y-4">
              <div className="space-y-4">
                <Label htmlFor="to" className="flex-1 text-sm font-medium text-white">
                  To
                </Label>

                <Field
                  data-testid="to-address-input"
                  as={Input}
                  id="to"
                  name="to"
                  placeholder="Enter public address 0x"
                  className="ring-offset-background file:text-foreground focus-visible:ring-ring flex h-14 w-full rounded-md border px-3 py-2 pr-12 text-sm text-gray-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                />
                <FormError name="to" className="mt-1 text-sm text-yellow-300" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-white">Provide value</Label>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>
                      Balance: {balances.get(values.unit)?.formattedValue.toFixed(8) ?? 0}{' '}
                      {values.unit.toLocaleUpperCase()}
                    </span>
                  </div>
                </div>
                <ContentCard variant="light" className="pt-4">
                  <div className="relative flex flex-row items-center justify-between">
                    <div>
                      <Field
                        data-testid="value-input"
                        as={Input}
                        id="value"
                        type="number"
                        name="value"
                        placeholder="0.00"
                        className="h-auto appearance-none border-none bg-transparent p-0 text-5xl font-bold text-gray-200 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                      />

                      <div className="mt-1 text-sm text-gray-400">
                        ≈$
                        {values.unit &&
                          ((balances.get(values.unit)?.tokenPrice ?? 0) * Number(values.value)).toFixed(2)}
                      </div>
                    </div>

                    <FormError name="value" className="absolute -bottom-6" />

                    <div className="flex items-center">
                      <TokenSelect
                        className="overflow-hidden rounded-full border-none bg-white p-6 pr-4 pl-3 text-gray-950 focus:ring-0"
                        name="unit"
                        tokens={tokens}
                        onChange={(tokenSymbol: TokenMapKey) => {
                          setFieldValue('value', '');
                          setSelectedToken(tokenSymbol);
                        }}
                      />{' '}
                    </div>
                  </div>
                </ContentCard>
              </div>

              <div className="bg-opacity-30 flex items-center justify-between rounded-lg bg-black p-4">
                <span className="text-white">Estimated Gas:</span>
                {/* {isGasPriceFetching ? (
                  <Loader size="sm" />
                ) : ( */}
                <span className="text-white">{gasPrice ? `${formatEther(gasPrice, 'gwei')} Gwei` : 'N/A'}</span>
                {/* )} */}
              </div>

              <Button
                data-testid="send-button"
                disabled={isTransactionPending || isWriteContractPending || !isValid || isGasPriceFetching || !gasPrice}
                type="submit"
              >
                Send
              </Button>
            </Form>
          )}
        </Formik>
      </ContentCard>
    </div>
  );
}
