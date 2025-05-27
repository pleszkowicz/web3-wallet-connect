'use client';
import { NftListItem } from '@/components/nft/NftListItem';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace/nft-marketplace-abi';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace/nft-marketplace-address';
import { Nft } from '@/types/NFT';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';

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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">NFT Collection</h3>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <p className="text-red-500">Unable to show NFTs, please check your connection or try again later.</p>
      ) : nfts && nfts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
          {nfts.map((nft: Nft) => (
            <div key={nft.tokenId} className="flex flex-col justify-between text-center">
              <NftListItem tokenId={nft.tokenId} price={nft.price} owner={nft.owner} />
            </div>
          ))}
        </div>
      ) : (
        <p className="w-full text-gray-400 mt-4">No NFTs created.</p>
      )}
      {isFetched && (
        <Button asChild variant="default" className="w-full mt-5">
          <Link href="/nft/create">
            <Plus /> Mint new NFT
          </Link>
        </Button>
      )}
    </div>
  );
};
