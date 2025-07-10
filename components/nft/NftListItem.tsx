'use client';
import { NftStatusHelper } from '@/components/nft/NftStatusHelper';
import { Loader } from '@/components/ui/loader';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { Prisma } from '@/lib/generated/prisma';
import { Nft, NftMeta } from '@/types/NFT';
import { useQuery } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

interface NftListItemProps extends Nft {
  isPreview?: boolean;
  hideLink?: boolean;
}

export const NftListItem = ({ tokenId, price, owner, isPreview, hideLink }: NftListItemProps) => {
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
      isPreview={isPreview}
      hideLink={hideLink}
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
  isPreview?: boolean;
  hideLink?: boolean;
};

export const NftListItemUI = ({
  tokenId,
  tokenDetailsError,
  isLoading,
  tokenDetails,
  isOwned,
  isSaleApproved,
  price,
  hideLink = false,
  isPreview = false,
}: NftListItemUIProps) => {
  return (
    <div className="animate-fade-in flex w-full flex-col overflow-hidden opacity-0 shadow-lg transition-all duration-200">
      <ConditionalLink href={hideLink ? undefined : `/dashboard/nfts/view/${tokenId}`}>
        <div
          className={`relative aspect-square rounded-xl border ${isPreview && 'border-dashed'} overflow-hidden border-gray-700 bg-gray-800/50`}
        >
          {tokenDetailsError ? (
            <span className="text-center text-sm text-red-500">Failed to load metadata</span>
          ) : isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                {isPreview && <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-600" />}
                <p className="text-sm text-gray-500">{isPreview ? 'Image preview' : <Loader />}</p>
              </div>
            </div>
          ) : !tokenDetails ? null : (
            <>
              <div className="relative h-full w-full">
                <Image
                  loading="lazy"
                  priority={false}
                  src={tokenDetails.image}
                  alt={tokenDetails.name || 'NFT Image'}
                  className="pointer aspect-square w-full transform object-cover transition-transform duration-1000 hover:scale-[1.02]"
                  width={192}
                  height={192}
                />
              </div>
              <div className="absolute top-2 right-2 z-10 flex cursor-default flex-row gap-1">
                {isOwned && <NftStatusHelper variant="owner" />}
                {isSaleApproved && <NftStatusHelper variant="for-sale" />}
              </div>

              <div className="bg-opacity-100 absolute top-[50%] bottom-0 left-0 z-10 flex w-full flex-row items-end gap-1 bg-linear-to-b from-transparent to-black p-2 text-left text-white">
                <div className="w-full">
                  <h3 className="truncate overflow-hidden text-sm font-semibold whitespace-nowrap">
                    <b>{tokenDetails.name}</b>
                  </h3>

                  <p className="truncate overflow-hidden text-sm whitespace-nowrap text-white">
                    {tokenDetails.description}
                  </p>

                  <p className="display-inline mt-1 text-lg font-semibold text-green-300">
                    <b>{price && formatEther(price)} ETH</b>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </ConditionalLink>
    </div>
  );
};

type ConditionalLinkProps = {
  href?: string;
  children: ReactNode;
};

const ConditionalLink = ({ href, children }: ConditionalLinkProps) => {
  if (!href) {
    return <Fragment>{children}</Fragment>;
  }
  return <Link href={href}>{children}</Link>;
};
