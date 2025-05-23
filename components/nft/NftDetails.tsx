'use client';
import { NftStatusHelper } from '@/components/nft/NftStatusHelper';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form/FormError';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { Nft, NftMeta } from '@/types/NFT';
import { useQuery } from '@tanstack/react-query';
import { Field, Form, Formik } from 'formik';
import { Check, EditIcon, LoaderIcon, ShoppingCart, Undo2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { formatEther, parseEther } from 'viem';
import { useAccount, usePublicClient, useReadContract, useTransactionCount, useWriteContract } from 'wagmi';
import * as Yup from 'yup';

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
    return <Loader />;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
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
  const client = usePublicClient();
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
  const { writeContractAsync, isPending } = useWriteContract();
  const { toast } = useToast();
  const { data: transactionCount } = useTransactionCount({ address });

  const [isSaleApproved, setIsSaleApproved] = useState(false);
  const isOwned = owner === address;

  useEffect(() => {
    setIsSaleApproved(approvedAddress?.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase());
  }, [approvedAddress]);

  const toggleApprove = async () => {
    try {
      const addressToApprove = isSaleApproved ? ZERO_ADDRESS : NFT_MARKETPLACE_ADDRESS;

      const txHash = await writeContractAsync({
        address: NFT_MARKETPLACE_ADDRESS,
        abi: NFT_MARKET_CONTRACT_ABI,
        functionName: 'approve',
        args: [addressToApprove, BigInt(tokenId)],
        nonce: transactionCount, // fix for passing the correct nonce in hardhat network
      });

      toast({
        title: `NFT sell ${isSaleApproved ? 'withdrawal' : 'approval'} initiated!`,
        description: 'Waiting for confirmation on the blockchain',
      });
      setIsSaleApproved(!isSaleApproved);

      await client?.waitForTransactionReceipt({ hash: txHash });
      toast({ title: 'NFT confirmed on the blockchain!' });
    } catch (error) {
      if ((error as Error)?.message?.includes('User rejected the request')) {
        return;
      }
      console.log('error', error);

      toast({
        title: 'Approval change failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleBuyNft = async () => {
    await writeContractAsync(
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
          toast({ title: 'NFT successfully purchased!' });
        },
        onError: (error) => {
          console.error('Purchase error:', error);
          toast({
            title: 'Purchase failed',
            description: 'Please try again later.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="flex w-full flex-col">
      <div className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-lg">
        {isLoading || tokenDetails === undefined ? (
          <LoaderIcon />
        ) : (
          <>
            <div className="relative h-full w-full">
              <Image
                priority={true}
                src={tokenDetails.image}
                alt={tokenDetails.name || 'NFT Image'}
                className="pointer aspect-square w-full transform object-cover transition-transform duration-1000 group-hover:scale-110"
                width={622}
                height={622}
              />
            </div>
            <div className="absolute top-2 right-2 flex flex-row gap-1 z-10 cursor-default">
              {isOwned && <NftStatusHelper variant="owner" />}
              {isSaleApproved && <NftStatusHelper variant="for-sale" />}
            </div>

            <div className="absolute bottom-0 left-0 z-10 flex w-full flex-row items-end gap-1 bg-opacity-100 bg-gradient-to-b from-transparent to-black p-4 text-left text-white">
              <div className="">
                <h2 className="font-bold text-3xl text-slate-100">{tokenDetails.name}</h2>
                <p className="text-xl text-slate-200">{tokenDetails.description}</p>
                <NftPrice tokenId={tokenId} price={price} isOwned={isOwned} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-6 w-full">
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
    <div className="flex flex-row align-middle font-semibold text-green-300">
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
                    variant: 'destructive',
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
                <span className="flex flex-row items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <EditIcon className="ml-1 h-5 w-5 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set Your NFT Price</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </DialogTrigger>
              <Form aria-disabled={isSubmitting || isWriteContractPending}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Set Your NFT Price</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="price">Price (ETH)</Label>
                      <Field as={Input} id="price" name="price" type="string" placeholder="Price" />
                      <FormError name="price" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm"> Once saved, you’ll confirm the transaction in your wallet.</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isWriteContractPending} onClick={submitForm}>
                      Save Price
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
