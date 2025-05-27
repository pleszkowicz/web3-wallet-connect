import { NftDetails } from '@/components/nft/NftDetails';

export default async function NftItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tokenId } = await params;

  return <NftDetails tokenId={BigInt(tokenId)} />;
}
