'use client';
import { NftStatusHelper } from '@/components/nft/NftStatusHelper';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { Prisma } from '@/lib/generated/prisma';
import { Nft, NftMeta } from '@/types/NFT';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export const NftListItem = ({ tokenId, price, owner }: Nft) => {
  const { data: tokenURI, isLoading } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  const {
    data: tokenDetails,
    isLoading: isLoadingTokenDetails,
    error: tokenDetailsError,
  } = useQuery<Prisma.NftGetPayload<false>, Error>({
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

  const [isSaleApproved, setIsSaleApproved] = useState(false);
  const isOwned = owner === address;

  useEffect(() => {
    setIsSaleApproved(approvedAddress?.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase());
  }, [approvedAddress]);

  return (
    <NftListItemUI
      tokenId={tokenId}
      tokenDetailsError={tokenDetailsError}
      isLoading={isLoading || isLoadingTokenDetails}
      tokenDetails={tokenDetails}
      isOwned={isOwned}
      isSaleApproved={isSaleApproved}
      price={price}
    />
  );
};

type NftListItemUIProps = {
  tokenId: Nft['tokenId'];
  tokenDetailsError?: ReturnType<typeof useQuery>['error'];
  isLoading: boolean;
  tokenDetails?: NftMeta;
  isOwned: boolean;
  isSaleApproved: boolean;
  price?: bigint;
};

export const NftListItemUI = ({
  tokenId,
  tokenDetailsError,
  isLoading,
  tokenDetails,
  isOwned,
  isSaleApproved,
  price,
}: NftListItemUIProps) => {
  return (
    <div className="flex flex-col w-full animate-fade-in opacity-0">
      <Link href={`/nft/view/${tokenId}`}>
        <div className="flex items-center rounded-lg overflow-hidden flex-col gap-2 relative group">
          {tokenDetailsError ? (
            <span className="text-red-500 text-sm text-center">Failed to load metadata</span>
          ) : isLoading ? (
            <div className="w-full aspect-square animate-pulse rounded-lg bg-muted" />
          ) : !tokenDetails ? null : (
            <>
              <div className="relative w-full h-full">
                <Image
                  loading="lazy"
                  priority={false}
                  src={tokenDetails.image}
                  alt={tokenDetails.name || 'NFT Image'}
                  className="pointer w-full aspect-square object-cover transform transition-transform duration-1000 group-hover:scale-110"
                  width={192}
                  height={192}
                />
              </div>
              <div className="absolute top-2 right-2 flex flex-row gap-1 z-10 cursor-default">
                {isOwned && <NftStatusHelper variant="owner" />}
                {isSaleApproved && <NftStatusHelper variant="for-sale" />}
              </div>

              <div className="absolute bottom-0 left-0 p-2 w-full flex flex-row items-end gap-1 z-10 text-white text-left bg-gradient-to-b from-transparent to-black bg-opacity-100">
                <div className="w-full">
                  <h3 className="text-sm font-semibold truncate overflow-hidden whitespace-nowrap">
                    <b>{tokenDetails.name}</b>
                  </h3>

                  <p className="text-sm text-white truncate overflow-hidden whitespace-nowrap">
                    {tokenDetails.description}
                  </p>

                  <p className="mt-1 text-lg text-green-300 font-semibold display-inline">
                    <b>{price && formatEther(price)} ETH</b>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};
