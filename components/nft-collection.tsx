'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { Address, formatEther } from 'viem';
import { useReadContract } from 'wagmi';
import { Button } from './ui/button';
import invariant from 'tiny-invariant';
import { NFT } from '@/types/NFT';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { LoaderIcon } from 'lucide-react';

export const NftCollection = () => {
  invariant(
    process.env.NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS,
    'NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS is required'
  );

  const { data: nfts, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS as Address,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getAllNFTs',
  });

  return (
    <>
      <div className="flex flex-wrap">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {nfts?.map((nft) => (
              <div key={nft.tokenId} className="flex flex-col justify-between p-4 text-center w-1/3 min-w-[180px]">
                <NftItem tokenId={nft.tokenId.toString()} price={nft.price} />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

const NftItem = ({ tokenId, price }: { tokenId: string; price: bigint }) => {
  const { data: tokenURI, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_CUSTOM_NFT_MARKETPLACE_SMART_CONTRACT_ADDRESS as Address,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  const { data: tokenDetails } = useQuery<NFT, Error>({
    queryKey: ['token-details', tokenId],
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

  return (
    <>
      <div className="flex items-center flex-col gap-2">
        {isLoading || tokenDetails === undefined ? (
          <LoaderIcon />
        ) : (
          <>
            <Image
              loading="lazy"
              src={tokenDetails.image}
              alt={tokenDetails.name || 'NFT Image'}
              className="w-12 h-12 rounded-lg"
              width={50}
              height={50}
            />
            <div>
              <h3 className="text-sm font-semibold">{tokenDetails.name}</h3>
              <p className="text-sm text-muted-foreground">{tokenDetails.description}</p>
            </div>
            <p className="text-sm text-muted-foreground">Price: {formatEther(price)} ETH</p>

            <Button variant="outline" size="sm" className="mt-3" disabled>
              Buy (coming soon)
            </Button>
          </>
        )}
      </div>
    </>
  );
};
