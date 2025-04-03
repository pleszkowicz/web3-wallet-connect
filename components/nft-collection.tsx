'use client';
import { NFT_MARKET_CONTRACT_ABI } from '@/const/nft-marketplace-abi';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import invariant from 'tiny-invariant';
import { Loader } from './ui/loader';
import { NftItem } from './nft-item';

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
          <Loader>Loading...</Loader>
        ) : nfts && nfts.length > 0 ? (
          nfts.map((nft) => (
            <div key={nft.tokenId} className="flex flex-col justify-between p-4 text-center w-1/3 min-w-[180px]">
              <NftItem tokenId={nft.tokenId.toString()} price={nft.price} />
            </div>
          ))
        ) : (
          <p className="w-full text-sm text-muted-foreground mt-4">No NFTs yet</p>
        )}{' '}
      </div>
    </>
  );
};
