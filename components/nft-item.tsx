'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { useQuery } from '@tanstack/react-query';
import { EditIcon, LoaderIcon, ShieldCheck, Tag } from 'lucide-react';
import Image from 'next/image';
import { useAccount, useReadContract, useTransactionCount, useWriteContract } from 'wagmi';
import { Button } from './ui/button';
import { formatEther, parseEther } from 'viem';
import { Nft, NftMeta } from '@/types/NFT';
import { Badge } from './ui/badge';
import { useToast } from './ui/hooks/use-toast';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';
import { useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const NftItem = ({ tokenId, price, owner }: Nft) => {
  const { data: tokenURI, isLoading } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  const { data: tokenDetails } = useQuery<NftMeta, Error>({
    queryKey: ['token-details', tokenId.toString()],
    queryFn: async () => {
      if (!tokenURI) {
        return;
      }
      const response = await fetch(tokenURI);
      return response.json();
    },
    enabled: !!tokenURI,
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

  const { data: approvedAddress } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getApproved',
    args: [BigInt(tokenId)],
  });

  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { toast } = useToast();
  const { data: transactionCount } = useTransactionCount({ address });
  
  const [isSaleApproved, setIsSaleApproved] = useState(false);
  const isOwned = owner === address;

  useEffect(() => {
    setIsSaleApproved(approvedAddress?.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase());
  }, [approvedAddress]);

  const toggleApprove = async () => {
    const addressToApprove = isSaleApproved ? ZERO_ADDRESS : NFT_MARKETPLACE_ADDRESS;

    await writeContract(
      {
        address: NFT_MARKETPLACE_ADDRESS,
        abi: NFT_MARKET_CONTRACT_ABI,
        functionName: 'approve',
        args: [addressToApprove, BigInt(tokenId)],
        nonce: transactionCount, // fix for passing the correct nonce in hardhat network
      },
      {
        onSuccess: () => {
          toast({ title: isSaleApproved ? 'NFT sell approval withdrawn!' : 'NFT approved to sell!' });
          setIsSaleApproved(!isSaleApproved);
        },
        onError: (error: unknown) => {
          console.log('error', error);
          toast({
            title: 'Approval change failed',
            description: 'Please try again later.',
          });
        },
      }
    );
  };

  return (
    <div className='flex flex-col w-full'>
      <div className="flex items-center rounded-lg overflow-hidden flex-col gap-2 relative group">
        {isLoading || tokenDetails === undefined ? (
          <LoaderIcon />
        ) : (
          <>
            {/* <div className="relative w-full h-full"> */}
            <Image
              loading="lazy"
              src={tokenDetails.image}
              alt={tokenDetails.name || 'NFT Image'}
              className=" w-full aspect-square object-cover transform transition-transform duration-1000 group-hover:scale-110"
              width={192}
              height={192}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 cursor-default">
              {isOwned && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:normal-case">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Owned
                </Badge>
              )}
              {isSaleApproved && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Tag className="h-3 w-3 mr-1" />
                  For Sale
                </Badge>
              )}
            </div>

            <div className="absolute bottom-0 left-0 p-2 w-full flex flex-row items-end gap-1 z-10 text-white text-left bg-gradient-to-b from-transparent to-black bg-opacity-100">
              <div>
                <h3 className="text-sm font-semibold">{tokenDetails.name}</h3>
                <p className="text-sm text-white flex flex-row">{tokenDetails.description}</p>

                <NftPrice tokenId={tokenId} price={price} isOwned={isOwned} />
              </div>
            </div>
            {/* </div> */}

            {/* <Button variant="outline" size="sm" className="mt-3" disabled>
            Buy (coming soon)
          </Button> */}
          </>
        )}
      </div>
      <div className="w-full mt-2">
        {isOwned && (
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={toggleApprove}
            disabled={isPending}
          >
            {isSaleApproved ? 'Withdraw Approval' : 'Approve to sell'}
          </Button>
        )}
      </div>
    </div>
  );
};

type NftPriceProps = Pick<Nft, 'tokenId' | 'price'> & {
  isOwned: boolean;
};

const NftPrice = ({ tokenId, price, isOwned }: NftPriceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [priceValue, setPriceValue] = useState(price);
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { toast } = useToast();
  const { data: transactionCount } = useTransactionCount({ address });

  // I want to show max 5 decimal places
  const formattedPrice = (parseFloat(priceValue.toString()) / 1e18).toFixed(5);;

  const validationSchema: Yup.ObjectSchema<{ price: number }> = Yup.object().shape({
    price: Yup.number()
      .required('Price is required')
      // .positive('Price must be positive')
      .test('max-decimal', 'Price must have at most 18 decimal places', (value) => {
        if (value) {
          const decimalPlaces = value.toString().split('.')[1]?.length || 0;
          return decimalPlaces <= 18;
        }
      }),
  });

  return (
    <div className="flex flex-row">
      <span className="text-sm text-white display-inline">{formattedPrice} ETH</span>
      {isOwned && (
        <Formik
          initialValues={{ price: formatEther(price) }}
          onSubmit={async (values) => {
            await writeContract(
              {
                address: NFT_MARKETPLACE_ADDRESS,
                abi: NFT_MARKET_CONTRACT_ABI,
                functionName: 'updatePrice',
                args: [BigInt(tokenId), parseEther(values.price)],
                nonce: transactionCount, // fix for passing the correct nonce in hardhat network
              },
              {
                onSuccess: () => {
                  toast({ title: 'NFT listing price updated!' });
                  setIsEditing(false);
                },
                onError: (error: unknown) => {
                  console.log('error', error);
                  toast({
                    title: 'Price update failed',
                    description: 'Please try again later.',
                  });
                },
              }
            );
            setPriceValue(parseEther(values.price));
          }}
          validationSchema={validationSchema}
          validateOnBlur={false}
        >
          {({ isSubmitting, submitForm }) => (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <span title="Edit NFT price">
                  <EditIcon className="h-4 w-4 ml-1 cursor-pointer" xlinkTitle="dsdds ds" />
                </span>
              </DialogTrigger>
              <Form aria-disabled={isSubmitting}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit NFT price</DialogTitle>
                    <DialogDescription>
                      Once you submit, you will be asked to confirm the transaction in your wallet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="price">Price in ETH</Label>
                      <Field as={Input} id="price" name="price" type="number" placeholder="Price" />
                      <ErrorMessage name="price" component="div" className="text-red-500" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} onClick={submitForm}>
                      Update Price
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </div>
  );
};
