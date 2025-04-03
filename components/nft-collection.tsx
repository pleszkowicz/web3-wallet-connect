'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { useReadContract } from 'wagmi';
import { Loader } from './ui/loader';
import { NftItem } from './nft-item';
import { Nft } from '@/types/NFT';
import { NFT_MARKETPLACE_ADDRESS } from '@/const/nft-marketplace-address';

export const NftCollection = () => {
  const { data: nfts, isLoading } = useReadContract({
    address: NFT_MARKETPLACE_ADDRESS,
    abi: NFT_MARKET_CONTRACT_ABI,
    functionName: 'getAllNFTs',
  });

  return (
    <>
      <div className="flex flex-wrap">
        {isLoading ? (
          <Loader>Loading...</Loader>
        ) : nfts && nfts.length > 0 ? (
          nfts.map((nft: Nft) => (
            <div key={nft.tokenId} className="flex flex-col justify-between p-4 text-center w-1/3 min-w-[180px]">
              <NftItem tokenId={nft.tokenId} price={nft.price} owner={nft.owner} isForSale={nft.isForSale} />
            </div>
          ))
        ) : (
          <p className="w-full text-sm text-muted-foreground mt-4">No NFTs yet</p>
        )}{' '}
      </div>
    </>
  );
};
