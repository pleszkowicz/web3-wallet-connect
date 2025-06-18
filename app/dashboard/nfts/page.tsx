'use client';
import dynamic from 'next/dynamic';

const LazyNftList = dynamic(() => import('@/components/nft/NftList').then((module) => module.NftList), {
  ssr: false,
});

export default function NftsPage() {
  return <LazyNftList />;
}
