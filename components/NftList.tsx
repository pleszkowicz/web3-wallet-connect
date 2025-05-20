'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { Nft } from '@/types/NFT';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { NftListItem } from './NftListItem';
import { Button } from './ui/button';
import { Loader } from './ui/loader';

export const NftList = () => {
  const {
    data: nfts,
    isLoading,
    isFetched,
    error,
  } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getAllNfts',
  });

  return (
    <>
      <div className="flex flex-wrap">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">Error fetching NFTs: Please check your connection or try again later.</p>
        ) : nfts && nfts.length > 0 ? (
          nfts.map((nft: Nft) => (
            <div key={nft.tokenId} className="flex flex-col justify-between p-2 text-center w-1/3 min-w-[180px]">
              <NftListItem tokenId={nft.tokenId} price={nft.price} owner={nft.owner} />
            </div>
          ))
        ) : (
          <p className="w-full text-gray-400 mt-4">You don't own any NFTs yet.</p>
        )}
      </div>
      {isFetched && (
        <Button asChild variant="default" className="w-full mt-5">
          <Link href="/nft/create">
            <Plus /> Mint new NFT
          </Link>
        </Button>
      )}
    </>
  );
};
