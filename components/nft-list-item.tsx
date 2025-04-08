'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { useQuery } from '@tanstack/react-query';
import { LoaderIcon, ShieldCheck, Tag } from 'lucide-react';
import Image from 'next/image';
import { useAccount, useReadContract } from 'wagmi';
import { Nft, NftMeta } from '@/types/NFT';
import { Badge } from './ui/badge';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';
import { useEffect, useState } from 'react';
import Link from 'next/link';


export const NftListItem = ({ tokenId, price, owner }: Nft) => {
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

  const [isSaleApproved, setIsSaleApproved] = useState(false);
  const isOwned = owner === address;
  const formattedPrice = (parseFloat(price.toString()) / 1e18).toFixed(5);

  useEffect(() => {
    setIsSaleApproved(approvedAddress?.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase());
  }, [approvedAddress]);

  return (
    <div className="flex flex-col w-full">
      <Link href={`/nft/${tokenId}`} className="">
        <div className="flex items-center rounded-lg overflow-hidden flex-col gap-2 relative group">
          {isLoading || tokenDetails === undefined ? (
            <LoaderIcon />
          ) : (
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

                  <span className="text-sm text-white display-inline">{formattedPrice} ETH</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};
