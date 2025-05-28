'use client';
import { ContentCard } from '@/components/ContentCard';
import { ContentLayout } from '@/components/ContentLayout';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form/FormError';
import { TokenSelect } from '@/components/ui/form/TokenSelect';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tokenMap, TokenMapKey, tokens } from '@/const/tokens';
import { usePortfolio } from '@/context/PortfolioBalanceProvider';
import { Field, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Abi, Address, encodeFunctionData, formatEther, formatUnits, isAddress, parseEther, parseUnits } from 'viem';
import { useAccount, useBalance, usePublicClient, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import * as Yup from 'yup';

const initialValues = { unit: tokenMap.eth.symbol, to: '', value: '' };

export function TokenTransferForm() {
  const [selectedToken, setSelectedToken] = useState<TokenMapKey>(initialValues.unit);
  const { address, chain } = useAccount();
  const { balances } = usePortfolio();
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
            value: parseEther('0.01'),
          });
        } else {
          // ERC20 transfer
          const erc20 = tokenMap[selectedToken];
          // Try-catch to handle tokens that revert on estimation (e.g. paused, blacklisted, etc.)
          try {
            const dummyRecipient = '0x000000000000000000000000000000000000dead';
            const data = encodeFunctionData({
              abi: erc20.abi as Abi,
              functionName: 'transfer',
              args: [dummyRecipient, parseUnits('0.01', erc20.decimals)],
            });
            gasPrice = await client?.estimateGas({
              account: address as Address,
              to: erc20.address as Address,
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

  const currentBalance = (selectedToken === tokenMap.eth.symbol ? ethBalance?.value : (erc20Balance as bigint)) ?? 0n;

  const validationSchema = Yup.object().shape({
    to: Yup.string()
      .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')
      .required('Recipient is required')
      .test('is-valid-address', 'Invalid wallet address', (v) => !!v && isAddress(v)),
    value: Yup.number()
      .required('Value is required')
      .test('balance', 'Insufficient funds', (v) => {
        const available = Number(formatUnits(currentBalance, tokenMap[selectedToken].decimals));
        return typeof v === 'number' && v > 0 && v <= available;
      }),
  });

  return (
    <ContentLayout title="Send" goBackUrl="/dashboard/tokens">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <ContentCard title="Transfer token">
          <Formik
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={async (values, { resetForm }) => {
              try {
                const txHash =
                  selectedToken === tokenMap.eth.symbol
                    ? await sendTransactionAsync({ to: values.to as Address, value: parseEther(String(values.value)) })
                    : await writeContractAsync({
                        address: tokenMap[selectedToken].address,
                        abi: tokenMap[selectedToken].abi as Abi,
                        functionName: 'transfer',
                        args: [
                          values.to as Address, // Recipient address
                          parseUnits(values.value.toString(), tokenMap[selectedToken].decimals), // Amount to transfer
                        ],
                      });

                toast({ title: 'Transaction sent', description: 'Waiting for confirmation.' });
                await client?.waitForTransactionReceipt({ hash: txHash });
                toast({ title: 'Confirmed on-chain!' });
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
            }}
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-4 flex flex-col gap-4">
                <div className="space-y-4">
                  <Label htmlFor="to" className="flex-1 text-sm font-medium text-white">
                    To
                  </Label>

                  <Field
                    as={Input}
                    id="to"
                    name="to"
                    placeholder="Enter public address 0x"
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-14 pr-12"
                  />
                  <FormError name="to" className="text-yellow-300 text-sm mt-1" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-white">You Pay</Label>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>
                        Balance: {balances.get(values.unit)?.formattedValue.toFixed(8) ?? 0}{' '}
                        {values.unit.toLocaleUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ContentCard variant="light" className="pt-4">
                    <div className="flex flex-row justify-between relative items-center">
                      <div>
                        <Field
                          as={Input}
                          id="value"
                          type="number"
                          name="value"
                          placeholder="0.00"
                          className="text-5xl text-gray-200 font-bold bg-transparent border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                        />

                        <div className="text-sm text-gray-400 mt-1">
                          ≈$
                          {values.unit &&
                            ((balances.get(values.unit)?.tokenPrice ?? 0) * Number(values.value)).toFixed(2)}
                        </div>
                      </div>

                      <FormError name="value" className="absolute -bottom-6" />

                      <div className="flex items-center">
                        <TokenSelect
                          className="bg-white text-gray-950 border-none rounded-full p-6 pl-3 pr-4 focus:ring-0 overflow-hidden"
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

                <div className="bg-black bg-opacity-30 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-white">Estimated Gas:</span>
                  {/* {isGasPriceFetching ? (
                  <Loader size="sm" />
                ) : ( */}
                  <span className="text-white">{gasPrice ? `${formatEther(gasPrice, 'gwei')} Gwei` : 'N/A'}</span>
                  {/* )} */}
                </div>

                <Button type="submit">Send</Button>
              </Form>
            )}
          </Formik>
        </ContentCard>
      </div>
    </ContentLayout>
  );
}
