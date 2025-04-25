import { ContentLayout } from '@/components/ContentLayout';
import { NftDetails } from '@/components/NftDetails';

export default async function NftItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tokenId } = await params;

  return (
    <ContentLayout title="NFT details" showBackButton>
      <NftDetails tokenId={BigInt(tokenId)} />
    </ContentLayout>
  );
}
