'use client';
import { ContentCard } from '@/components/ContentCard';
import { NftListItemUI } from '@/components/nft/NftListItem';
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
import { shrotenAddress } from '@/lib/shortenAddress';
import { Nft, NftMeta } from '@/types/NFT';
import { useQuery } from '@tanstack/react-query';
import { Field, Form, Formik } from 'formik';
import { Check, CheckIcon, CopyIcon, EditIcon, ShoppingCart, Undo2 } from 'lucide-react';
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
    args: [tokenId],
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
  const { data: tokenURI, isLoading: isTokenUriLoading } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  const { data: tokenDetails, error: tokenDetailsError } = useQuery<NftMeta, Error>({
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

  const { address, chain } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isAddressCopiedIconVisible, setIsAddressCopiedIconVisible] = useState(false);
  const { toast } = useToast();
  const { data: transactionCount } = useTransactionCount({ address });

  const [isSaleApproved, setIsSaleApproved] = useState(false);
  const isOwned = owner === address;

  useEffect(() => {
    if (isAddressCopiedIconVisible) {
      const timer = setTimeout(() => {
        setIsAddressCopiedIconVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAddressCopiedIconVisible]);

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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">NFT Details</h3>

      <div className="grid gap-8 md:grid-cols-2">
        <NftListItemUI
          tokenId={tokenId}
          price={price}
          tokenDetails={tokenDetails}
          isLoading={isTokenUriLoading}
          isOwned={isOwned}
          isSaleApproved={isSaleApproved}
          tokenDetailsError={tokenDetailsError}
          isPreview
        />

        <ContentCard title="NFT Details" className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Contract Address</span>
            <div className="flex items-center gap-2 wrap">
              <span className="text-white font-mono text-sm">{shrotenAddress(NFT_MARKETPLACE_ADDRESS)}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      navigator.clipboard.writeText(address as string);
                      setIsAddressCopiedIconVisible(true);
                    }}
                  >
                    {isAddressCopiedIconVisible ? (
                      <CheckIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <CopyIcon className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAddressCopiedIconVisible ? 'Copied!' : 'Copy to clipboard'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Token ID</span>
            <span className="text-white">{tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Token Standard</span>
            <span className="text-white">ERC-721</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Blockchain</span>
            <span className="text-white">{chain?.name}</span>
          </div>

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
        </ContentCard>
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
                <DialogContent aria-describedby="dialog-content" className="sm:max-w-[425px]">
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
