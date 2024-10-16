'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCwIcon } from 'lucide-react';
import { Address, formatEther, isAddress, parseEther } from 'viem';
import { useAccount, useBalance, useGasPrice, useSendTransaction } from 'wagmi';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { getFormattedBalance } from '@/Utils/getFormattedValue';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Transfer() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const router = useRouter();

  const { data: gasPrice, isFetching: isGasPriceFetching, refetch: refetchGasPrice } = useGasPrice();

  const validationSchema = Yup.object().shape({
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
        const availableBalance = balance ? Number(getFormattedBalance(balance)) : 0;
        if (parseFloat(value) > availableBalance) {
          return createError({
            path,
            message: `Value cannot exceed available balance of ${availableBalance}`,
          });
        }
        return true;
      }),
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className='text-center relative'>
        <Button
          asChild
          className='absolute'
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          aria-label="Go back"
        >
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <CardTitle>
          Crypto transfer</CardTitle>
        <CardDescription>Transfer crypto to another address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Formik
          initialValues={{ from: address, to: '', value: getFormattedBalance(balance) }}
          onSubmit={(values) => {
            sendTransaction({ to: values.to as Address, value: parseEther(values.value) });
          }}
          validationSchema={validationSchema}
        >
          <Form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Field as={Input} id="from" name="from" type="text" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Field as={Input} id="to" name="to" placeholder="0x" />
              <ErrorMessage name="to" component="div" className="text-red-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">
                Value <span className="text-xs">(max {balance?.value ? formatEther(balance.value) : '0.00'} ETH)</span>
              </Label>
              <Field as={Input} id="value" name="value" placeholder="0.00" />
              <ErrorMessage name="value" component="div" className="text-red-500" />
            </div>
            <div className={`space-y-2 ${isGasPriceFetching ? 'animate-pulse disabled' : ''}`}>
              <Label>Estimated Gas Fee</Label>
              <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                <span className="text-sm">{gasPrice ? `${formatEther(gasPrice, 'gwei')} Gwei` : 'Loading...'}</span>{' '}
                {gasPrice ? <span className="text-xs">({formatEther(gasPrice, 'wei')} ETH)</span> : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isGasPriceFetching) {
                      refetchGasPrice();
                    }
                  }}
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            <Button variant="default" className="w-full" type="submit">
              Transfer
            </Button>
          </Form>
        </Formik>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
