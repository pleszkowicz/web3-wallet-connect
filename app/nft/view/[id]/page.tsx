import { ContentLayout } from '@/components/ContentLayout';
import { NftDetails } from '@/components/nft/NftDetails';
import { PortfolioBalanceProvider } from '@/context/PortfolioBalanceProvider';

export default async function NftItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tokenId } = await params;

  return (
    <PortfolioBalanceProvider>
      <ContentLayout title="NFT details" goBackUrl="/dashboard/nfts">
        <NftDetails tokenId={BigInt(tokenId)} />
      </ContentLayout>
    </PortfolioBalanceProvider>
  );
}
