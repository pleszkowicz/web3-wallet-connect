'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { useQuery } from '@tanstack/react-query';
import { Check, EditIcon, LoaderIcon, ShieldCheck, ShoppingCart, Tag, Undo2 } from 'lucide-react';
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
import { Loader } from './ui/loader';
import { useRouter } from 'next/navigation';
import invariant from 'tiny-invariant';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type NftDetailsProps = Pick<Nft, 'tokenId'>;

export const NftDetails = ({ tokenId }: NftDetailsProps) => {
  const {
    data: nft,
    isLoading,
    error,
  } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getNftById',
    args: [BigInt(tokenId)],
  });

  if (isLoading) {
    return <Loader>Loading...</Loader>;
  }

  if (error) {
    return (
      <p className="text-red-500 text-sm">
        An unexpected error occurred. Please check your connection or try again later.
      </p>
    );
  }

  invariant(nft, 'NFT data is undefined');

  return <NftItem tokenId={nft.tokenId} owner={nft.owner} price={nft.price} />;
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

type NftItemProps = Pick<Nft, 'tokenId' | 'owner' | 'price'>;
const NftItem = ({ tokenId, owner, price }: NftItemProps) => {
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
  });

  const { data: approvedAddress, refetch: refetchGetApproved } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getApproved',
    args: [BigInt(tokenId)],
  });

  const router = useRouter();
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

  const handleBuyNft = async () => {
    await writeContract(
      {
        address: NFT_MARKETPLACE_ADDRESS,
        abi: NFT_MARKET_CONTRACT_ABI,
        functionName: 'executeSale',
        args: [BigInt(tokenId)],
        value: BigInt(price),
      },
      {
        onSuccess: () => {
          refetchGetApproved();
          toast({ title: 'NFT purchased successfully!' });
          router.push('/');
        },
        onError: (error) => {
          console.error('Purchase error:', error);
          toast({
            title: 'Purchase failed',
            description: 'Please try again later.',
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center rounded-lg overflow-hidden flex-col gap-2 relative group">
        {isLoading || tokenDetails === undefined ? (
          <LoaderIcon />
        ) : (
          <>
            <div className="relative w-full h-full">
              <Image
                priority={true}
                src={tokenDetails.image}
                alt={tokenDetails.name || 'NFT Image'}
                className="pointer w-full aspect-square object-cover transform transition-transform duration-1000 group-hover:scale-110"
                width={622}
                height={622}
              />
            </div>
            <div className="absolute top-0 left-0 p-4 flex flex-col gap-1 z-10 cursor-default">
              {isSaleApproved && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                  <Tag className="h-3 w-3 mr-1" />
                  For Sale
                </Badge>
              )}
            </div>

            <div className="absolute bottom-0 left-0 p-4 w-full flex flex-row items-end gap-1 z-10 text-white text-left bg-gradient-to-b from-transparent to-black bg-opacity-100">
              <div className="">
                <h2 className="font-bold text-slate-100">{tokenDetails.name}</h2>
                <p className="text-sm text-slate-200">{tokenDetails.description}</p>
                <div className="text-sm mt-2 mb-2 text-slate-300">
                  {isOwned ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:normal-case">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Owned
                    </Badge>
                  ) : (
                    <span>Owner: {owner}</span>
                  )}
                </div>
                <NftPrice tokenId={tokenId} price={price} isOwned={isOwned} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="w-full mt-6">
        {isOwned && (
          <Button
            variant={isSaleApproved ? 'destructive' : 'default'}
            className="w-full"
            type="button"
            onClick={toggleApprove}
            disabled={isPending}
          >
            {isSaleApproved ? <Undo2 className="mr-2" /> : <Check className="mr-2" />}
            {isSaleApproved ? 'Revoke from Sale' : 'Approve to Sell'}
          </Button>
        )}

        {!isOwned && isSaleApproved && (
          <Button variant="default" className="w-full" type="button" disabled={isPending} onClick={handleBuyNft}>
            <ShoppingCart className="mr-2" /> Buy
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
  const [priceValue, setPriceValue] = useState(formatEther(price));
  const { address } = useAccount();
  const { writeContract, isPending: isWriteContractPending } = useWriteContract();
  const { toast } = useToast();
  const { data: transactionCount } = useTransactionCount({ address });

  const validationSchema: Yup.ObjectSchema<{ price: string }> = Yup.object().shape({
    price: Yup.string()
      .required('Price is required')
      .test('max-decimal', 'Price must have at most 18 decimal places', (value) => {
        if (value) {
          const decimalPlaces = value.toString().split('.')[1]?.length || 0;
          return decimalPlaces <= 18;
        }
        return true;
      }),
  });

  return (
    <div className="flex flex-row text-green-300 font-semibold align-middle">
      <h3 className="display-inline text-lg">{priceValue} ETH</h3>
      {isOwned && (
        <Formik
          initialValues={{ price: formatEther(price) }}
          onSubmit={async (values) => {
            const priceInWei = parseEther(values.price.toString()); // Ensure the value is a string
            await writeContract(
              {
                address: NFT_MARKETPLACE_ADDRESS,
                abi: NFT_MARKET_CONTRACT_ABI,
                functionName: 'updatePrice',
                args: [BigInt(tokenId), priceInWei],
                nonce: transactionCount, // fix for passing the correct nonce in hardhat network
              },
              {
                onSuccess: () => {
                  setPriceValue(formatEther(priceInWei)); // Update the displayed price
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
          }}
          validationSchema={validationSchema}
          validateOnBlur={false}
        >
          {({ isSubmitting, submitForm }) => (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex flex-row items-center" title="Edit NFT price">
                      <EditIcon className="h-5 w-5 ml-1 cursor-pointer" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit price</p>
                  </TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <Form aria-disabled={isSubmitting || isWriteContractPending}>
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
                      <Field as={Input} id="price" name="price" type="string" placeholder="Price" />
                      <ErrorMessage name="price" component="div" className="text-red-500" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isWriteContractPending} onClick={submitForm}>
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
