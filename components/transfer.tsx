'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEPOLIA_LINK_CONTRACT_ADDRESS, SEPOLIA_LINK_TOKEN_ABI } from '@/const/sepolia';
import { cn } from '@/lib/cn';
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik';
import { RefreshCwIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Address, formatEther, isAddress, parseEther } from 'viem';
import { useAccount, useBalance, usePublicClient, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import * as Yup from 'yup';
import { CardLayout } from './CardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type Crypto = {
  value: string;
  label: string;
};

type CryptoMapKey = 'ETH' | 'LINK';

const CryptoMap: Record<CryptoMapKey, Crypto> = {
  ETH: {
    value: 'eth',
    label: 'Ethereum (ETH)',
  },
  LINK: {
    value: 'link',
    label: 'Chainlink (LINK)',
  },
};

const cryptos = Object.values(CryptoMap);

export function Transfer() {
  const [selectedUnit, setSelectedUnit] = useState(CryptoMap.ETH);
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { sendTransaction, isPending: isTransactionPending } = useSendTransaction();

  const { data: linkBalance } = useReadContract({
    address: SEPOLIA_LINK_CONTRACT_ADDRESS,
    abi: SEPOLIA_LINK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address!],
  });

  const { writeContract, isPending: isWriteContractPending } = useWriteContract();

  const client = usePublicClient();
  const [gasPrice, setGasPrice] = useState<bigint | undefined>();
  const [isGasPriceFetching, setIsGasPriceFetching] = useState(false);

  const fetchGas = useCallback(async () => {
    try {
      setIsGasPriceFetching(true);
      const gasPrice = await client?.estimateMaxPriorityFeePerGas();
      setGasPrice(gasPrice);
    } finally {
      setIsGasPriceFetching(false);
    }
  }, [client]);

  useEffect(() => {
    fetchGas();
  }, [fetchGas]);

  const currentBalance = (selectedUnit === CryptoMap.ETH ? ethBalance?.value : (linkBalance as bigint)) ?? 0;

  const validationSchema = Yup.object().shape({
    unit: Yup.string().required('Unit is required'),
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
    <CardLayout title="Crypto Transfer" description="Transfer your crypto to another address" showBackButton>
      <Formik
        initialValues={{ unit: CryptoMap.ETH.value, from: address, to: '', value: 0 }}
        onSubmit={(values) => {
          if (selectedUnit === CryptoMap.ETH) {
            sendTransaction({ to: values.to as Address, value: parseEther(String(values.value)) });
            return;
          } else {
            writeContract({
              address: SEPOLIA_LINK_CONTRACT_ADDRESS,
              abi: SEPOLIA_LINK_TOKEN_ABI,
              functionName: 'transfer',
              args: [
                values.to as Address, // Recipient address
                parseEther(String(values.value)), // Amount to transfer
              ],
            });
          }
        }}
        validationSchema={validationSchema}
      >
        {({ values }) => {
          return (
            <Form className="space-y-4">
              <div className="space-y-2">
                <CryptoSelect
                  name="unit"
                  onChange={(unitValue) => setSelectedUnit(CryptoMap[unitValue.toUpperCase() as CryptoMapKey])}
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
                    {selectedUnit.value.toUpperCase()})
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
    </CardLayout>
  );
}

type CryptoSelectProps = {
  name: string;
  onChange: (value: Crypto['value']) => void;
};

const CryptoSelect = ({ name, onChange }: CryptoSelectProps) => {
  const { setFieldValue, values } = useFormikContext<Record<string, string>>();
  const selectedValue = values[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>Crypto</Label>
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          setFieldValue(name, value);
          onChange(value);
        }}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder="Select crypto" />
        </SelectTrigger>

        <SelectContent>
          {cryptos.map((crypto) => {
            return (
              <SelectItem key={crypto.value} value={crypto.value}>
                {crypto.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <ErrorMessage name={name} component="div" className="text-red-500" />
    </div>
  );
};
