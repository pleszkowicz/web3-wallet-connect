'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { useReadContract } from 'wagmi';
import { Loader } from './ui/loader';
import { Nft } from '@/types/NFT';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';
import { NftListItem } from './nft-list-item';

export const NftList = () => {
  const { data: nfts, isLoading, error } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getAllNfts',
  });

  return (
    <>
      <div className="flex flex-wrap">
        {isLoading ? (
          <Loader>Loading...</Loader>
        ) : error ? (
          <p className="text-red-500">Error fetching NFTs: Please check your connection or try again later.</p>
        ) : nfts && nfts.length > 0 ? (
          nfts.map((nft: Nft) => (
            <div key={nft.tokenId} className="flex flex-col justify-between p-2 text-center w-1/3 min-w-[180px]">
              <NftListItem tokenId={nft.tokenId} price={nft.price} owner={nft.owner} />
            </div>
          ))
        ) : (
          <p className="w-full text-muted-foreground mt-4">No NFTs yet</p>
        )}{' '}
      </div>
    </>
  );
};
