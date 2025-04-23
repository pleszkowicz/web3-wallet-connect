import { CardLayout } from '@/components/CardLayout';
import { NftDetails } from '@/components/NftDetails';

export default async function NftItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tokenId } = await params;

  return (
    <CardLayout title="NFT details" showBackButton>
      <NftDetails tokenId={BigInt(tokenId)} />
      {/* <NFTDetailsPage /> */}
    </CardLayout>
  );
}
