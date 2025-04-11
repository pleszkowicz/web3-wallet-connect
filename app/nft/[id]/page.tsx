import { CardLayout } from '@/components/card-layout';
import { NftDetails } from '@/components/nft-details';
import NFTDetailsPage from '@/components/nft-test';

export default async function NftItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tokenId } = await params;

  return (
    <CardLayout title="NFT details" showBackButton>
      <NftDetails tokenId={BigInt(tokenId)} />
      {/* <NFTDetailsPage /> */}
    </CardLayout>
  );
}
