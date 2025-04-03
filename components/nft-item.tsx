'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { useQuery } from '@tanstack/react-query';
import { LoaderIcon, ShieldCheck, Tag } from 'lucide-react';
import Image from 'next/image';
import { useAccount, useReadContract, useTransactionCount, useWriteContract } from 'wagmi';
import { Button } from './ui/button';
import { formatEther } from 'viem';
import { Nft, NftMeta } from '@/types/NFT';
import { Badge } from './ui/badge';
import { useToast } from './ui/hooks/use-toast';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';

export const NftItem = ({ tokenId, price, isForSale, owner }: Nft) => {
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
  const { writeContract } = useWriteContract();
  const { toast } = useToast();
  const { data: transactionCount } = useTransactionCount({ address });

  const isApproved = approvedAddress?.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase();
  const isOwned = owner === address;

  return (
    <div className="flex items-center flex-col gap-2">
      {isLoading || tokenDetails === undefined ? (
        <LoaderIcon />
      ) : (
        <>
          <div className="relative w-12 h-12">
            <Image
              loading="lazy"
              src={tokenDetails.image}
              alt={tokenDetails.name || 'NFT Image'}
              className="w-full aspect-square object-cover rounded-lg overflow-hidden"
              width={50}
              height={50}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {isOwned && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Owned
                </Badge>
              )}
              {isForSale && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Tag className="h-3 w-3 mr-1" />
                  For Sale
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{tokenDetails.name}</h3>
            <p className="text-sm text-muted-foreground">{tokenDetails.description}</p>
          </div>
          <p className="text-sm text-muted-foreground">Price: {formatEther(price)} ETH</p>

          <Button variant="outline" size="sm" className="mt-3" disabled>
            Buy (coming soon)
          </Button>

          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={async () => {
              const addressToApprove = isApproved
                ? '0x0000000000000000000000000000000000000000'
                : NFT_MARKETPLACE_ADDRESS;

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
                    toast({ title: isApproved ? 'NFT sell approval withdrawn!' : 'NFT approved to sell!' });
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
            }}
          >
            {isApproved ? 'Withdraw Approval' : 'Approve to sell'}
          </Button>
        </>
      )}
    </div>
  );
};
